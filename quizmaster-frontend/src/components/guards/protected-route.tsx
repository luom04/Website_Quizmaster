import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthLoadingScreen } from "@/components/guards/auth-loading-screen";
import { ROUTES } from "@/config/routes";
import { getAuthenticatedRedirectPath } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/types/user";
type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={ROUTES.AUTH.LOGIN}
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getAuthenticatedRedirectPath(user.role)} replace />;
  }

  return children;
}
