import { api } from "@/lib/axios";
import {
  normalizePaginatedData,
  type ApiSuccessResponse,
  type BackendPaginatedData,
  type PaginatedData,
} from "@/types/api";
import type {
  CreateQuestionRequest,
  Question,
  QuestionsQueryParams,
  UpdateQuestionRequest,
} from "@/types/question";

const QUESTIONS_ENDPOINTS = {
  LIST: "/questions",
  DETAIL: (questionId: string) => `/questions/${questionId}`,
  PERMANENT_DELETE: (questionId: string) =>
    `/questions/${questionId}/permanent`,
  RESTORE: (questionId: string) => `/questions/${questionId}/restore`,
} as const;

export const questionsApi = {
  async getQuestions(
    params?: QuestionsQueryParams,
  ): Promise<PaginatedData<Question>> {
    const response = await api.get<
      ApiSuccessResponse<BackendPaginatedData<Question>>
    >(QUESTIONS_ENDPOINTS.LIST, { params });

    return normalizePaginatedData(response.data.data);
  },

  async getQuestionDetail(questionId: string) {
    const response = await api.get<ApiSuccessResponse<Question>>(
      QUESTIONS_ENDPOINTS.DETAIL(questionId),
    );

    return response.data.data;
  },

  async createQuestion(payload: CreateQuestionRequest) {
    const response = await api.post<ApiSuccessResponse<Question>>(
      QUESTIONS_ENDPOINTS.LIST,
      payload,
    );

    return response.data.data;
  },

  async updateQuestion(questionId: string, payload: UpdateQuestionRequest) {
    const response = await api.patch<ApiSuccessResponse<Question>>(
      QUESTIONS_ENDPOINTS.DETAIL(questionId),
      payload,
    );

    return response.data.data;
  },

  async deleteQuestion(questionId: string) {
    const response = await api.delete<ApiSuccessResponse<Question>>(
      QUESTIONS_ENDPOINTS.DETAIL(questionId),
    );

    return response.data.data;
  },

  async permanentlyDeleteQuestion(questionId: string) {
    const response = await api.delete<ApiSuccessResponse<Question>>(
      QUESTIONS_ENDPOINTS.PERMANENT_DELETE(questionId),
    );

    return response.data.data;
  },

  async restoreQuestion(questionId: string) {
    const response = await api.patch<ApiSuccessResponse<Question>>(
      QUESTIONS_ENDPOINTS.RESTORE(questionId),
    );

    return response.data.data;
  },
};
