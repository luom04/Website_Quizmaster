import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/question.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestionType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    // 1. Kiểm tra logic: Phải có ít nhất một đáp án đúng
    const hasCorrectOption = createQuestionDto.options.some(
      (opt) => opt.isCorrect,
    );
    if (!hasCorrectOption)
      throw new BadRequestException('câu hỏi phải có ít nhất 1 đáp án đúng');

    // 2. Dùng Nested Create để tạo 1 lần ra cả Question và các Options
    return this.prisma.question.create({
      data: {
        content: createQuestionDto.content,
        type: createQuestionDto.type,
        points: createQuestionDto.points,
        categoryId: createQuestionDto.categoryId,
        options: {
          create: createQuestionDto.options,
        },
      },
      include: { options: true },
    });
  }

  async findAll(query: {
    pagination: PaginationDto;
    categoryId?: string;
    type?: QuestionType;
    search?: string;
  }) {
    const { pagination, categoryId, type, search } = query;
    const { page = 1, limit = 10 } = pagination;

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(search && {
        content: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        skip,
        take: limit,
        where,
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          category: { select: { name: true } },
          _count: { select: { quizQuestions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.question.count({ where }),
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

  //Lấy chi tiết kèm thống kê
  async findOne(id: string) {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: { options: true, category: true },
    });
    if (!question) throw new NotFoundException('Câu hỏi không tồn tại');
    return question;
  }

  async update(id: string, dto: CreateQuestionDto) {
    // check câu hỏi tồn tại?
    const question = await this.prisma.question.findUnique({
      where: { id, deletedAt: null },
    });

    if (!question) throw new NotFoundException('Question not found');

    //check logic đáp án đúng
    const hasCorrectOption = dto.options.some((opt) => opt.isCorrect);

    if (!hasCorrectOption)
      throw new BadRequestException(
        'The question must have at least one correct answer.',
      );
    // sử dụng Transaction để cạp nhật
    return this.prisma.$transaction(async (tx) => {
      //xóa tấc cả các option cũ của question này
      await tx.option.deleteMany({
        where: { questionId: id },
      });
      //update thông tin question và create các Options mới
      return tx.question.update({
        where: { id },
        data: {
          content: dto.content,
          type: dto.type,
          points: dto.points,
          categoryId: dto.categoryId,
          options: {
            create: dto.options,
          },
        },
        include: { options: true },
      });
    });
  }

  async remove(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id, deletedAt: null },
    });
    if (!question) throw new NotFoundException('Question not found');
    return this.prisma.question.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async removePermanent(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        _count: { select: { quizQuestions: true, answers: true } },
      },
    });

    if (!question) throw new NotFoundException('Câu hỏi không tồn tại');

    if (question._count.quizQuestions > 0 || question._count.answers > 0) {
      throw new BadRequestException(
        'Không thể xóa vĩnh viễn câu hỏi đã có dữ liệu thi hoặc nằm trong đề thi. Hãy dùng xóa mềm.',
      );
    }

    return this.prisma.question.delete({ where: { id } });
  }

  //import question
  async importQuestions(questions: CreateQuestionDto[]) {
    return this.prisma.$transaction(
      questions.map((q) =>
        this.prisma.question.create({
          data: {
            content: q.content,
            type: q.type,
            points: q.points,
            categoryId: q.categoryId,
            options: { create: q.options },
          },
        }),
      ),
    );
  }
}
