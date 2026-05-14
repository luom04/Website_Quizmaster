import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import { questionsApi } from "@/features/questions/questions.api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  CreateQuestionRequest,
  QuestionsQueryParams,
  UpdateQuestionRequest,
} from "@/types/question";

type UpdateQuestionInput = {
  questionId: string;
  payload: UpdateQuestionRequest;
};

export function useQuestions(params?: QuestionsQueryParams) {
  return useQuery({
    queryKey: queryKeys.questions.list(params),
    queryFn: () => questionsApi.getQuestions(params),
    placeholderData: keepPreviousData,
  });
}

export function useQuestionDetail(questionId?: string) {
  return useQuery({
    queryKey: queryKeys.questions.detail(questionId || ""),
    queryFn: () => questionsApi.getQuestionDetail(questionId!),
    enabled: Boolean(questionId),
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuestionRequest) =>
      questionsApi.createQuestion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.lists(),
      });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, payload }: UpdateQuestionInput) =>
      questionsApi.updateQuestion(questionId, payload),
    onSuccess: (updatedQuestion) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.lists(),
      });

      queryClient.setQueryData(
        queryKeys.questions.detail(updatedQuestion.id),
        updatedQuestion,
      );
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => questionsApi.deleteQuestion(questionId),
    onSuccess: (deletedQuestion) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.lists(),
      });

      queryClient.setQueryData(
        queryKeys.questions.detail(deletedQuestion.id),
        deletedQuestion,
      );
    },
  });
}

export function usePermanentlyDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) =>
      questionsApi.permanentlyDeleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.lists(),
      });
    },
  });
}

export function useRestoreQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) =>
      questionsApi.restoreQuestion(questionId),
    onSuccess: (restoredQuestion) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.lists(),
      });

      queryClient.setQueryData(
        queryKeys.questions.detail(restoredQuestion.id),
        restoredQuestion,
      );
    },
  });
}
