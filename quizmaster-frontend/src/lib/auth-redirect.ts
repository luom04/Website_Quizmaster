import { ROUTES } from "@/config/routes";
import type { UserRole } from "@/types/user";

export function getAuthenticatedRedirectPath(role?: UserRole | null) {
  if (role === "admin") {
    return ROUTES.ADMIN.DASHBOARD;
  }

  return ROUTES.USER.QUIZZES;
}
