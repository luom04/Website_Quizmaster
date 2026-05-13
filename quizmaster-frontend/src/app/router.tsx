import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { PublicLayout } from "@/components/layout/public/public-layout";
import { UserLayout } from "@/components/layout/user/user-layout";
import { ROUTES } from "@/config/routes";

import { LoginPage } from "@/pages/public/login-page";
import { RegisterPage } from "@/pages/public/register-page";
import { ForgotPasswordPage } from "@/pages/public/forgot-password-page";
import { ResetPasswordPage } from "@/pages/public/reset-password-page";

import { UserHomePage } from "@/pages/user/user-home-page";
import { QuizDetailPage } from "@/pages/user/quiz-detail-page";
import { QuizPasswordPage } from "@/pages/user/quiz-password-page";
import { TakingQuizPage } from "@/pages/user/taking-quiz-page";
import { ResultPage } from "@/pages/user/result-page";
import { HistoryPage } from "@/pages/user/history-page";
import { ProfilePage } from "@/pages/user/profile-page";

import { AdminDashboardPage } from "@/pages/admin/admin-dashboard-page";
import { AdminUsersPage } from "@/pages/admin/admin-users-page";
import { AdminCategoriesPage } from "@/pages/admin/admin-categories-page";
import { AdminQuestionsPage } from "@/pages/admin/admin-questions-page";
import { AdminQuizzesPage } from "@/pages/admin/admin-quizzes-page";
import { AdminRecentAttemptsPage } from "@/pages/admin/admin-recent-attempts-page";
import { AdminSuspiciousAttemptsPage } from "@/pages/admin/admin-suspicious-attempts-page";

import { GuestRoute } from "@/components/guards/guest-route";
import { ProtectedRoute } from "@/components/guards/protected-route";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.USER.QUIZZES} replace />,
  },

  {
    element: (
      <GuestRoute>
        <PublicLayout />
      </GuestRoute>
    ),
    children: [
      {
        path: ROUTES.AUTH.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.AUTH.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: ROUTES.AUTH.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
      {
        path: ROUTES.AUTH.RESET_PASSWORD,
        element: <ResetPasswordPage />,
      },
    ],
  },

  {
    element: (
      <ProtectedRoute allowedRoles={["user", "admin"]}>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.USER.QUIZZES,
        element: <UserHomePage />,
      },
      {
        path: ROUTES.USER.QUIZ_DETAIL,
        element: <QuizDetailPage />,
      },
      {
        path: ROUTES.USER.QUIZ_PASSWORD,
        element: <QuizPasswordPage />,
      },
      {
        path: ROUTES.USER.TAKING_QUIZ,
        element: <TakingQuizPage />,
      },
      {
        path: ROUTES.USER.RESULT,
        element: <ResultPage />,
      },
      {
        path: ROUTES.USER.HISTORY,
        element: <HistoryPage />,
      },
      {
        path: ROUTES.USER.PROFILE,
        element: <ProfilePage />,
      },
    ],
  },

  {
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.ADMIN.DASHBOARD,
        element: <AdminDashboardPage />,
      },
      {
        path: ROUTES.ADMIN.USERS,
        element: <AdminUsersPage />,
      },
      {
        path: ROUTES.ADMIN.CATEGORIES,
        element: <AdminCategoriesPage />,
      },
      {
        path: ROUTES.ADMIN.QUESTIONS,
        element: <AdminQuestionsPage />,
      },
      {
        path: ROUTES.ADMIN.QUIZZES,
        element: <AdminQuizzesPage />,
      },
      {
        path: ROUTES.ADMIN.RECENT_ATTEMPTS,
        element: <AdminRecentAttemptsPage />,
      },
      {
        path: ROUTES.ADMIN.SUSPICIOUS_ATTEMPTS,
        element: <AdminSuspiciousAttemptsPage />,
      },
    ],
  },

  {
    path: "*",
    // element: <Navigate to={ROUTES.USER.QUIZZES} replace />,
    element: <div className="p-6">404 - Page not found</div>,
  },
]);
