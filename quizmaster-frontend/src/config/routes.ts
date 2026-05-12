export const ROUTES = {
  HOME: "/",

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },

  USER: {
    QUIZZES: "/quizzes",
    QUIZ_DETAIL: "/quizzes/:quizId",
    QUIZ_PASSWORD: "/quizzes/:quizId/password",
    TAKING_QUIZ: "/attempts/:attemptId/taking",
    RESULT: "/attempts/:attemptId/result",
    HISTORY: "/history",
    PROFILE: "/profile",
  },

  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    CATEGORIES: "/admin/categories",
    QUESTIONS: "/admin/questions",
    QUIZZES: "/admin/quizzes",
    QUIZ_DETAIL: "/admin/quizzes/:quizId",
    RECENT_ATTEMPTS: "/admin/recent-attempts",
    SUSPICIOUS_ATTEMPTS: "/admin/suspicious-attempts",
  },
} as const;
