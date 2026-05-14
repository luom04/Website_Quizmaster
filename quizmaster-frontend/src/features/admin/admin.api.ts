import { api } from "@/lib/axios";
import {
  normalizePaginatedData,
  type ApiSuccessResponse,
  type BackendPaginatedData,
  type PaginatedData,
} from "@/types/api";
import type {
  AdminDashboard,
  AdminDashboardQueryParams,
  AdminRecentAttemptItem,
  AdminRecentAttemptsQueryParams,
  AdminSuspiciousAttemptItem,
  AdminSuspiciousAttemptsQueryParams,
  AdminTopQuizItem,
  AdminTopQuizzesQueryParams,
  AdminAttemptEventItem,
  AdminAttemptEventsQueryParams,
} from "@/types/admin";

const ADMIN_ENDPOINTS = {
  DASHBOARD: "/admin/dashboard",
  RECENT_ATTEMPTS: "/admin/recent-attempts",
  TOP_QUIZZES: "/admin/top-quizzes",
  SUSPICIOUS_ATTEMPTS: "/admin/suspicious-attempts",
  ATTEMPT_EVENTS: (attemptId: string) => `/admin/attempts/${attemptId}/events`,
} as const;

type AdminTopQuizzesPayload = {
  data: AdminTopQuizItem[];
};

export const adminApi = {
  async getDashboard(params?: AdminDashboardQueryParams) {
    const response = await api.get<ApiSuccessResponse<AdminDashboard>>(
      ADMIN_ENDPOINTS.DASHBOARD,
      { params },
    );

    return response.data.data;
  },

  async getRecentAttempts(
    params?: AdminRecentAttemptsQueryParams,
  ): Promise<PaginatedData<AdminRecentAttemptItem>> {
    const response = await api.get<
      ApiSuccessResponse<BackendPaginatedData<AdminRecentAttemptItem>>
    >(ADMIN_ENDPOINTS.RECENT_ATTEMPTS, { params });

    return normalizePaginatedData(response.data.data);
  },

  async getTopQuizzes(
    params?: AdminTopQuizzesQueryParams,
  ): Promise<AdminTopQuizItem[]> {
    const response = await api.get<ApiSuccessResponse<AdminTopQuizzesPayload>>(
      ADMIN_ENDPOINTS.TOP_QUIZZES,
      { params },
    );

    return response.data.data.data;
  },

  async getSuspiciousAttempts(
    params?: AdminSuspiciousAttemptsQueryParams,
  ): Promise<PaginatedData<AdminSuspiciousAttemptItem>> {
    const response = await api.get<
      ApiSuccessResponse<BackendPaginatedData<AdminSuspiciousAttemptItem>>
    >(ADMIN_ENDPOINTS.SUSPICIOUS_ATTEMPTS, { params });

    return normalizePaginatedData(response.data.data);
  },

  async getAttemptEvents(
    attemptId: string,
    params?: AdminAttemptEventsQueryParams,
  ): Promise<PaginatedData<AdminAttemptEventItem>> {
    const response = await api.get<
      ApiSuccessResponse<BackendPaginatedData<AdminAttemptEventItem>>
    >(ADMIN_ENDPOINTS.ATTEMPT_EVENTS(attemptId), { params });

    return normalizePaginatedData(response.data.data);
  },
};
