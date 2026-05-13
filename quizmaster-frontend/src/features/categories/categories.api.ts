import { api } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Category, CategoryQueryParams } from "@/types/category";

const CATEGORIES_ENDPOINTS = {
  LIST: "/categories",
  DETAIL: (categoryId: string) => `/categories/${categoryId}`,
} as const;

export const categoriesApi = {
  async getCategories(params?: CategoryQueryParams) {
    const response = await api.get<ApiSuccessResponse<Category[]>>(
      CATEGORIES_ENDPOINTS.LIST,
      { params },
    );

    return response.data.data;
  },

  async getCategoryDetail(categoryId: string) {
    const response = await api.get<ApiSuccessResponse<Category>>(
      CATEGORIES_ENDPOINTS.DETAIL(categoryId),
    );

    return response.data.data;
  },
};
