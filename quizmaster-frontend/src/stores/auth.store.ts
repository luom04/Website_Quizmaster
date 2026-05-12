import { create } from "zustand";

import type { User } from "@/types/user";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
  setAuth: (payload: { accessToken: string; user: User | null }) => void;
  setAuthLoading: (isAuthLoading: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isAuthLoading: false,

  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken),
    }),

  setUser: (user) =>
    set({
      user,
    }),

  setAuth: ({ accessToken, user }) =>
    set({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
      isAuthLoading: false,
    }),

  setAuthLoading: (isAuthLoading) =>
    set({
      isAuthLoading,
    }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,
    }),
}));
