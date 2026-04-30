import {
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
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, createQuizDto: CreateQuizDto) {
    const category = await this.prisma.category.findFirst({
      where: { id: createQuizDto.categoryId, deletedAt: null },
    });

    if (!category) throw new NotFoundException('Category not found');

    let passwordHash = null;
    if (
      createQuizDto.accessMode === 'password_required' &&
      createQuizDto.password
    ) {
      passwordHash = await bcrypt.hash(createQuizDto.password, 10);
    }
    //tạo quiz
    const { password, ...quizData } = createQuizDto;
    return await this.prisma.quiz.create({
      data: {
        ...quizData,
        createdBy: userId,
        passwordHash,
        passwordPlain: password,
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

    let where: any = {
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
              startsAt: { lte: now },
              endsAt: { gte: now },
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

    const orderBy: any = {
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

    let where: any = {
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
          category: { select: { name: true } },
          _count: { select: { attempts: true } },
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
        category: { select: { name: true } },
        _count: { select: { quizQuestions: true } },
        creator: { select: { name: true, avatarUrl: true } },
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
    //Find Quiz and check its existence.
    const quiz = await this.prisma.quiz.findFirst({
      where: { id, deletedAt: null },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    //Only the creator of the content can edit it if they are not the Admin.
    if (role !== 'admin' && quiz.createdBy !== userId) {
      throw new ForbiddenException(
        'You do not have permission to edit this Quiz.',
      );
    }
    //Process password changes if a new password is sent.
    const data: any = { ...updateQuizDto };
    if (updateQuizDto.password) {
      data.passwordHash = await bcrypt.hash(updateQuizDto.password, 10);
      data.passwordPlain = updateQuizDto.password;
      delete data.password;
    }
    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, role: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id, deletedAt: null },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

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

    if (!quiz || quiz.accessMode !== 'password_required') {
      return { message: 'This quiz does not require a password.' };
    }

    const isMatch = await bcrypt.compare(dto.password, quiz.passwordHash);
    if (!isMatch)
      throw new ForbiddenException('The exam room password is incorrect.');

    return { message: 'Verification successful' };
  }

  async addQuestion(quizId: string, dto: AddQuestionToQuizDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return this.prisma.quizQuestion.create({
      data: {
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
    // Dùng $transaction để đảm bảo hoặc vào hết, hoặc không cái nào vào nếu có lỗi
    return this.prisma.$transaction(
      questions.map((q) =>
        this.prisma.quizQuestion.upsert({
          where: { quizId_questionId: { quizId, questionId: q.questionId } },
          update: { orderIndex: q.orderIndex },
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
      select: { passwordPlain: true, title: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    return { title: quiz.title, password: quiz.passwordPlain };
  }
  //Delete a question from the Quiz (Delete the record in the QuizQuestion intermediate table)
  async removeQuestion(quizId: string, questionId: string) {
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
      where: { id: quizId },
      include: { _count: { select: { attempts: { where: { userId } } } } },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
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

    return true;
  }

  @Cron(CronExpression.EVERY_HOUR) // Kiểm tra mỗi giờ một lần
  async handleClearPlainPasswords() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.prisma.quiz.updateMany({
      where: {
        createdAt: { lt: twentyFourHoursAgo },
        passwordPlain: { not: null },
      },
      data: { passwordPlain: null },
    });

    console.log('Đã dọn dẹp mật khẩu thô quá hạn 24h');
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
