import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/features/auth/auth.api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth.store";

type UseCurrentUserOptions = {
  enabled?: boolean;
};

export function useLogin() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useRefreshToken() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: authApi.refresh,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
    },
  });
}

export function useCurrentUser(options?: UseCurrentUserOptions) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getCurrentUser,
    enabled: options?.enabled ?? isAuthenticated,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}
