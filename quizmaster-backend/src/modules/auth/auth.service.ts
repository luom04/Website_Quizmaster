import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types/tokens.type';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { MailService } from './mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: AuthDto): Promise<Tokens> {
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          name: dto.email.split('@')[0], // Tạm lấy email làm tên
        },
      });

      const tokens = await this.getTokens(
        newUser.id,
        newUser.email,
        newUser.role,
      );
      await this.updateRtHash(newUser.id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Email already exists');
      }
      throw error;
    }
  }

  async login(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });
    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);

    // ❗ overwrite refresh token cũ → đá thiết bị cũ
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string) {
    // Xóa session để đá user ra khỏi hệ thống
    await this.prisma.refreshToken.delete({ where: { userId } });
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const userToken = await this.prisma.refreshToken.findUnique({
      where: { userId },
    });

    if (!userToken) throw new ForbiddenException('Access Denied');

    if (userToken.expiresAt < new Date()) {
      throw new ForbiddenException('Refresh token expired');
    }
    const isMatch = await bcrypt.compare(rt, userToken.token);

    if (!isMatch) throw new ForbiddenException('Access Denied');
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  // Cập nhật hoặc tạo mới Token (Single Session Logic)
  async updateRtHash(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Hạn 7 ngày

    await this.prisma.refreshToken.upsert({
      where: { userId },
      update: { token: hash, expiresAt },
      create: { userId, token: hash, expiresAt },
    });
  }

  async getTokens(userId: string, email: string, Role: Role): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role: Role },
        { secret: process.env.AT_SECRET, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role: Role },
        { secret: process.env.RT_SECRET, expiresIn: '7d' },
      ),
    ]);

    return { access_token: at, refresh_token: rt };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });
    if (!user) return; // Không tiết lộ email có tồn tại hay không

    const token = uuidv4();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Token có hạn 15 phút

    await this.prisma.passwordReset.upsert({
      where: { email },
      update: { token, expiresAt },
      create: {
        email,
        token,
        expiresAt,
      },
    });
    await this.mailService.sendResetPasswordEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new ForbiddenException('Invalid or expired token');
    }

    //kiểm tra xem user còn tồn tại không
    const user = await this.prisma.user.findFirst({
      where: { email: resetRecord.email, deletedAt: null },
    });
    if (!user) throw new ForbiddenException('User not found');

    const hash = await bcrypt.hash(newPassword, 10);

    //thực hiện cập nhật transaction: 1. cập nhật mật khẩu mới, 2. xóa token reset
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash },
      }),
      this.prisma.passwordReset.delete({
        where: { token },
      }),
    ]);
  }
}
