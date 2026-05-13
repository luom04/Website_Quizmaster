import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthLoadingScreen } from "@/components/guards/auth-loading-screen";
import { getAuthenticatedRedirectPath } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/auth.store";

type GuestRouteProps = {
  children: ReactNode;
};

type LocationState = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

export function GuestRoute({ children }: GuestRouteProps) {
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated && user) {
    const state = location.state as LocationState | null;

    const fromPathname = state?.from?.pathname;
    const fromSearch = state?.from?.search ?? "";
    const fromHash = state?.from?.hash ?? "";

    const redirectTo = fromPathname
      ? `${fromPathname}${fromSearch}${fromHash}`
      : getAuthenticatedRedirectPath(user.role);

    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
