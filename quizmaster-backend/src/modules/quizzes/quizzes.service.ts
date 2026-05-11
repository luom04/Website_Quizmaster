import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AddQuestionToQuizDto,
  CreateQuizDto,
  QueryQuizAdminDto,
  QueryQuizDto,
  QuizSortBy,
  QuizStatus,
  SortOrder,
  UpdateQuizDto,
  VerifyQuizPasswordDto,
} from './dto/quiz.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccessMode, Prisma } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}
  private getPasswordExpiresAt() {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  private normalizeQuizDate(value?: string) {
    return value ? new Date(value) : undefined;
  }

  private validateQuizTime(startsAt?: string, endsAt?: string) {
    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      throw new BadRequestException(
        'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.',
      );
    }
  }

  private async ensureQuizExists(quizId: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quizId,
        deletedAt: null,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  private async ensureQuestionExists(questionId: string) {
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        deletedAt: null,
      },
    });

    if (!question) {
      throw new NotFoundException(`Question not found: ${questionId}`);
    }

    return question;
  }
  async create(userId: string, createQuizDto: CreateQuizDto) {
    this.validateQuizTime(createQuizDto.startsAt, createQuizDto.endsAt);

    if (createQuizDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: createQuizDto.categoryId,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }
    const accessMode = createQuizDto.accessMode ?? AccessMode.public;

    let passwordHash: string | null = null;
    let passwordPlain: string | null = null;
    let passwordPlainExpiresAt: Date | null = null;

    if (accessMode === AccessMode.password_required) {
      if (!createQuizDto.password) {
        throw new BadRequestException(
          'Quiz yêu cầu mật khẩu thì password không được để trống',
        );
      }
      passwordHash = await bcrypt.hash(createQuizDto.password, 10);
      passwordPlain = createQuizDto.password;
      passwordPlainExpiresAt = this.getPasswordExpiresAt();
    }

    //tạo quiz
    const { password, startsAt, endsAt, ...quizData } = createQuizDto;
    return await this.prisma.quiz.create({
      data: {
        ...quizData,
        accessMode,
        createdBy: userId,
        startsAt: this.normalizeQuizDate(createQuizDto.startsAt),
        endsAt: this.normalizeQuizDate(createQuizDto.endsAt),
        passwordHash,
        passwordPlain,
        passwordPlainExpiresAt,
      },
    });
  }
  async findAll(query: QueryQuizDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      isPublished,
      status,
      sortBy = QuizSortBy.CREATED_AT,
      order = SortOrder.DESC,
    } = query;

    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.QuizWhereInput = {
      deletedAt: null,
    };

    // 🔍 SEARCH
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ];
    }

    // 📂 CATEGORY FILTER
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 🔐 IS PUBLISHED
    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    // 🧠 STATUS FILTER
    if (status) {
      switch (status) {
        case QuizStatus.DRAFT:
          where.isPublished = false;
          break;

        case QuizStatus.UPCOMING:
          where.isPublished = true;
          where.startsAt = { gt: now };
          break;

        case QuizStatus.ONGOING:
          where.isPublished = true;
          where.AND = [
            {
              OR: [{ startsAt: { lte: now } }, { startsAt: null }],
            },
            {
              OR: [{ endsAt: { gte: now } }, { endsAt: null }],
            },
          ];
          break;

        case QuizStatus.ENDED:
          where.endsAt = { lt: now };
          break;

        case QuizStatus.DELETED:
          where.deletedAt = { not: null };
          break;
      }
    }

    const orderBy: Prisma.QuizOrderByWithRelationInput = {
      [sortBy]: order,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { name: true } },
          _count: { select: { quizQuestions: true } },
        },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      data: data.map((quiz) => ({
        ...quiz,
        status: this.getQuizStatus(quiz),
      })),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
  //You do not have permission to delete this Quiz. Get all Admin Quizzes (Including drafts and undeleted ones)

  async findAllAdmin(query: QueryQuizAdminDto) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const now = new Date();

    const where: Prisma.QuizWhereInput = {
      deletedAt: null,
    };

    if (status) {
      switch (status.toUpperCase()) {
        case 'DRAFT':
          where.isPublished = false;
          break;

        case 'UPCOMING':
          where.isPublished = true;
          where.startsAt = { gt: now };
          break;

        case 'ONGOING':
          where.isPublished = true;
          where.AND = [
            {
              OR: [{ startsAt: { lte: now } }, { startsAt: null }],
            },
            {
              OR: [{ endsAt: { gte: now } }, { endsAt: null }],
            },
          ];
          break;

        case 'ENDED':
          where.endsAt = { lt: now };
          break;

        case 'DELETED':
          where.deletedAt = { not: null };
          break;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { attempts: true, quizQuestions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      data: data.map((quiz) => ({
        ...quiz,
        status: this.getQuizStatus(quiz),
      })),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { quizQuestions: true } },
        creator: { select: { name: true, avatarUrl: true } },
        quizQuestions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            question: {
              include: {
                options: {
                  where: { deletedAt: null },
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    //Remove sensitive fields before returning them to the client.
    const { passwordHash, passwordPlain, ...publicQuiz } = quiz;
    return {
      ...publicQuiz,
      status: this.getQuizStatus(publicQuiz),
    };
  }

  async update(
    id: string,
    userId: string,
    role: string,
    updateQuizDto: UpdateQuizDto,
  ) {
    const quiz = await this.ensureQuizExists(id);
    //Only the creator of the content can edit it if they are not the Admin.
    if (role !== 'admin' && quiz.createdBy !== userId) {
      throw new ForbiddenException(
        'You do not have permission to edit this Quiz.',
      );
    }
    this.validateQuizTime(updateQuizDto.startsAt, updateQuizDto.endsAt);
    if (updateQuizDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateQuizDto.categoryId,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const { password, startsAt, endsAt, ...dtoData } = updateQuizDto;

    const data: Prisma.QuizUpdateInput = {
      ...dtoData,
    };

    if (startsAt !== undefined) {
      data.startsAt = this.normalizeQuizDate(startsAt);
    }

    if (endsAt !== undefined) {
      data.endsAt = this.normalizeQuizDate(endsAt);
    }

    if (updateQuizDto.accessMode === AccessMode.public) {
      data.passwordHash = null;
      data.passwordPlain = null;
      data.passwordPlainExpiresAt = null;
    }

    if (updateQuizDto.accessMode === AccessMode.password_required) {
      if (password) {
        data.passwordHash = await bcrypt.hash(password, 10);
        data.passwordPlain = password;
        data.passwordPlainExpiresAt = this.getPasswordExpiresAt();
      } else if (!quiz.passwordHash) {
        throw new BadRequestException(
          'Quiz chuyển sang chế độ mật khẩu thì cần gửi password.',
        );
      }
    }

    if (!updateQuizDto.accessMode && password) {
      data.passwordHash = await bcrypt.hash(password, 10);
      data.passwordPlain = password;
      data.passwordPlainExpiresAt = this.getPasswordExpiresAt();
      data.accessMode = AccessMode.password_required;
    }

    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, role: string) {
    const quiz = await this.ensureQuizExists(id);

    //Only the Admin or creator can delete.
    if (role !== 'admin' && quiz.createdBy !== userId) {
      throw new ForbiddenException(
        'You do not have the right to delete this Quiz.',
      );
    }

    return this.prisma.quiz.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async restore(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (!quiz.deletedAt) {
      throw new ForbiddenException('Quiz này chưa bị xóa');
    }

    return this.prisma.quiz.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async verifyPassword(id: string, dto: VerifyQuizPasswordDto) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id },
      select: { passwordHash: true, accessMode: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    if (quiz.accessMode !== AccessMode.password_required) {
      return { message: 'Quiz does not require a password' };
    }
    if (!quiz.passwordHash) {
      throw new ForbiddenException('Quiz password is not configured');
    }
    const isMatch = await bcrypt.compare(dto.password, quiz.passwordHash);
    if (!isMatch)
      throw new ForbiddenException('The exam room password is incorrect.');

    return { message: 'Verification successful' };
  }

  async addQuestion(quizId: string, dto: AddQuestionToQuizDto) {
    await this.ensureQuizExists(quizId);
    await this.ensureQuestionExists(dto.questionId);
    const sameOrder = await this.prisma.quizQuestion.findFirst({
      where: {
        quizId,
        orderIndex: dto.orderIndex,
        NOT: {
          questionId: dto.questionId,
        },
      },
    });

    if (sameOrder) {
      throw new BadRequestException(
        `orderIndex ${dto.orderIndex} đã được sử dụng trong quiz này.`,
      );
    }

    return this.prisma.quizQuestion.upsert({
      where: {
        quizId_questionId: {
          quizId,
          questionId: dto.questionId,
        },
      },
      update: {
        orderIndex: dto.orderIndex,
      },
      create: {
        quizId,
        questionId: dto.questionId,
        orderIndex: dto.orderIndex,
      },
    });
  }

  async addQuestionsToQuiz(
    quizId: string,
    questions: { questionId: string; orderIndex: number }[],
  ) {
    await this.ensureQuizExists(quizId);
    if (!questions || questions.length === 0) {
      throw new BadRequestException('Danh sách câu hỏi không được để trống.');
    }
    const questionIds = questions.map((q) => q.questionId);
    const orderIndexes = questions.map((q) => q.orderIndex);

    if (new Set(questionIds).size !== questionIds.length) {
      throw new BadRequestException(
        'Danh sách câu hỏi gửi lên bị trùng questionId.',
      );
    }

    if (new Set(orderIndexes).size !== orderIndexes.length) {
      throw new BadRequestException(
        'Danh sách câu hỏi gửi lên bị trùng orderIndex.',
      );
    }

    const existingQuestions = await this.prisma.question.findMany({
      where: {
        id: { in: questionIds },
        deletedAt: null,
      },
      select: { id: true },
    });

    const existingQuestionIds = new Set(existingQuestions.map((q) => q.id));
    const missingQuestionIds = questionIds.filter(
      (id) => !existingQuestionIds.has(id),
    );

    if (missingQuestionIds.length > 0) {
      throw new NotFoundException(
        `Không tìm thấy câu hỏi: ${missingQuestionIds.join(', ')}`,
      );
    }

    const orderConflicts = await this.prisma.quizQuestion.findMany({
      where: {
        quizId,
        orderIndex: { in: orderIndexes },
        questionId: { notIn: questionIds },
      },
      select: {
        questionId: true,
        orderIndex: true,
      },
    });

    if (orderConflicts.length > 0) {
      const conflictText = orderConflicts
        .map((item) => `orderIndex ${item.orderIndex}`)
        .join(', ');

      throw new BadRequestException(
        `Một số orderIndex đã được câu hỏi khác sử dụng: ${conflictText}`,
      );
    }

    return this.prisma.$transaction(
      questions.map((q) =>
        this.prisma.quizQuestion.upsert({
          where: {
            quizId_questionId: {
              quizId,
              questionId: q.questionId,
            },
          },
          update: {
            orderIndex: q.orderIndex,
          },
          create: {
            quizId,
            questionId: q.questionId,
            orderIndex: q.orderIndex,
          },
        }),
      ),
    );
  }

  // Retrieve the root password
  async getPlainPassword(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      select: {
        passwordPlain: true,
        title: true,
        passwordPlainExpiresAt: true,
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    return {
      title: quiz.title,
      password: quiz.passwordPlain,
      passwordPlainExpiresAt: quiz.passwordPlainExpiresAt,
    };
  }
  //Delete a question from the Quiz (Delete the record in the QuizQuestion intermediate table)
  async removeQuestion(quizId: string, questionId: string) {
    await this.ensureQuizExists(quizId);
    const record = await this.prisma.quizQuestion.findUnique({
      where: {
        quizId_questionId: { quizId, questionId },
      },
    });

    if (!record)
      throw new NotFoundException('This question is not in the quiz.');

    return this.prisma.quizQuestion.delete({
      where: {
        quizId_questionId: { quizId, questionId },
      },
    });
  }

  async removePermanent(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!quiz) throw new NotFoundException('Quiz not found');
    // If you have already submitted an attempt, do not permanently delete it to preserve your history.
    if (quiz._count.attempts > 0) {
      throw new ForbiddenException('It cannot be permanently erased.');
    }

    return this.prisma.quiz.delete({
      where: { id },
    });
  }

  async validateQuizAvailability(quizId: string, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId, deletedAt: null },
      include: {
        _count: {
          select: {
            attempts: {
              where: { userId, status: { in: ['submitted', 'timed_out'] } },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    if (!quiz.isPublished) {
      throw new ForbiddenException('Quiz chưa được công khai.');
    }

    const now = new Date();

    // Check thời gian bắt đầu/kết thúc
    if (quiz.startsAt && now < quiz.startsAt)
      throw new ForbiddenException('Kỳ thi chưa bắt đầu');
    if (quiz.endsAt && now > quiz.endsAt)
      throw new ForbiddenException('Kỳ thi đã kết thúc');

    // Check số lần làm bài (maxAttempts)
    if (quiz._count.attempts >= quiz.maxAttempts) {
      throw new ForbiddenException(
        `Bạn đã hết lượt tham gia (Tối đa: ${quiz.maxAttempts} lần)`,
      );
    }

    return quiz;
  }

  @Cron(CronExpression.EVERY_HOUR) // Kiểm tra mỗi giờ một lần
  async handleClearPlainPasswords() {
    const now = new Date();

    const result = await this.prisma.quiz.updateMany({
      where: {
        passwordPlain: { not: null },
        passwordPlainExpiresAt: {
          lte: now,
        },
      },
      data: {
        passwordPlain: null,
        passwordPlainExpiresAt: null,
      },
    });

    if (result.count > 0) {
      console.log(`Đã dọn dẹp ${result.count} mật khẩu thô quá hạn 24h`);
    }
  }

  //HELPER
  // src/modules/quizzes/quizzes.service.ts

  private getQuizStatus(quiz: {
    deletedAt: Date | null;
    isPublished: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
  }): 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'ENDED' | 'DELETED' {
    if (quiz.deletedAt) return 'DELETED';
    if (!quiz.isPublished) return 'DRAFT';

    const now = new Date();
    const { startsAt, endsAt } = quiz;

    if (startsAt && now < startsAt) return 'UPCOMING';
    if (endsAt && now > endsAt) return 'ENDED';

    return 'ONGOING';
  }
}
