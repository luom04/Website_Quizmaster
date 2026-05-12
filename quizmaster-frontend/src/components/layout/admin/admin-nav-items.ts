import {
  BarChart3,
  BookOpenCheck,
  FolderTree,
  LayoutDashboard,
  ListChecks,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { ROUTES } from "@/config/routes";

export const adminNavItems = [
  {
    label: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: ROUTES.ADMIN.USERS,
    icon: UsersRound,
  },
  {
    label: "Categories",
    href: ROUTES.ADMIN.CATEGORIES,
    icon: FolderTree,
  },
  {
    label: "Questions",
    href: ROUTES.ADMIN.QUESTIONS,
    icon: ListChecks,
  },
  {
    label: "Quizzes",
    href: ROUTES.ADMIN.QUIZZES,
    icon: BookOpenCheck,
  },
  {
    label: "Recent Attempts",
    href: ROUTES.ADMIN.RECENT_ATTEMPTS,
    icon: BarChart3,
  },
  {
    label: "Suspicious",
    href: ROUTES.ADMIN.SUSPICIOUS_ATTEMPTS,
    icon: ShieldAlert,
  },
] as const;
