import { BadRequestException, Injectable } from '@nestjs/common';
import { AttemptStatus, EventType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdminDashboardQueryDto,
  AdminRecentAttemptsQueryDto,
  AdminSuspiciousAttemptsQueryDto,
  AdminTopQuizzesQueryDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateFilter(
    from?: string,
    to?: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!from && !to) return undefined;

    const filter: Prisma.DateTimeFilter = {};

    if (from) {
      const fromDate = new Date(from);

      if (Number.isNaN(fromDate.getTime())) {
        throw new BadRequestException('from không hợp lệ.');
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(from)) {
        fromDate.setHours(0, 0, 0, 0);
      }

      filter.gte = fromDate;
    }

    if (to) {
      const toDate = new Date(to);

      if (Number.isNaN(toDate.getTime())) {
        throw new BadRequestException('to không hợp lệ.');
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        toDate.setHours(23, 59, 59, 999);
      }

      filter.lte = toDate;
    }

    if (filter.gte && filter.lte && filter.gte > filter.lte) {
      throw new BadRequestException('from không được lớn hơn to.');
    }

    return filter;
  }

  private roundNumber(value: number | null | undefined, digits = 2): number {
    if (value === null || value === undefined) return 0;

    const multiplier = 10 ** digits;
    return Math.round(value * multiplier) / multiplier;
  }

  private groupAttemptsByDay(attempts: { createdAt: Date }[]) {
    const grouped = new Map<string, number>();

    for (const attempt of attempts) {
      const date = attempt.createdAt.toISOString().slice(0, 10);
      grouped.set(date, (grouped.get(date) ?? 0) + 1);
    }

    return Array.from(grouped.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  private groupQuizzesByCategory(
    quizzes: {
      category: { id: string; name: string } | null;
    }[],
  ) {
    const grouped = new Map<
      string,
      {
        categoryId: string | null;
        categoryName: string;
        quizCount: number;
      }
    >();

    for (const quiz of quizzes) {
      const key = quiz.category?.id ?? 'uncategorized';

      if (!grouped.has(key)) {
        grouped.set(key, {
          categoryId: quiz.category?.id ?? null,
          categoryName: quiz.category?.name ?? 'Uncategorized',
          quizCount: 0,
        });
      }

      grouped.get(key)!.quizCount += 1;
    }

    return Array.from(grouped.values()).sort(
      (a, b) => b.quizCount - a.quizCount,
    );
  }

  private buildAttemptDateWhere(
    dateFilter?: Prisma.DateTimeFilter,
  ): Prisma.AttemptWhereInput {
    return dateFilter ? { createdAt: dateFilter } : {};
  }

  async getDashboard(query: AdminDashboardQueryDto) {
    const dateFilter = this.getDateFilter(query.from, query.to);

    const userWhere: Prisma.UserWhereInput = {
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const activeUserWhere: Prisma.UserWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const quizWhere: Prisma.QuizWhereInput = {
      deletedAt: null,
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const publishedQuizWhere: Prisma.QuizWhereInput = {
      deletedAt: null,
      isPublished: true,
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const questionWhere: Prisma.QuestionWhereInput = {
      deletedAt: null,
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const attemptWhere: Prisma.AttemptWhereInput = {
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const completedAttemptWhere: Prisma.AttemptWhereInput = {
      status: {
        in: [AttemptStatus.submitted, AttemptStatus.timed_out],
      },
      score: {
        not: null,
      },
      ...(dateFilter && { submittedAt: dateFilter }),
    };

    const passFailWhere: Prisma.AttemptWhereInput = {
      status: {
        in: [AttemptStatus.submitted, AttemptStatus.timed_out],
      },
      isPassed: {
        not: null,
      },
      ...(dateFilter && { submittedAt: dateFilter }),
    };

    const eventWhere: Prisma.QuizEventWhereInput = {
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const suspiciousEventWhere: Prisma.QuizEventWhereInput = {
      eventType: {
        in: [
          EventType.tab_blur,
          EventType.copy_attempt,
          EventType.right_click,
          EventType.auto_submitted,
        ],
      },
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const [
      totalUsers,
      totalActiveUsers,
      totalQuizzes,
      totalPublishedQuizzes,
      totalQuestions,
      totalAttempts,
      submittedAttempts,
      timedOutAttempts,
      inProgressAttempts,
      scoreAggregate,
      passedAttempts,
      failedAttempts,
      totalSuspiciousEvents,
      tabBlurEvents,
      tabFocusEvents,
      copyAttemptEvents,
      rightClickEvents,
      autoSubmittedEvents,
      attemptsForChart,
      quizzesForCategory,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: userWhere }),

      this.prisma.user.count({ where: activeUserWhere }),

      this.prisma.quiz.count({ where: quizWhere }),

      this.prisma.quiz.count({ where: publishedQuizWhere }),

      this.prisma.question.count({ where: questionWhere }),

      this.prisma.attempt.count({ where: attemptWhere }),

      this.prisma.attempt.count({
        where: {
          ...attemptWhere,
          status: AttemptStatus.submitted,
        },
      }),

      this.prisma.attempt.count({
        where: {
          ...attemptWhere,
          status: AttemptStatus.timed_out,
        },
      }),

      this.prisma.attempt.count({
        where: {
          ...attemptWhere,
          status: AttemptStatus.in_progress,
        },
      }),

      this.prisma.attempt.aggregate({
        where: completedAttemptWhere,
        _avg: {
          score: true,
        },
      }),

      this.prisma.attempt.count({
        where: {
          ...passFailWhere,
          isPassed: true,
        },
      }),

      this.prisma.attempt.count({
        where: {
          ...passFailWhere,
          isPassed: false,
        },
      }),

      this.prisma.quizEvent.count({
        where: suspiciousEventWhere,
      }),

      this.prisma.quizEvent.count({
        where: {
          ...eventWhere,
          eventType: EventType.tab_blur,
        },
      }),

      this.prisma.quizEvent.count({
        where: {
          ...eventWhere,
          eventType: EventType.tab_focus,
        },
      }),

      this.prisma.quizEvent.count({
        where: {
          ...eventWhere,
          eventType: EventType.copy_attempt,
        },
      }),

      this.prisma.quizEvent.count({
        where: {
          ...eventWhere,
          eventType: EventType.right_click,
        },
      }),

      this.prisma.quizEvent.count({
        where: {
          ...eventWhere,
          eventType: EventType.auto_submitted,
        },
      }),
      this.prisma.attempt.findMany({
        where: attemptWhere,
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prisma.quiz.findMany({
        where: quizWhere,
        select: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const completedForPassRate = passedAttempts + failedAttempts;

    const averageScore = this.roundNumber(scoreAggregate._avg.score);

    const passRate =
      completedForPassRate > 0
        ? this.roundNumber((passedAttempts / completedForPassRate) * 100)
        : 0;

    return {
      filters: {
        from: query.from ?? null,
        to: query.to ?? null,
      },

      overview: {
        totalUsers,
        totalActiveUsers,
        totalQuizzes,
        totalPublishedQuizzes,
        totalQuestions,
        totalAttempts,
        averageScore,
        passRate,
        totalSuspiciousEvents,
      },

      attemptStatus: {
        submitted: submittedAttempts,
        timedOut: timedOutAttempts,
        inProgress: inProgressAttempts,
      },

      passFail: {
        passed: passedAttempts,
        failed: failedAttempts,
      },

      attemptsByDay: this.groupAttemptsByDay(attemptsForChart),

      quizByCategory: this.groupQuizzesByCategory(quizzesForCategory),

      eventSummary: {
        tab_blur: tabBlurEvents,
        tab_focus: tabFocusEvents,
        copy_attempt: copyAttemptEvents,
        right_click: rightClickEvents,
        auto_submitted: autoSubmittedEvents,
      },
    };
  }

  async getRecentAttempts(query: AdminRecentAttemptsQueryDto) {
    const { page = 1, limit = 10, quizId, userId, status, from, to } = query;

    const skip = (page - 1) * limit;
    const dateFilter = this.getDateFilter(from, to);

    const where: Prisma.AttemptWhereInput = {
      ...(quizId && { quizId }),
      ...(userId && { userId }),
      ...(status && { status }),
      ...(dateFilter && { createdAt: dateFilter }),
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

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },

          quiz: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
              passingScore: true,
            },
          },

          _count: {
            select: {
              events: true,
            },
          },
        },
      }),

      this.prisma.attempt.count({ where }),
    ]);

    return {
      data: data.map((attempt) => ({
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        score: attempt.score,
        maxScore: attempt.maxScore,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        isPassed: attempt.isPassed,
        tabSwitchCount: attempt.tabSwitchCount,
        eventCount: attempt._count.events,
        startedAt: attempt.startedAt,
        deadlineAt: attempt.deadlineAt,
        submittedAt: attempt.submittedAt,
        timeSpentSeconds: attempt.timeSpentSeconds,
        user: attempt.user,
        quiz: attempt.quiz,
      })),

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTopQuizzes(query: AdminTopQuizzesQueryDto) {
    const limit = query.limit ?? 5;
    const dateFilter = this.getDateFilter(query.from, query.to);

    const attemptWhere = this.buildAttemptDateWhere(dateFilter);

    const groupedAttempts = await this.prisma.attempt.groupBy({
      by: ['quizId'],
      where: attemptWhere,
      _count: {
        _all: true,
      },
      _avg: {
        score: true,
      },
    });

    const topGroups = groupedAttempts
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, limit);

    const quizIds = topGroups.map((item) => item.quizId);

    if (quizIds.length === 0) {
      return { data: [] };
    }

    const [quizzes, attempts] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        where: {
          id: {
            in: quizIds,
          },
        },
        select: {
          id: true,
          title: true,
          isPublished: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              quizQuestions: true,
            },
          },
        },
      }),

      this.prisma.attempt.findMany({
        where: {
          quizId: {
            in: quizIds,
          },
          ...attemptWhere,
        },
        select: {
          quizId: true,
          status: true,
          score: true,
          isPassed: true,
        },
      }),
    ]);

    const quizMap = new Map(quizzes.map((quiz) => [quiz.id, quiz]));

    return {
      data: topGroups.map((group) => {
        const quiz = quizMap.get(group.quizId);
        const quizAttempts = attempts.filter(
          (attempt) => attempt.quizId === group.quizId,
        );

        const completedAttempts = quizAttempts.filter(
          (attempt) =>
            attempt.status === AttemptStatus.submitted ||
            attempt.status === AttemptStatus.timed_out,
        );

        const passedCount = completedAttempts.filter(
          (attempt) => attempt.isPassed === true,
        ).length;

        const failedCount = completedAttempts.filter(
          (attempt) => attempt.isPassed === false,
        ).length;

        const passFailTotal = passedCount + failedCount;

        const timedOutCount = quizAttempts.filter(
          (attempt) => attempt.status === AttemptStatus.timed_out,
        ).length;

        const averageScore = this.roundNumber(group._avg.score);

        const passRate =
          passFailTotal > 0
            ? this.roundNumber((passedCount / passFailTotal) * 100)
            : 0;

        return {
          quizId: group.quizId,
          title: quiz?.title ?? 'Unknown quiz',
          isPublished: quiz?.isPublished ?? false,
          category: quiz?.category ?? null,
          questionCount: quiz?._count.quizQuestions ?? 0,
          attemptCount: group._count._all,
          completedAttemptCount: completedAttempts.length,
          timedOutCount,
          averageScore,
          passRate,
        };
      }),
    };
  }

  async getSuspiciousAttempts(query: AdminSuspiciousAttemptsQueryDto) {
    const {
      page = 1,
      limit = 10,
      quizId,
      userId,
      eventType,
      minTabSwitchCount,
      from,
      to,
    } = query;

    const skip = (page - 1) * limit;
    const dateFilter = this.getDateFilter(from, to);

    const effectiveMinTabSwitchCount = minTabSwitchCount ?? 1;

    const eventFilter: Prisma.QuizEventWhereInput = {
      ...(eventType && { eventType }),
      ...(dateFilter && { createdAt: dateFilter }),
    };

    const where: Prisma.AttemptWhereInput = {
      ...(quizId && { quizId }),
      ...(userId && { userId }),

      AND: [
        ...(dateFilter
          ? [
              {
                OR: [
                  { createdAt: dateFilter },
                  { events: { some: { createdAt: dateFilter } } },
                ],
              },
            ]
          : []),

        {
          OR: [
            {
              tabSwitchCount: {
                gte: effectiveMinTabSwitchCount,
              },
            },
            {
              events: {
                some: eventFilter,
              },
            },
          ],
        },
      ],
    };

    const [attempts, total] = await this.prisma.$transaction([
      this.prisma.attempt.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          {
            tabSwitchCount: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
        select: {
          id: true,
          status: true,
          score: true,
          isPassed: true,
          correctCount: true,
          totalQuestions: true,
          tabSwitchCount: true,
          startedAt: true,
          submittedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },

          quiz: {
            select: {
              id: true,
              title: true,
            },
          },

          events: {
            where: eventFilter,
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              eventType: true,
              metadata: true,
              createdAt: true,
            },
          },
        },
      }),

      this.prisma.attempt.count({ where }),
    ]);

    return {
      data: attempts.map((attempt) => {
        const eventSummary: Partial<Record<EventType, number>> = {};

        for (const event of attempt.events) {
          eventSummary[event.eventType] =
            (eventSummary[event.eventType] ?? 0) + 1;
        }

        return {
          attemptId: attempt.id,
          status: attempt.status,
          score: attempt.score,
          isPassed: attempt.isPassed,
          correctCount: attempt.correctCount,
          totalQuestions: attempt.totalQuestions,
          tabSwitchCount: attempt.tabSwitchCount,
          eventCount: attempt.events.length,
          eventSummary,
          latestEvents: attempt.events.slice(0, 5),
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          user: attempt.user,
          quiz: attempt.quiz,
        };
      }),

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
