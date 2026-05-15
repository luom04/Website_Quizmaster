import { api } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AuthTokenData,
  LoginRequest,
  RegisterAuthData,
  RegisterRequest,
  ResetPasswordData,
  ResetPasswordRequest,
} from "@/types/auth";

import type { User } from "@/types/user";

const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  RESET_PASSWORD: "/auth/reset-password",
  ME: "/users/me",
} as const;

export const authApi = {
  async login(payload: LoginRequest) {
    const response = await api.post<ApiSuccessResponse<AuthTokenData>>(
      AUTH_ENDPOINTS.LOGIN,
      payload,
    );

    return response.data.data;
  },

  async register(payload: RegisterRequest) {
    const response = await api.post<ApiSuccessResponse<RegisterAuthData>>(
      AUTH_ENDPOINTS.REGISTER,
      payload,
    );

    return response.data.data;
  },

  async logout() {
    const response = await api.post<ApiSuccessResponse<null>>(
      AUTH_ENDPOINTS.LOGOUT,
    );

    return response.data;
  },

  async refresh() {
    const response = await api.post<ApiSuccessResponse<AuthTokenData>>(
      AUTH_ENDPOINTS.REFRESH,
    );

    return response.data.data;
  },

  async resetPassword(payload: ResetPasswordRequest) {
    const response = await api.post<ApiSuccessResponse<ResetPasswordData>>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      payload,
    );

    return response.data.data;
  },

  async getCurrentUser() {
    const response = await api.get<ApiSuccessResponse<User>>(AUTH_ENDPOINTS.ME);

    return response.data.data;
  },
};
