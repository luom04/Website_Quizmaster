import { ROUTES } from "@/config/routes";

export const userNavItems = [
  {
    label: "Quizzes",
    href: ROUTES.USER.QUIZZES,
  },
  {
    label: "History",
    href: ROUTES.USER.HISTORY,
  },
  {
    label: "Profile",
    href: ROUTES.USER.PROFILE,
  },
] as const;
