import type { Category } from "@/types/category";

export type QuizAccessMode = "public" | "password_required";

export type QuizStatus = "DRAFT" | "UPCOMING" | "ONGOING" | "ENDED" | "DELETED";

export type QuizSortBy = "createdAt" | "title";

export type QuizOrder = "asc" | "desc";

export type QuizCategory = Pick<Category, "name"> & {
  id?: string;
};

export type QuizCreator = {
  name: string | null;
  avatarUrl: string | null;
};

export type QuizDetailOption = {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuizDetailQuestion = {
  id: string;
  categoryId: string | null;
  content: string;
  type: "single" | "multiple";
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  options: QuizDetailOption[];
};

export type QuizQuestionMapping = {
  quizId: string;
  questionId: string;
  orderIndex: number;
  question: QuizDetailQuestion;
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  category?: QuizCategory | null;

  createdBy?: string;
  creator?: QuizCreator | null;

  accessMode: QuizAccessMode;
  passwordHash?: string | null;
  passwordPlain?: string | null;
  passwordPlainExpiresAt?: string | null;

  startsAt: string | null;
  endsAt: string | null;

  durationMinutes: number;
  maxAttempts: number;
  passingScore: number | null;

  showAnswer: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  isPublished: boolean;

  status?: QuizStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  _count?: {
    quizQuestions: number;
  };

  quizQuestions?: QuizQuestionMapping[];

  questionCount?: number;
  attemptCount?: number;
  completedAttemptCount?: number;
  averageScore?: number | null;
  passRate?: number | null;
};

export type QuizQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isPublished?: boolean;
  status?: QuizStatus;
  sortBy?: QuizSortBy;
  order?: QuizOrder;
};

export type VerifyQuizPasswordRequest = {
  password: string;
};

export type VerifyQuizPasswordResponse = {
  success?: boolean;
  message?: string;
};
