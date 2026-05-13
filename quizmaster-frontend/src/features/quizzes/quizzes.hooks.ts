import { useMutation, useQuery } from "@tanstack/react-query";

import { quizzesApi } from "@/features/quizzes/quizzes.api";
import { queryKeys } from "@/lib/queryKeys";
import type { QuizQueryParams, VerifyQuizPasswordRequest } from "@/types/quiz";

type VerifyQuizPasswordInput = {
  quizId: string;
} & VerifyQuizPasswordRequest;

export function usePublicQuizzes(params?: QuizQueryParams) {
  return useQuery({
    queryKey: queryKeys.quizzes.list(params),
    queryFn: () => quizzesApi.getPublicQuizzes(params),
  });
}

export function useQuizDetail(quizId?: string) {
  return useQuery({
    queryKey: queryKeys.quizzes.detail(quizId || ""),
    queryFn: () => quizzesApi.getQuizDetail(quizId!),
    enabled: Boolean(quizId),
  });
}

export function useVerifyQuizPassword() {
  return useMutation({
    mutationFn: ({ quizId, password }: VerifyQuizPasswordInput) =>
      quizzesApi.verifyQuizPassword(quizId, { password }),
  });
}
