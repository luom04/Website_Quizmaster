import type { AttemptStatus, QuizEventType } from "@/types/attempt";
import type { QuizStatus } from "@/types/quiz";
import type { UserRole } from "@/types/user";

export type AdminDateRangeQuery = {
  from?: string;
  to?: string;
};

export type AdminDashboardQueryParams = AdminDateRangeQuery;

export type AdminDashboardOverview = {
  totalUsers: number;
  totalActiveUsers: number;
  totalQuizzes: number;
  totalPublishedQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  totalSuspiciousEvents: number;
};

export type AdminDashboardAttemptStatus = {
  submitted: number;
  timedOut: number;
  inProgress: number;
};

export type AdminDashboardPassFail = {
  passed: number;
  failed: number;
};

export type AdminAttemptsByDayItem = {
  date: string;
  count: number;
};

export type AdminQuizByCategoryItem = {
  categoryId: string | null;
  categoryName: string;
  quizCount: number;
};

export type AdminEventSummary = {
  tab_blur: number;
  tab_focus: number;
  copy_attempt: number;
  right_click: number;
  auto_submitted: number;
};

export type AdminDashboard = {
  filters: {
    from: string | null;
    to: string | null;
  };
  overview: AdminDashboardOverview;
  attemptStatus: AdminDashboardAttemptStatus;
  passFail: AdminDashboardPassFail;
  attemptsByDay: AdminAttemptsByDayItem[];
  quizByCategory: AdminQuizByCategoryItem[];
  eventSummary: AdminEventSummary;
};

export type AdminUserSummary = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role?: UserRole;
};

export type AdminQuizSummary = {
  id: string;
  title: string;
  durationMinutes?: number;
  passingScore?: number | null;
  isPublished?: boolean;
  status?: QuizStatus;
  category?: {
    id: string;
    name: string;
  } | null;
};

export type AdminRecentAttemptsQueryParams = AdminDateRangeQuery & {
  page?: number;
  limit?: number;
  quizId?: string;
  userId?: string;
  status?: AttemptStatus;
};

export type AdminRecentAttemptItem = {
  attemptId: string;
  attemptNumber: number;
  status: AttemptStatus;
  score: number | null;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  isPassed: boolean | null;
  tabSwitchCount: number;
  eventCount: number;
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  timeSpentSeconds: number | null;
  user: AdminUserSummary;
  quiz: AdminQuizSummary;
};

export type AdminTopQuizzesQueryParams = AdminDateRangeQuery & {
  limit?: number;
};

export type AdminTopQuizItem = {
  quizId: string;
  title: string;
  isPublished: boolean;
  category: {
    id: string;
    name: string;
  } | null;
  questionCount: number;
  attemptCount: number;
  completedAttemptCount: number;
  timedOutCount: number;
  averageScore: number;
  passRate: number;
};

export type AdminSuspiciousAttemptsQueryParams = AdminDateRangeQuery & {
  page?: number;
  limit?: number;
  quizId?: string;
  userId?: string;
  eventType?: QuizEventType;
  minTabSwitchCount?: number;
};

export type AdminSuspiciousEvent = {
  id: string;
  eventType: QuizEventType;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type AdminSuspiciousAttemptItem = {
  attemptId: string;
  status: AttemptStatus;
  score: number | null;
  isPassed: boolean | null;
  correctCount: number;
  totalQuestions: number;
  tabSwitchCount: number;
  eventCount: number;
  eventSummary: Partial<Record<QuizEventType, number>>;
  latestEvents: AdminSuspiciousEvent[];
  startedAt: string;
  submittedAt: string | null;
  user: AdminUserSummary;
  quiz: Pick<AdminQuizSummary, "id" | "title">;
};

export type AdminAttemptEventsQueryParams = {
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  eventType?: QuizEventType;
};

export type AdminAttemptEventItem = {
  id: string;
  attemptId: string;
  eventType: QuizEventType;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};
