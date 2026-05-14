import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { quizzesApi } from "@/features/quizzes/quizzes.api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  AddQuestionToQuizRequest,
  AdminQuizQueryParams,
  BulkAddQuestionsToQuizRequest,
  CreateQuizRequest,
  QuizQueryParams,
  UpdateQuizRequest,
  VerifyQuizPasswordRequest,
} from "@/types/quiz";

type UpdateQuizInput = {
  quizId: string;
  payload: UpdateQuizRequest;
};

type AddQuestionToQuizInput = {
  quizId: string;
  payload: AddQuestionToQuizRequest;
};

type BulkAddQuestionsToQuizInput = {
  quizId: string;
  payload: BulkAddQuestionsToQuizRequest;
};

type RemoveQuestionFromQuizInput = {
  quizId: string;
  questionId: string;
};

type VerifyQuizPasswordInput = {
  quizId: string;
} & VerifyQuizPasswordRequest;

export function usePublicQuizzes(params?: QuizQueryParams) {
  return useQuery({
    queryKey: queryKeys.quizzes.list(params),
    queryFn: () => quizzesApi.getPublicQuizzes(params),
    placeholderData: keepPreviousData,
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

export function useAdminQuizzes(params?: AdminQuizQueryParams) {
  return useQuery({
    queryKey: queryKeys.quizzes.adminList(params),
    queryFn: () => quizzesApi.getAdminQuizzes(params),
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuizRequest) => quizzesApi.createQuiz(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.adminLists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.lists(),
      });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, payload }: UpdateQuizInput) =>
      quizzesApi.updateQuiz(quizId, payload),
    onSuccess: (updatedQuiz) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.adminLists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.lists(),
      });

      queryClient.setQueryData(
        queryKeys.quizzes.detail(updatedQuiz.id),
        updatedQuiz,
      );
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizzesApi.deleteQuiz(quizId),
    onSuccess: (deletedQuiz) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.adminLists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.lists(),
      });

      queryClient.setQueryData(
        queryKeys.quizzes.detail(deletedQuiz.id),
        deletedQuiz,
      );
    },
  });
}

export function useRestoreQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizzesApi.restoreQuiz(quizId),
    onSuccess: (restoredQuiz) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.adminLists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.lists(),
      });

      queryClient.setQueryData(
        queryKeys.quizzes.detail(restoredQuiz.id),
        restoredQuiz,
      );
    },
  });
}

export function usePermanentlyDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizzesApi.permanentlyDeleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.adminLists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.lists(),
      });
    },
  });
}

export function useAddQuestionToQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, payload }: AddQuestionToQuizInput) =>
      quizzesApi.addQuestionToQuiz(quizId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.adminLists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.detail(variables.quizId),
      });
    },
  });
}
export function useBulkAddQuestionsToQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, payload }: BulkAddQuestionsToQuizInput) =>
      quizzesApi.bulkAddQuestionsToQuiz(quizId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.adminLists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.detail(variables.quizId),
      });
    },
  });
}

export function useRemoveQuestionFromQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionId }: RemoveQuestionFromQuizInput) =>
      quizzesApi.removeQuestionFromQuiz(quizId, questionId),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.adminLists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.quizzes.detail(variables.quizId),
      });
    },
  });
}

export function useQuizPassword(quizId?: string) {
  return useQuery({
    queryKey: queryKeys.quizzes.password(quizId || ""),
    queryFn: () => quizzesApi.getQuizPassword(quizId!),
    enabled: Boolean(quizId),
  });
}
