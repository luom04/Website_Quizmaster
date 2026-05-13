import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  LockKeyhole,
  Play,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { useStartAttempt } from "@/features/attempts/attempts.hooks";
import { QuizDetailSummary } from "@/features/quizzes/components/quiz-detail-summary";
import { useQuizDetail } from "@/features/quizzes/quizzes.hooks";
import { getApiErrorMessage } from "@/lib/axios";

function getQuizListPath() {
  return ROUTES.USER.QUIZZES;
}

function getQuizPasswordPath(quizId: string) {
  return ROUTES.USER.QUIZ_PASSWORD.replace(":quizId", quizId);
}

function getTakingQuizPath(attemptId: string) {
  return ROUTES.USER.TAKING_QUIZ.replace(":attemptId", attemptId);
}

function QuizDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>

        <Skeleton className="mt-5 h-10 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    </div>
  );
}

export function QuizDetailPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const quizQuery = useQuizDetail(quizId);
  const startAttemptMutation = useStartAttempt();

  const quiz = quizQuery.data;
  const questionCount = quiz?.questionCount ?? quiz?._count?.quizQuestions ?? 0;

  const canStartQuiz = quiz?.status === "ONGOING" && questionCount > 0;

  async function handleStartQuiz() {
    if (!quizId || !quiz) return;

    if (quiz.accessMode === "password_required") {
      navigate(getQuizPasswordPath(quizId));
      return;
    }

    try {
      const attempt = await startAttemptMutation.mutateAsync({
        quizId,
      });

      toast.success("Bắt đầu bài quiz");

      navigate(getTakingQuizPath(attempt.id));
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể bắt đầu quiz. Vui lòng thử lại."),
      );
    }
  }

  if (quizQuery.isLoading) {
    return <QuizDetailLoading />;
  }

  if (quizQuery.isError || !quiz) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải chi tiết quiz"
        description="Quiz có thể không tồn tại hoặc đã bị gỡ khỏi hệ thống."
        action={
          <Button asChild>
            <Link to={getQuizListPath()}>
              <ArrowLeft className="size-4" />
              Quay lại danh sách quiz
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Action: Tối ưu khoảng cách và bo góc nút */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="ghost"
          className="w-fit rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
        >
          <Link to={getQuizListPath()} className="gap-2">
            <ArrowLeft className="size-4" />
            Quay lại danh sách
          </Link>
        </Button>

        <Button
          size="lg"
          className="w-full sm:w-fit cursor-pointer rounded-2xl px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
          disabled={!canStartQuiz || startAttemptMutation.isPending}
          onClick={handleStartQuiz}
        >
          {startAttemptMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang chuẩn bị...
            </>
          ) : quiz.accessMode === "password_required" ? (
            <>
              <LockKeyhole className="size-4" />
              Nhập mật khẩu để mở
            </>
          ) : (
            <>
              <Play className="size-4 fill-current" />
              Bắt đầu làm bài ngay
            </>
          )}
        </Button>
      </div>

      {/* Thông báo trạng thái: Bo góc 2xl đồng bộ */}
      {!canStartQuiz && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
          <AlertCircle className="size-5 shrink-0" />
          Quiz hiện chưa thể bắt đầu. Có thể bài thi đang tạm đóng hoặc chưa có
          bộ câu hỏi chính thức.
        </div>
      )}

      {/* Phần Detail Summary */}
      <QuizDetailSummary quiz={quiz} />
    </div>
  );
}
