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
  AdminQuizQueryParams,
  CreateQuizRequest,
  UpdateQuizRequest,
  AddQuestionToQuizRequest,
  BulkAddQuestionsToQuizRequest,
  QuizPasswordResponse,
  QuizQuestionLink,
} from "@/types/quiz";

const QUIZZES_ENDPOINTS = {
  PUBLIC_LIST: "/quizzes",
  DETAIL: (quizId: string) => `/quizzes/${quizId}`,
  VERIFY_PASSWORD: (quizId: string) => `/quizzes/${quizId}/verify-password`,
  ADMIN_LIST: "/quizzes/admin/all",
  ADD_QUESTION: (quizId: string) => `/quizzes/${quizId}/questions`,
  BULK_ADD_QUESTIONS: (quizId: string) => `/quizzes/${quizId}/questions/bulk`,
  REMOVE_QUESTION: (quizId: string, questionId: string) =>
    `/quizzes/${quizId}/questions/${questionId}`,
  RESTORE: (quizId: string) => `/quizzes/${quizId}/restore`,
  PERMANENT_DELETE: (quizId: string) => `/quizzes/${quizId}/permanent`,
  PASSWORD: (quizId: string) => `/quizzes/${quizId}/password`,
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

  //admin
  async getAdminQuizzes(
    params?: AdminQuizQueryParams,
  ): Promise<PaginatedData<Quiz>> {
    const response = await api.get<
      ApiSuccessResponse<BackendPaginatedData<Quiz>>
    >(QUIZZES_ENDPOINTS.ADMIN_LIST, { params });

    const paginatedData = normalizePaginatedData(response.data.data);

    return {
      ...paginatedData,
      items: paginatedData.items.map(normalizeQuiz),
    };
  },

  async createQuiz(payload: CreateQuizRequest) {
    const response = await api.post<ApiSuccessResponse<Quiz>>(
      QUIZZES_ENDPOINTS.PUBLIC_LIST,
      payload,
    );

    return normalizeQuiz(response.data.data);
  },

  async updateQuiz(quizId: string, payload: UpdateQuizRequest) {
    const response = await api.patch<ApiSuccessResponse<Quiz>>(
      QUIZZES_ENDPOINTS.DETAIL(quizId),
      payload,
    );

    return normalizeQuiz(response.data.data);
  },

  async deleteQuiz(quizId: string) {
    const response = await api.delete<ApiSuccessResponse<Quiz>>(
      QUIZZES_ENDPOINTS.DETAIL(quizId),
    );

    return normalizeQuiz(response.data.data);
  },

  async restoreQuiz(quizId: string) {
    const response = await api.patch<ApiSuccessResponse<Quiz>>(
      QUIZZES_ENDPOINTS.RESTORE(quizId),
    );

    return normalizeQuiz(response.data.data);
  },

  async permanentlyDeleteQuiz(quizId: string) {
    const response = await api.delete<ApiSuccessResponse<Quiz>>(
      QUIZZES_ENDPOINTS.PERMANENT_DELETE(quizId),
    );

    return normalizeQuiz(response.data.data);
  },

  async addQuestionToQuiz(quizId: string, payload: AddQuestionToQuizRequest) {
    const response = await api.post<ApiSuccessResponse<QuizQuestionLink>>(
      QUIZZES_ENDPOINTS.ADD_QUESTION(quizId),
      payload,
    );

    return response.data.data;
  },

  async bulkAddQuestionsToQuiz(
    quizId: string,
    payload: BulkAddQuestionsToQuizRequest,
  ) {
    const response = await api.post<ApiSuccessResponse<QuizQuestionLink[]>>(
      QUIZZES_ENDPOINTS.BULK_ADD_QUESTIONS(quizId),
      payload,
    );

    return response.data.data;
  },

  async removeQuestionFromQuiz(quizId: string, questionId: string) {
    const response = await api.delete<ApiSuccessResponse<QuizQuestionLink>>(
      QUIZZES_ENDPOINTS.REMOVE_QUESTION(quizId, questionId),
    );

    return response.data.data;
  },

  async getQuizPassword(quizId: string) {
    const response = await api.get<ApiSuccessResponse<QuizPasswordResponse>>(
      QUIZZES_ENDPOINTS.PASSWORD(quizId),
    );

    return response.data.data;
  },
};
