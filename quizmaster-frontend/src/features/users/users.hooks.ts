import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { usersApi } from "@/features/users/users.api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth.store";
import type {
  AdminUpdateUserRequest,
  AdminUsersQueryParams,
  UpdateMeRequest,
} from "@/types/user";

type AdminUpdateUserInput = {
  userId: string;
  payload: AdminUpdateUserRequest;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: usersApi.getMe,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: UpdateMeRequest) => usersApi.updateMe(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);

      queryClient.setQueryData(queryKeys.users.me(), updatedUser);
      queryClient.setQueryData(queryKeys.auth.me(), updatedUser);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);

      queryClient.setQueryData(queryKeys.users.me(), updatedUser);
      queryClient.setQueryData(queryKeys.auth.me(), updatedUser);
    },
  });
}

export function useAdminUsers(params?: AdminUsersQueryParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.getUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUserDetail(userId?: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId || ""),
    queryFn: () => usersApi.getUserDetail(userId!),
    enabled: Boolean(userId),
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: AdminUpdateUserInput) =>
      usersApi.updateUser(userId, payload),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });

      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        updatedUser,
      );
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onSuccess: (deletedUser) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });

      queryClient.setQueryData(
        queryKeys.users.detail(deletedUser.id),
        deletedUser,
      );
    },
  });
}

export function useAdminRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.restoreUser(userId),
    onSuccess: (restoredUser) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });

      queryClient.setQueryData(
        queryKeys.users.detail(restoredUser.id),
        restoredUser,
      );
    },
  });
}
