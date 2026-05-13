import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  Loader2,
  LockKeyhole,
  Play,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PasswordField } from "@/components/forms/password-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { useStartAttempt } from "@/features/attempts/attempts.hooks";
import {
  quizPasswordSchema,
  type QuizPasswordFormValues,
} from "@/features/quizzes/quiz.schema";
import {
  useQuizDetail,
  useVerifyQuizPassword,
} from "@/features/quizzes/quizzes.hooks";
import { getApiErrorMessage } from "@/lib/axios";

function getQuizDetailPath(quizId: string) {
  return ROUTES.USER.QUIZ_DETAIL.replace(":quizId", quizId);
}

function getTakingQuizPath(attemptId: string) {
  return ROUTES.USER.TAKING_QUIZ.replace(":attemptId", attemptId);
}

function getPasswordErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return "Mật khẩu quiz không đúng.";
  }

  return getApiErrorMessage(
    error,
    "Không thể xác thực mật khẩu. Vui lòng thử lại.",
  );
}

function QuizPasswordLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-9 w-32" />

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="mt-5 h-9 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <Skeleton className="mt-6 h-10 w-full rounded-xl" />
        <Skeleton className="mt-4 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function QuizPasswordPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const quizQuery = useQuizDetail(quizId);
  const verifyPasswordMutation = useVerifyQuizPassword();
  const startAttemptMutation = useStartAttempt();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizPasswordFormValues>({
    resolver: zodResolver(quizPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const quiz = quizQuery.data;
  const isSubmitting =
    verifyPasswordMutation.isPending || startAttemptMutation.isPending;

  async function onSubmit(values: QuizPasswordFormValues) {
    if (!quizId) return;

    try {
      await verifyPasswordMutation.mutateAsync({
        quizId,
        password: values.password,
      });

      const attempt = await startAttemptMutation.mutateAsync({
        quizId,
        payload: {
          password: values.password,
        },
      });

      toast.success("Bắt đầu bài quiz");

      navigate(getTakingQuizPath(attempt.id));
    } catch (error) {
      toast.error(getPasswordErrorMessage(error));
    }
  }

  if (quizQuery.isLoading) {
    return <QuizPasswordLoading />;
  }

  if (quizQuery.isError || !quiz || !quizId) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải thông tin quiz"
        description="Quiz có thể không tồn tại hoặc đã bị gỡ khỏi hệ thống."
        action={
          <Button asChild>
            <Link to={ROUTES.USER.QUIZZES}>
              <ArrowLeft className="size-4" />
              Quay lại danh sách quiz
            </Link>
          </Button>
        }
      />
    );
  }

  if (quiz.accessMode !== "password_required") {
    return (
      <EmptyState
        icon={<LockKeyhole className="size-6" />}
        title="Quiz này không yêu cầu mật khẩu"
        description="Bạn có thể quay lại trang chi tiết để bắt đầu làm bài."
        action={
          <Button asChild>
            <Link to={getQuizDetailPath(quizId)}>
              <ArrowLeft className="size-4" />
              Quay lại chi tiết quiz
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button asChild variant="ghost" className="w-fit">
        <Link to={getQuizDetailPath(quizId)}>
          <ArrowLeft className="size-4" />
          Quay lại chi tiết
        </Link>
      </Button>

      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              <LockKeyhole className="size-3.5" />
              Password required
            </Badge>

            <Badge variant="secondary">{quiz.status || "Available"}</Badge>
          </div>

          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {quiz.title}
            </CardTitle>

            <CardDescription className="mt-3 leading-6">
              Quiz này yêu cầu mật khẩu trước khi bắt đầu. Nhập mật khẩu được
              cung cấp để tiếp tục làm bài.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="mt-1 text-sm font-medium">
                {quiz.category?.name || "General"}
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />
                Duration
              </div>
              <p className="mt-1 text-sm font-medium">
                {quiz.durationMinutes} phút
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <PasswordField
              id="password"
              label="Mật khẩu quiz"
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              disabled={isSubmitting}
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Xác thực và bắt đầu
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
