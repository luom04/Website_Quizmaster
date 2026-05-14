import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import { categoriesApi } from "@/features/categories/categories.api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  CategoryQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

type UpdateCategoryInput = {
  categoryId: string;
  payload: UpdateCategoryRequest;
};

export function useCategories(params?: CategoryQueryParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => categoriesApi.getCategories(params),
    placeholderData: keepPreviousData,
  });
}

export function useCategoryDetail(categoryId?: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(categoryId || ""),
    queryFn: () => categoriesApi.getCategoryDetail(categoryId!),
    enabled: Boolean(categoryId),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) =>
      categoriesApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.lists(),
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, payload }: UpdateCategoryInput) =>
      categoriesApi.updateCategory(categoryId, payload),
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.lists(),
      });

      queryClient.setQueryData(
        queryKeys.categories.detail(updatedCategory.id),
        updatedCategory,
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoriesApi.deleteCategory(categoryId),
    onSuccess: (deletedCategory) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.lists(),
      });

      queryClient.setQueryData(
        queryKeys.categories.detail(deletedCategory.id),
        deletedCategory,
      );
    },
  });
}

export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoriesApi.restoreCategory(categoryId),
    onSuccess: (restoredCategory) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.lists(),
      });

      queryClient.setQueryData(
        queryKeys.categories.detail(restoredCategory.id),
        restoredCategory,
      );
    },
  });
}

export function usePermanentlyDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoriesApi.permanentlyDeleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.lists(),
      });
    },
  });
}
