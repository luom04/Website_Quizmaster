import { api } from "@/lib/axios";
import {
  normalizePaginatedData,
  type ApiSuccessResponse,
  type PaginatedData,
} from "@/types/api";
import type {
  AttemptEvent,
  AttemptEventsQueryParams,
  AttemptHistoryItem,
  AttemptHistoryQueryParams,
  LogAttemptEventRequest,
  StartAttemptRequest,
  StartAttemptResponse,
  SubmitAttemptRequest,
  SubmitAttemptResponse,
  AttemptResult,
  AttemptForTaking,
} from "@/types/attempt";

const ATTEMPTS_ENDPOINTS = {
  START: (quizId: string) => `/attempts/start/${quizId}`,
  TAKING: (attemptId: string) => `/attempts/${attemptId}/taking`,
  SUBMIT: (attemptId: string) => `/attempts/${attemptId}/submit`,
  RESULT: (attemptId: string) => `/attempts/${attemptId}/result`,
  MY_HISTORY: "/attempts/my-history",
  MY_ATTEMPTS_BY_QUIZ: (quizId: string) =>
    `/attempts/quiz/${quizId}/my-attempts`,
  EVENTS: (attemptId: string) => `/attempts/${attemptId}/events`,
} as const;

export const attemptsApi = {
  async startAttempt(quizId: string, payload?: StartAttemptRequest) {
    const response = await api.post<ApiSuccessResponse<StartAttemptResponse>>(
      ATTEMPTS_ENDPOINTS.START(quizId),
      payload ?? {},
    );

    return response.data.data;
  },
  async getAttemptForTaking(attemptId: string) {
    const response = await api.get<ApiSuccessResponse<AttemptForTaking>>(
      ATTEMPTS_ENDPOINTS.TAKING(attemptId),
    );

    return response.data.data;
  },

  async submitAttempt(attemptId: string, payload: SubmitAttemptRequest) {
    const response = await api.post<ApiSuccessResponse<SubmitAttemptResponse>>(
      ATTEMPTS_ENDPOINTS.SUBMIT(attemptId),
      payload,
    );

    return response.data.data;
  },

  async getAttemptResult(attemptId: string) {
    const response = await api.get<ApiSuccessResponse<AttemptResult>>(
      ATTEMPTS_ENDPOINTS.RESULT(attemptId),
    );

    return response.data.data;
  },

  async getMyHistory(params?: AttemptHistoryQueryParams) {
    const response = await api.get<
      ApiSuccessResponse<PaginatedData<AttemptHistoryItem>>
    >(ATTEMPTS_ENDPOINTS.MY_HISTORY, { params });

    return normalizePaginatedData(response.data.data);
  },

  async getMyAttemptsByQuiz(
    quizId: string,
    params?: Omit<AttemptHistoryQueryParams, "quizId">,
  ) {
    const response = await api.get<
      ApiSuccessResponse<PaginatedData<AttemptHistoryItem>>
    >(ATTEMPTS_ENDPOINTS.MY_ATTEMPTS_BY_QUIZ(quizId), { params });

    return normalizePaginatedData(response.data.data);
  },

  async logAttemptEvent(attemptId: string, payload: LogAttemptEventRequest) {
    const response = await api.post<ApiSuccessResponse<AttemptEvent>>(
      ATTEMPTS_ENDPOINTS.EVENTS(attemptId),
      payload,
    );

    return response.data.data;
  },

  async getAttemptEvents(attemptId: string, params?: AttemptEventsQueryParams) {
    const response = await api.get<
      ApiSuccessResponse<PaginatedData<AttemptEvent>>
    >(ATTEMPTS_ENDPOINTS.EVENTS(attemptId), { params });

    return response.data.data;
  },
};
