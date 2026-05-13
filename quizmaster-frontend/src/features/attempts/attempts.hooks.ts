import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { attemptsApi } from "@/features/attempts/attempts.api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  AttemptEventsQueryParams,
  AttemptHistoryQueryParams,
  LogAttemptEventRequest,
  StartAttemptRequest,
  SubmitAttemptRequest,
} from "@/types/attempt";

type StartAttemptInput = {
  quizId: string;
  payload?: StartAttemptRequest;
};

type SubmitAttemptInput = {
  attemptId: string;
  payload: SubmitAttemptRequest;
};

type LogAttemptEventInput = {
  attemptId: string;
  payload: LogAttemptEventRequest;
};

export function useStartAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, payload }: StartAttemptInput) =>
      attemptsApi.startAttempt(quizId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attempts.byQuiz(variables.quizId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.attempts.all,
      });
    },
  });
}

export function useAttemptForTaking(attemptId?: string) {
  return useQuery({
    queryKey: queryKeys.attempts.taking(attemptId || ""),
    queryFn: () => attemptsApi.getAttemptForTaking(attemptId!),
    enabled: Boolean(attemptId),
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, payload }: SubmitAttemptInput) =>
      attemptsApi.submitAttempt(attemptId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attempts.result(variables.attemptId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.attempts.result(variables.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attempts.myHistory(),
      });
    },
  });
}

export function useAttemptResult(attemptId?: string) {
  return useQuery({
    queryKey: queryKeys.attempts.result(attemptId || ""),
    queryFn: () => attemptsApi.getAttemptResult(attemptId!),
    enabled: Boolean(attemptId),
  });
}

export function useMyHistory(params?: AttemptHistoryQueryParams) {
  return useQuery({
    queryKey: queryKeys.attempts.myHistory(params),
    queryFn: () => attemptsApi.getMyHistory(params),
  });
}

export function useMyAttemptsByQuiz(
  quizId?: string,
  params?: Omit<AttemptHistoryQueryParams, "quizId">,
) {
  return useQuery({
    queryKey: queryKeys.attempts.byQuiz(quizId || "", params),
    queryFn: () => attemptsApi.getMyAttemptsByQuiz(quizId!, params),
    enabled: Boolean(quizId),
  });
}

export function useLogAttemptEvent() {
  return useMutation({
    mutationFn: ({ attemptId, payload }: LogAttemptEventInput) =>
      attemptsApi.logAttemptEvent(attemptId, payload),
  });
}

export function useAttemptEvents(
  attemptId?: string,
  params?: AttemptEventsQueryParams,
) {
  return useQuery({
    queryKey: queryKeys.attempts.events(attemptId || "", params),
    queryFn: () => attemptsApi.getAttemptEvents(attemptId!, params),
    enabled: Boolean(attemptId),
  });
}
