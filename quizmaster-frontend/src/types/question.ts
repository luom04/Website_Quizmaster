import type { Category } from "@/types/category";

export type QuestionType = "single" | "multiple";

export type QuestionOption = {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Question = {
  id: string;
  categoryId: string | null;
  content: string;
  type: QuestionType;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Pick<Category, "id" | "name"> | null;
  options: QuestionOption[];
  _count?: {
    quizQuestions: number;
    attemptQuestions: number;
  };
};

export type QuestionsQueryParams = {
  page?: number;
  limit?: number;
  categoryId?: string;
  type?: QuestionType;
  search?: string;
  includeDeleted?: boolean;
};

export type QuestionOptionInput = {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
};

export type CreateQuestionRequest = {
  categoryId?: string;
  content: string;
  type: QuestionType;
  options: QuestionOptionInput[];
};

export type UpdateQuestionRequest = Partial<CreateQuestionRequest>;
