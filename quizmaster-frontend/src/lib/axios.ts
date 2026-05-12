import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import type { AuthTokenData } from "@/types/auth";

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
];

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshApi = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshApi
      .post<ApiSuccessResponse<AuthTokenData>>("/auth/refresh")
      .then((response) => {
        const accessToken = response.data.data.access_token;
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const shouldRefresh =
      status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url);

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api.request(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = "Có lỗi xảy ra. Vui lòng thử lại.",
) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const status = error.response?.status;

  switch (status) {
    case 400:
      return "Vui lòng kiểm tra lại thông tin đã nhập.";

    case 401:
      return fallback;

    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";

    case 404:
      return "Không tìm thấy dữ liệu yêu cầu.";

    case 409:
      return "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.";

    case 422:
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";

    case 429:
      return "Bạn thao tác quá nhanh. Vui lòng thử lại sau.";

    case 500:
    case 502:
    case 503:
    case 504:
      return "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.";

    default:
      return fallback;
  }
}
