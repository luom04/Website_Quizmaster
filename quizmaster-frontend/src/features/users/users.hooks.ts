import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "@/features/users/users.api";
import { queryKeys } from "@/lib/queryKeys";
import type { UpdateMeRequest } from "@/types/user";
import { useAuthStore } from "@/stores/auth.store";

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

  return useMutation({
    mutationFn: (payload: UpdateMeRequest) => usersApi.updateMe(payload),
    onSuccess: (updatedUser) => {
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
