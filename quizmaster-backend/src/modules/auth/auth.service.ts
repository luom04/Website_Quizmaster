import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Tokens, RegisterResponse } from './types/tokens.type';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateRecoveryCode(): string {
    const part1 = randomBytes(2).toString('hex').toUpperCase();
    const part2 = randomBytes(2).toString('hex').toUpperCase();
    const part3 = randomBytes(2).toString('hex').toUpperCase();

    return `QM-${part1}-${part2}-${part3}`;
  }

  private async hashRecoveryCode(recoveryCode: string): Promise<string> {
    return bcrypt.hash(recoveryCode, 10);
  }

  private async verifyRecoveryCode(
    recoveryCode: string,
    recoveryCodeHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(recoveryCode, recoveryCodeHash);
  }

  async register(dto: AuthDto): Promise<RegisterResponse> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const recoveryCode = this.generateRecoveryCode();
    const recoveryCodeHash = await this.hashRecoveryCode(recoveryCode);

    try {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          recoveryCodeHash,
          recoveryCodeUpdatedAt: new Date(),
          name: dto.email.split('@')[0],
        },
      });

      return {
        recoveryCode,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Email already exists');
      }

      throw error;
    }
  }

  async login(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null, isActive: true },
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
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
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
      where: { id: userId, deletedAt: null, isActive: true },
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

  async resetPassword(
    email: string,
    recoveryCode: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!user || !user.recoveryCodeHash) {
      throw new ForbiddenException('Invalid recovery credentials');
    }

    const isRecoveryCodeValid = await this.verifyRecoveryCode(
      recoveryCode,
      user.recoveryCodeHash,
    );

    if (!isRecoveryCodeValid) {
      throw new ForbiddenException('Thông tin khôi phục không hợp lệ');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const newRecoveryCode = this.generateRecoveryCode();
    const newRecoveryCodeHash = await this.hashRecoveryCode(newRecoveryCode);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          recoveryCodeHash: newRecoveryCodeHash,
          recoveryCodeUpdatedAt: new Date(),
        },
      }),

      this.prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return {
      message: 'Password reset successfully',
      recoveryCode: newRecoveryCode,
    };
  }
}
