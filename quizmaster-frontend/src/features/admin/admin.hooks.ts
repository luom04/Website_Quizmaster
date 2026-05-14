import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { adminApi } from "@/features/admin/admin.api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  AdminDashboardQueryParams,
  AdminRecentAttemptsQueryParams,
  AdminSuspiciousAttemptsQueryParams,
  AdminTopQuizzesQueryParams,
  AdminAttemptEventsQueryParams,
} from "@/types/admin";

export function useAdminDashboard(params?: AdminDashboardQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(params),
    queryFn: () => adminApi.getDashboard(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminRecentAttempts(
  params?: AdminRecentAttemptsQueryParams,
) {
  return useQuery({
    queryKey: queryKeys.admin.recentAttempts(params),
    queryFn: () => adminApi.getRecentAttempts(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminTopQuizzes(params?: AdminTopQuizzesQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.topQuizzes(params),
    queryFn: () => adminApi.getTopQuizzes(params),
  });
}

export function useAdminSuspiciousAttempts(
  params?: AdminSuspiciousAttemptsQueryParams,
) {
  return useQuery({
    queryKey: queryKeys.admin.suspiciousAttempts(params),
    queryFn: () => adminApi.getSuspiciousAttempts(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminAttemptEvents(
  attemptId?: string,
  params?: AdminAttemptEventsQueryParams,
) {
  return useQuery({
    queryKey: queryKeys.admin.attemptEvents(attemptId || "", params),
    queryFn: () => adminApi.getAttemptEvents(attemptId!, params),
    enabled: Boolean(attemptId),
    placeholderData: keepPreviousData,
  });
}
