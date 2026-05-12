import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { AuthLoadingScreen } from "@/components/guards/auth-loading-screen";
import { getAuthenticatedRedirectPath } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/auth.store";

type GuestRouteProps = {
  children: ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={getAuthenticatedRedirectPath(user?.role)} replace />;
  }

  return children;
}
