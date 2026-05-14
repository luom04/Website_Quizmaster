import { api } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  Category,
  CategoryQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

const CATEGORIES_ENDPOINTS = {
  LIST: "/categories",
  DETAIL: (categoryId: string) => `/categories/${categoryId}`,
  RESTORE: (categoryId: string) => `/categories/${categoryId}/restore`,
  PERMANENT_DELETE: (categoryId: string) =>
    `/categories/${categoryId}/permanent`,
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

  async createCategory(payload: CreateCategoryRequest) {
    const response = await api.post<ApiSuccessResponse<Category>>(
      CATEGORIES_ENDPOINTS.LIST,
      payload,
    );

    return response.data.data;
  },

  async updateCategory(categoryId: string, payload: UpdateCategoryRequest) {
    const response = await api.patch<ApiSuccessResponse<Category>>(
      CATEGORIES_ENDPOINTS.DETAIL(categoryId),
      payload,
    );

    return response.data.data;
  },

  async deleteCategory(categoryId: string) {
    const response = await api.delete<ApiSuccessResponse<Category>>(
      CATEGORIES_ENDPOINTS.DETAIL(categoryId),
    );

    return response.data.data;
  },

  async restoreCategory(categoryId: string) {
    const response = await api.patch<ApiSuccessResponse<Category>>(
      CATEGORIES_ENDPOINTS.RESTORE(categoryId),
    );

    return response.data.data;
  },

  async permanentlyDeleteCategory(categoryId: string) {
    const response = await api.delete<ApiSuccessResponse<Category>>(
      CATEGORIES_ENDPOINTS.PERMANENT_DELETE(categoryId),
    );

    return response.data.data;
  },
};
