import { api } from "@/lib/axios";
import {
  normalizePaginatedData,
  type ApiSuccessResponse,
  type BackendPaginatedData,
  type PaginatedData,
} from "@/types/api";
import type {
  Quiz,
  QuizQueryParams,
  VerifyQuizPasswordRequest,
  VerifyQuizPasswordResponse,
} from "@/types/quiz";

const QUIZZES_ENDPOINTS = {
  PUBLIC_LIST: "/quizzes",
  DETAIL: (quizId: string) => `/quizzes/${quizId}`,
  VERIFY_PASSWORD: (quizId: string) => `/quizzes/${quizId}/verify-password`,
} as const;

function normalizeQuiz(quiz: Quiz): Quiz {
  return {
    ...quiz,
    questionCount: quiz.questionCount ?? quiz._count?.quizQuestions ?? 0,
  };
}

export const quizzesApi = {
  async getPublicQuizzes(
    params?: QuizQueryParams,
  ): Promise<PaginatedData<Quiz>> {
    const response = await api.get<
      ApiSuccessResponse<BackendPaginatedData<Quiz>>
    >(QUIZZES_ENDPOINTS.PUBLIC_LIST, { params });

    const paginatedData = normalizePaginatedData(response.data.data);

    return {
      ...paginatedData,
      items: paginatedData.items.map(normalizeQuiz),
    };
  },

  async getQuizDetail(quizId: string) {
    const response = await api.get<ApiSuccessResponse<Quiz>>(
      QUIZZES_ENDPOINTS.DETAIL(quizId),
    );

    return normalizeQuiz(response.data.data);
  },

  async verifyQuizPassword(quizId: string, payload: VerifyQuizPasswordRequest) {
    const response = await api.post<
      ApiSuccessResponse<VerifyQuizPasswordResponse>
    >(QUIZZES_ENDPOINTS.VERIFY_PASSWORD(quizId), payload);

    return response.data.data;
  },
};
