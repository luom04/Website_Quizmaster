import { api } from "@/lib/axios";
import {
  normalizePaginatedData,
  type ApiSuccessResponse,
  type BackendPaginatedData,
  type PaginatedData,
} from "@/types/api";
import type {
  AdminUpdateUserRequest,
  AdminUser,
  AdminUsersQueryParams,
  UpdateMeRequest,
  UserProfile,
} from "@/types/user";

const USERS_ENDPOINTS = {
  ME: "/users/me",
  ME_AVATAR: "/users/me/avatar",
  LIST: "/users",
  DETAIL: (userId: string) => `/users/${userId}`,
  RESTORE: (userId: string) => `/users/${userId}/restore`,
} as const;

export const usersApi = {
  async getMe() {
    const response = await api.get<ApiSuccessResponse<UserProfile>>(
      USERS_ENDPOINTS.ME,
    );

    return response.data.data;
  },

  async updateMe(payload: UpdateMeRequest) {
    const response = await api.patch<ApiSuccessResponse<UserProfile>>(
      USERS_ENDPOINTS.ME,
      payload,
    );

    return response.data.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file, file.name);

    const response = await api.patch<ApiSuccessResponse<UserProfile>>(
      USERS_ENDPOINTS.ME_AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data;
  },

  async getUsers(
    params?: AdminUsersQueryParams,
  ): Promise<PaginatedData<AdminUser>> {
    const response = await api.get<
      ApiSuccessResponse<BackendPaginatedData<AdminUser>>
    >(USERS_ENDPOINTS.LIST, { params });

    return normalizePaginatedData(response.data.data);
  },

  async getUserDetail(userId: string) {
    const response = await api.get<ApiSuccessResponse<AdminUser>>(
      USERS_ENDPOINTS.DETAIL(userId),
    );

    return response.data.data;
  },

  async updateUser(userId: string, payload: AdminUpdateUserRequest) {
    const response = await api.patch<ApiSuccessResponse<AdminUser>>(
      USERS_ENDPOINTS.DETAIL(userId),
      payload,
    );

    return response.data.data;
  },

  async deleteUser(userId: string) {
    const response = await api.delete<ApiSuccessResponse<AdminUser>>(
      USERS_ENDPOINTS.DETAIL(userId),
    );

    return response.data.data;
  },

  async restoreUser(userId: string) {
    const response = await api.patch<ApiSuccessResponse<AdminUser>>(
      USERS_ENDPOINTS.RESTORE(userId),
    );

    return response.data.data;
  },
};
