import { useEffect, useState, type ReactNode } from "react";

import { AuthLoadingScreen } from "@/components/guards/auth-loading-screen";
import { authApi } from "@/features/auth/auth.api";
import { useAuthStore } from "@/stores/auth.store";

type AuthBootstrapProps = {
  children: ReactNode;
};

const ACCESS_TOKEN_REFRESH_INTERVAL_MS = 12 * 60 * 1000;

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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
        if (isMounted) {
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

  useEffect(() => {
    if (!isBootstrapped || !isAuthenticated || !accessToken) {
      return;
    }

    let isRefreshing = false;

    async function refreshSession() {
      if (isRefreshing) return;

      try {
        isRefreshing = true;

        const tokenData = await authApi.refresh();
        setAccessToken(tokenData.access_token);
      } catch {
        // Không clearAuth ở proactive refresh.
        // Nếu mạng chập chờn hoặc Render cold start, user không nên bị đá ra giữa lúc đang thi.
      } finally {
        isRefreshing = false;
      }
    }

    const intervalId = window.setInterval(
      refreshSession,
      ACCESS_TOKEN_REFRESH_INTERVAL_MS,
    );

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    }

    window.addEventListener("focus", refreshSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [accessToken, isAuthenticated, isBootstrapped, setAccessToken]);

  if (!isBootstrapped) {
    return <AuthLoadingScreen />;
  }

  return children;
}
