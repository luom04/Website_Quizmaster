import { api } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { UpdateMeRequest, UserProfile } from "@/types/user";

const USERS_ENDPOINTS = {
  ME: "/users/me",
  ME_AVATAR: "/users/me/avatar",
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
};
