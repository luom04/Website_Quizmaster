import { useQuery } from "@tanstack/react-query";

import { categoriesApi } from "@/features/categories/categories.api";
import { queryKeys } from "@/lib/queryKeys";
import type { CategoryQueryParams } from "@/types/category";

export function useCategories(params?: CategoryQueryParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => categoriesApi.getCategories(params),
  });
}

export function useCategoryDetail(categoryId?: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(categoryId || ""),
    queryFn: () => categoriesApi.getCategoryDetail(categoryId!),
    enabled: Boolean(categoryId),
  });
}
