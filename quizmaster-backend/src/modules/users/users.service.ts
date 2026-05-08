import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdminUpdateUserDto,
  QueryUsersDto,
  UpdateProfileDto,
} from './dto/user.dto';

const USER_SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    await this.getMe(userId);

    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = dto.avatarUrl;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Không có dữ liệu để cập nhật.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SAFE_SELECT,
    });
  }

  async findAll(query: QueryUsersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      includeDeleted = false,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(includeDeleted ? {} : { deletedAt: null }),

      ...(role && {
        role,
      }),

      ...(typeof isActive === 'boolean' && {
        isActive,
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: USER_SAFE_SELECT,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...USER_SAFE_SELECT,
        _count: {
          select: {
            quizzes: true,
            attempts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateByAdmin(
    id: string,
    currentAdminId: string,
    dto: AdminUpdateUserDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deletedAt) {
      throw new BadRequestException(
        'User này đã bị xóa. Hãy restore trước khi cập nhật.',
      );
    }

    if (id === currentAdminId) {
      if (dto.role !== undefined && dto.role !== Role.admin) {
        throw new ForbiddenException(
          'Admin không thể tự hạ role của chính mình.',
        );
      }

      if (dto.isActive === false) {
        throw new ForbiddenException(
          'Admin không thể tự khóa tài khoản của chính mình.',
        );
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = dto.avatarUrl;
    }

    if (dto.role !== undefined) {
      data.role = dto.role;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Không có dữ liệu để cập nhật.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data,
        select: USER_SAFE_SELECT,
      });

      if (dto.isActive === false || dto.role !== undefined) {
        await tx.refreshToken.deleteMany({
          where: { userId: id },
        });
      }

      return updatedUser;
    });
  }

  async softDelete(id: string, currentAdminId: string) {
    if (id === currentAdminId) {
      throw new ForbiddenException(
        'Admin không thể tự xóa tài khoản của chính mình.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deletedAt) {
      throw new BadRequestException('User này đã bị xóa trước đó.');
    }

    return this.prisma.$transaction(async (tx) => {
      const deletedUser = await tx.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
        select: USER_SAFE_SELECT,
      });

      await tx.refreshToken.deleteMany({
        where: { userId: id },
      });

      return deletedUser;
    });
  }

  async restore(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('User này chưa bị xóa.');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
      },
      select: USER_SAFE_SELECT,
    });
  }
}
