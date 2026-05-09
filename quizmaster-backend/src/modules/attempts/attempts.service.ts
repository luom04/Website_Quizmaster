import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccessMode,
  AttemptStatus,
  EventType,
  Prisma,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  LogAttemptEventDto,
  QueryAttemptEventsDto,
  QueryAttemptHistoryDto,
  StartAttemptDto,
  SubmitAttemptDto,
} from './dto/attemp.dto';

type StartAttemptMeta = {
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  private shuffleArray<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }

  private roundScore(score: number): number {
    return Math.round(score * 100) / 100;
  }

  private isSameSet(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;

    const setA = new Set(a);
    const setB = new Set(b);

    if (setA.size !== setB.size) return false;

    for (const item of setA) {
      if (!setB.has(item)) return false;
    }

    return true;
  }

  private calculateDeadline(
    startedAt: Date,
    durationMinutes: number,
    endsAt?: Date | null,
  ) {
    const durationDeadline = new Date(
      startedAt.getTime() + durationMinutes * 60 * 1000,
    );

    if (endsAt && endsAt < durationDeadline) {
      return endsAt;
    }

    return durationDeadline;
  }

  private isExpired(deadlineAt?: Date | null): boolean {
    return !!deadlineAt && new Date() > deadlineAt;
  }

  //helper timeout
  private async markAttemptTimedOut(attemptId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            passingScore: true,
          },
        },
        attemptQuestions: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.status !== AttemptStatus.in_progress) {
      return attempt;
    }

    const submittedAt = attempt.deadlineAt ?? new Date();

    const timeSpentSeconds = Math.max(
      0,
      Math.floor((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000),
    );

    const totalQuestions =
      attempt.totalQuestions || attempt.attemptQuestions.length;

    const isPassed = attempt.quiz.passingScore !== null ? false : null;

    return this.prisma.$transaction(async (tx) => {
      await tx.attemptQuestion.updateMany({
        where: {
          attemptId,
          isCorrect: null,
        },
        data: {
          isCorrect: false,
        },
      });

      return tx.attempt.update({
        where: { id: attemptId },
        data: {
          submittedAt,
          timeSpentSeconds,
          score: 0,
          correctCount: 0,
          totalQuestions,
          isPassed,
          status: AttemptStatus.timed_out,
        },
      });
    });
  }

  private formatAttemptForTaking(attempt: any) {
    return {
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      totalQuestions: attempt.totalQuestions,
      isExpired:
        attempt.deadlineAt && new Date() > new Date(attempt.deadlineAt),

      questions: attempt.attemptQuestions.map((question: any) => ({
        id: question.id,
        questionId: question.questionId,
        content: question.content,
        type: question.type,
        orderIndex: question.orderIndex,
        selectedOptionIds:
          question.answers?.map((answer: any) => answer.attemptOptionId) ?? [],
        options: question.options.map((option: any) => ({
          id: option.id,
          optionId: option.optionId,
          content: option.content,
          orderIndex: option.orderIndex,
        })),
      })),
    };
  }

  private formatAttemptResult(attempt: any, role?: Role) {
    const canShowCorrectAnswer = attempt.quiz.showAnswer || role === Role.admin;

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      submittedAt: attempt.submittedAt,
      timeSpentSeconds: attempt.timeSpentSeconds,
      score: attempt.score,
      maxScore: attempt.maxScore,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      isPassed: attempt.isPassed,
      tabSwitchCount: attempt.tabSwitchCount,

      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        showAnswer: attempt.quiz.showAnswer,
        passingScore: attempt.quiz.passingScore,
      },

      questions: attempt.attemptQuestions.map((question: any) => {
        const selectedOptionIds = new Set(
          question.answers.map((answer: any) => answer.attemptOptionId),
        );

        return {
          id: question.id,
          questionId: question.questionId,
          content: question.content,
          type: question.type,
          orderIndex: question.orderIndex,
          isCorrect: canShowCorrectAnswer ? question.isCorrect : undefined,

          options: question.options.map((option: any) => ({
            id: option.id,
            optionId: option.optionId,
            content: option.content,
            orderIndex: option.orderIndex,
            selected: selectedOptionIds.has(option.id),
            isCorrect: canShowCorrectAnswer ? option.isCorrect : undefined,
          })),
        };
      }),
    };
  }

  async startAttempt(
    quizId: string,
    userId: string,
    dto: StartAttemptDto,
    meta: StartAttemptMeta = {},
  ) {
    //check quiz existence and validity
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quizId,
        deletedAt: null,
      },
      include: {
        quizQuestions: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            question: {
              include: {
                options: {
                  where: {
                    deletedAt: null,
                  },
                  orderBy: {
                    orderIndex: 'asc',
                  },
                },
              },
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

    if (quiz.startsAt && now < quiz.startsAt) {
      throw new ForbiddenException('Kỳ thi chưa bắt đầu.');
    }

    if (quiz.endsAt && now > quiz.endsAt) {
      throw new ForbiddenException('Kỳ thi đã kết thúc.');
    }

    if (quiz.accessMode === AccessMode.password_required) {
      if (!dto.password) {
        throw new BadRequestException('Quiz này yêu cầu mật khẩu.');
      }

      if (!quiz.passwordHash) {
        throw new ForbiddenException(
          'Mật khẩu bài kiểm tra chưa được cấu hình.',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        dto.password,
        quiz.passwordHash,
      );

      if (!isPasswordValid) {
        throw new ForbiddenException('Mật khẩu quiz không đúng.');
      }
    }

    const existingInProgressAttempt = await this.prisma.attempt.findFirst({
      where: {
        quizId,
        userId,
        status: AttemptStatus.in_progress,
      },
      include: {
        attemptQuestions: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            options: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
            answers: true,
          },
        },
      },
    });

    if (existingInProgressAttempt) {
      if (this.isExpired(existingInProgressAttempt.deadlineAt)) {
        await this.markAttemptTimedOut(existingInProgressAttempt.id);
      } else {
        return this.formatAttemptForTaking(existingInProgressAttempt);
      }
    }

    const completedAttemptCount = await this.prisma.attempt.count({
      where: {
        quizId,
        userId,
        status: {
          in: [AttemptStatus.submitted, AttemptStatus.timed_out],
        },
      },
    });

    if (completedAttemptCount >= quiz.maxAttempts) {
      throw new ForbiddenException(
        `Bạn đã hết lượt làm bài. Tối đa: ${quiz.maxAttempts} lần.`,
      );
    }

    const validQuizQuestions = quiz.quizQuestions.filter(
      (quizQuestion) =>
        quizQuestion.question &&
        !quizQuestion.question.deletedAt &&
        quizQuestion.question.options.length >= 2,
    );

    if (validQuizQuestions.length === 0) {
      throw new BadRequestException('Quiz chưa có câu hỏi hợp lệ.');
    }

    const invalidQuestion = quiz.quizQuestions.find(
      (quizQuestion) =>
        !quizQuestion.question ||
        quizQuestion.question.deletedAt ||
        quizQuestion.question.options.length < 2,
    );

    if (invalidQuestion) {
      throw new BadRequestException(
        'Quiz có câu hỏi không hợp lệ. Vui lòng kiểm tra lại ngân hàng câu hỏi.',
      );
    }

    const lastAttempt = await this.prisma.attempt.findFirst({
      where: {
        quizId,
        userId,
      },
      orderBy: {
        attemptNumber: 'desc',
      },
      select: {
        attemptNumber: true,
      },
    });

    const attemptNumber = (lastAttempt?.attemptNumber ?? 0) + 1;
    const startedAt = new Date();
    const deadlineAt = this.calculateDeadline(
      startedAt,
      quiz.durationMinutes,
      quiz.endsAt,
    );

    const questionsForAttempt = quiz.shuffleQuestions
      ? this.shuffleArray(validQuizQuestions)
      : validQuizQuestions;

    const attempt = await this.prisma.attempt.create({
      data: {
        quizId,
        userId,
        attemptNumber,
        startedAt,
        deadlineAt,
        totalQuestions: questionsForAttempt.length,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        status: AttemptStatus.in_progress,

        attemptQuestions: {
          create: questionsForAttempt.map((quizQuestion, questionIndex) => {
            const optionsForAttempt = quiz.shuffleOptions
              ? this.shuffleArray(quizQuestion.question.options)
              : quizQuestion.question.options;

            return {
              questionId: quizQuestion.questionId,
              content: quizQuestion.question.content,
              type: quizQuestion.question.type,
              orderIndex: questionIndex,

              options: {
                create: optionsForAttempt.map((option, optionIndex) => ({
                  optionId: option.id,
                  content: option.content,
                  isCorrect: option.isCorrect,
                  orderIndex: optionIndex,
                })),
              },
            };
          }),
        },
      },
      include: {
        attemptQuestions: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            options: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
            answers: true,
          },
        },
      },
    });

    return this.formatAttemptForTaking(attempt);
  }

  async submitAttempt(
    attemptId: string,
    userId: string,
    dto: SubmitAttemptDto,
  ) {
    const attempt = await this.prisma.attempt.findFirst({
      where: {
        id: attemptId,
        userId,
      },
      include: {
        quiz: {
          select: {
            id: true,
            passingScore: true,
          },
        },
        attemptQuestions: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            options: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.status !== AttemptStatus.in_progress) {
      throw new BadRequestException('Attempt này đã được nộp trước đó.');
    }

    const answers = dto.answers ?? [];

    const duplicatedAttemptQuestionIds = answers
      .map((answer) => answer.attemptQuestionId)
      .filter((id, index, arr) => arr.indexOf(id) !== index);

    if (duplicatedAttemptQuestionIds.length > 0) {
      throw new BadRequestException(
        'Một câu hỏi không được gửi đáp án nhiều lần.',
      );
    }

    const attemptQuestionMap = new Map(
      attempt.attemptQuestions.map((question) => [question.id, question]),
    );

    for (const answer of answers) {
      const attemptQuestion = attemptQuestionMap.get(answer.attemptQuestionId);

      if (!attemptQuestion) {
        throw new BadRequestException(
          `Câu hỏi không thuộc attempt này: ${answer.attemptQuestionId}`,
        );
      }

      const optionIds = new Set(
        attemptQuestion.options.map((option) => option.id),
      );

      const invalidOptionIds = answer.selectedOptionIds.filter(
        (optionId) => !optionIds.has(optionId),
      );

      if (invalidOptionIds.length > 0) {
        throw new BadRequestException(
          `Có đáp án không thuộc câu hỏi ${answer.attemptQuestionId}.`,
        );
      }
    }

    const answerMap = new Map(
      answers.map((answer) => [
        answer.attemptQuestionId,
        answer.selectedOptionIds,
      ]),
    );

    const submittedAt = new Date();

    let correctCount = 0;

    const questionResults = attempt.attemptQuestions.map((question) => {
      const selectedOptionIds = answerMap.get(question.id) ?? [];

      const correctOptionIds = question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.id);

      const isCorrect = this.isSameSet(selectedOptionIds, correctOptionIds);

      if (isCorrect) {
        correctCount += 1;
      }

      return {
        attemptQuestionId: question.id,
        selectedOptionIds,
        isCorrect,
      };
    });

    const totalQuestions = attempt.attemptQuestions.length;
    const score =
      totalQuestions > 0
        ? this.roundScore((correctCount / totalQuestions) * 10)
        : 0;

    const isPassed =
      attempt.quiz.passingScore !== null
        ? score >= attempt.quiz.passingScore
        : null;

    const isTimedOut =
      attempt.deadlineAt !== null && submittedAt > attempt.deadlineAt;

    const timeSpentSeconds = Math.max(
      0,
      Math.floor((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.attemptAnswer.deleteMany({
        where: {
          attemptQuestionId: {
            in: attempt.attemptQuestions.map((question) => question.id),
          },
        },
      });

      const answerRows = questionResults.flatMap((questionResult) =>
        questionResult.selectedOptionIds.map((optionId) => ({
          attemptQuestionId: questionResult.attemptQuestionId,
          attemptOptionId: optionId,
        })),
      );

      if (answerRows.length > 0) {
        await tx.attemptAnswer.createMany({
          data: answerRows,
          skipDuplicates: true,
        });
      }

      await Promise.all(
        questionResults.map((questionResult) =>
          tx.attemptQuestion.update({
            where: {
              id: questionResult.attemptQuestionId,
            },
            data: {
              isCorrect: questionResult.isCorrect,
            },
          }),
        ),
      );

      await tx.attempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          submittedAt,
          timeSpentSeconds,
          score,
          totalQuestions,
          correctCount,
          isPassed,
          status: isTimedOut
            ? AttemptStatus.timed_out
            : AttemptStatus.submitted,
        },
      });
    });

    return this.getResult(attemptId, userId);
  }

  async getResult(attemptId: string, userId: string, role?: Role) {
    const attempt = await this.prisma.attempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            showAnswer: true,
            passingScore: true,
          },
        },
        attemptQuestions: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            options: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
            answers: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId && role !== Role.admin) {
      throw new ForbiddenException('Bạn không có quyền xem attempt này.');
    }

    if (attempt.status === AttemptStatus.in_progress) {
      if (this.isExpired(attempt.deadlineAt)) {
        await this.markAttemptTimedOut(attempt.id);
        return this.getResult(attemptId, userId, role);
      }

      throw new BadRequestException('Attempt này chưa được nộp.');
    }

    return this.formatAttemptResult(attempt, role);
  }

  async getMyHistory(userId: string, query: QueryAttemptHistoryDto) {
    const { page = 1, limit = 10, quizId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AttemptWhereInput = {
      userId,
      ...(quizId && { quizId }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.attempt.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          quizId: true,
          attemptNumber: true,
          status: true,
          startedAt: true,
          deadlineAt: true,
          submittedAt: true,
          timeSpentSeconds: true,
          score: true,
          maxScore: true,
          totalQuestions: true,
          correctCount: true,
          isPassed: true,
          tabSwitchCount: true,
          quiz: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
              passingScore: true,
              showAnswer: true,
            },
          },
        },
      }),
      this.prisma.attempt.count({ where }),
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

  async getMyQuizAttempts(
    quizId: string,
    userId: string,
    query: QueryAttemptHistoryDto,
  ) {
    return this.getMyHistory(userId, {
      ...query,
      quizId,
    });
  }

  //event log and query will be implemented in the future when we have more event types and need to log more events for analytics

  async logAttemptEvent(
    attemptId: string,
    userId: string,
    dto: LogAttemptEventDto,
  ) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        userId: true,
        status: true,
        tabSwitchCount: true,
        deadlineAt: true,
      },
    });
    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }
    if (attempt.userId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền ghi log cho attempt này.',
      );
    }
    if (attempt.status !== AttemptStatus.in_progress) {
      throw new BadRequestException(
        'Chỉ có thể ghi log cho attempt đang được làm.',
      );
    }
    if (this.isExpired(attempt.deadlineAt)) {
      await this.markAttemptTimedOut(attempt.id);
      throw new BadRequestException(
        'Attempt đã hết hạn. Không thể ghi log event.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.quizEvent.create({
        data: {
          attemptId,
          eventType: dto.eventType,
          ...(dto.metadata !== undefined && {
            metadata: dto.metadata as Prisma.InputJsonValue,
          }),
        },
      });

      let tabSwitchCount = attempt.tabSwitchCount;
      if (dto.eventType === EventType.tab_blur) {
        const updateAttempt = await tx.attempt.update({
          where: { id: attemptId },
          data: { tabSwitchCount: { increment: 1 } },
          select: { tabSwitchCount: true },
        });
        tabSwitchCount = updateAttempt.tabSwitchCount;
      }

      return {
        event,
        tabSwitchCount,
      };
    });
  }

  async getAttemptEvents(
    attemptId: string,
    userId: string,
    role: Role,
    query: QueryAttemptEventsDto,
  ) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }
    if (attempt.userId !== userId && role !== Role.admin) {
      throw new ForbiddenException(
        'Bạn không có quyền xem event của attempt này.',
      );
    }

    const { page = 1, limit = 10, eventType } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.QuizEventWhereInput = {
      attemptId,
      ...(eventType && { eventType }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.quizEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.quizEvent.count({ where }),
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
}
