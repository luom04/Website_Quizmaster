import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException('category name already exists');
    }
    return this.prisma.category.create({ data: createCategoryDto });
  }

  async findAll() {
    return await this.prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { quizzes: { where: { deletedAt: null } } } },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('category not found');
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async removePermanent(id: string) {
    //check xem tồn tại không
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { quizzes: true } } },
    });

    if (!category) throw new NotFoundException('category not found');
    //nếu đã tồn tại quiz
    if (category._count.quizzes > 0) {
      throw new ConflictException('Cannot be deleted');
    }
    await this.prisma.category.delete({
      where: { id },
    });
    return { message: 'Deleted successfully' };
  }

  async restore(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) throw new NotFoundException('category not found');
    return await this.prisma.category.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
