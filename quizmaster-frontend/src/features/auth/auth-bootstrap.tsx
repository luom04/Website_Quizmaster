import { useEffect, useState, type ReactNode } from "react";

import { AuthLoadingScreen } from "@/components/guards/auth-loading-screen";
import { authApi } from "@/features/auth/auth.api";
import { useAuthStore } from "@/stores/auth.store";

type AuthBootstrapProps = {
  children: ReactNode;
};

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthLoading = useAuthStore((state) => state.setAuthLoading);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        setAuthLoading(true);

        const tokenData = await authApi.refresh();

        if (!isMounted) return;

        setAccessToken(tokenData.access_token);

        const currentUser = await authApi.getCurrentUser();

        if (!isMounted) return;

        setUser(currentUser);
      } catch {
        if (!isMounted) return;

        clearAuth();
      } finally {
        if (!isMounted) {
          setAuthLoading(false);
          setIsBootstrapped(true);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, setAccessToken, setAuthLoading, setUser]);

  if (!isBootstrapped) {
    return <AuthLoadingScreen />;
  }

  return children;
}
