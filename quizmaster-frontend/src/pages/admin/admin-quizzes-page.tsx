import { AlertCircle, BookOpenCheck, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { getApiErrorMessage } from "@/lib/axios";
import { toast } from "sonner";
import type { CreateQuizRequest, Quiz, QuizStatus } from "@/types/quiz";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminQuizFilters } from "@/features/quizzes/components/admin-quiz-filters";
import { AdminQuizTable } from "@/features/quizzes/components/admin-quiz-table";
import { AdminQuizFormPanel } from "@/features/quizzes/components/admin-quiz-form-panel";
import { AdminQuizQuestionManager } from "@/features/quizzes/components/admin-quiz-question-manager";
import { AdminQuizPasswordPanel } from "@/features/quizzes/components/admin-quiz-password-panel";
import {
  useAdminQuizzes,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  usePermanentlyDeleteQuiz,
  useRestoreQuiz,
} from "@/features/quizzes/quizzes.hooks";
import { useCategories } from "@/features/categories/categories.hooks";

function QuizzesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminQuizzesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | QuizStatus>("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [managingQuestionsQuiz, setManagingQuestionsQuiz] =
    useState<Quiz | null>(null);
  const [passwordQuiz, setPasswordQuiz] = useState<Quiz | null>(null);
  const quizParams = useMemo(
    () => ({
      page,
      limit: 10,
      status: status || undefined,
    }),
    [page, status],
  );

  const quizzesQuery = useAdminQuizzes(quizParams);
  const categoriesQuery = useCategories();
  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();
  const deleteQuizMutation = useDeleteQuiz();
  const restoreQuizMutation = useRestoreQuiz();
  const permanentlyDeleteQuizMutation = usePermanentlyDeleteQuiz();
  const quizzes = quizzesQuery.data?.items ?? [];
  const meta = quizzesQuery.data?.meta;
  const categories = categoriesQuery.data ?? [];

  const isMutating =
    createQuizMutation.isPending ||
    updateQuizMutation.isPending ||
    deleteQuizMutation.isPending ||
    restoreQuizMutation.isPending ||
    permanentlyDeleteQuizMutation.isPending;

  function handleStatusChange(value: "" | QuizStatus) {
    setStatus(value);
    setPage(1);
  }

  async function handleCreateQuiz(payload: CreateQuizRequest) {
    try {
      await createQuizMutation.mutateAsync(payload);
      toast.success("Tạo quiz thành công");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể tạo quiz. Vui lòng thử lại."),
      );
    }
  }

  async function handleUpdateQuiz(quizId: string, payload: CreateQuizRequest) {
    try {
      await updateQuizMutation.mutateAsync({
        quizId,
        payload,
      });

      toast.success("Cập nhật quiz thành công");
      setEditingQuiz(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể cập nhật quiz. Vui lòng thử lại."),
      );
    }
  }

  async function handleDeleteQuiz(quiz: Quiz) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa mềm quiz "${quiz.title}" không?`,
    );

    if (!confirmed) return;

    try {
      await deleteQuizMutation.mutateAsync(quiz.id);

      toast.success("Đã xóa quiz");
      setSelectedQuiz(null);

      if (editingQuiz?.id === quiz.id) {
        setEditingQuiz(null);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể xóa quiz. Vui lòng thử lại."),
      );
    }
  }

  async function handleRestoreQuiz(quiz: Quiz) {
    try {
      await restoreQuizMutation.mutateAsync(quiz.id);

      toast.success("Đã restore quiz");
      setSelectedQuiz(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể restore quiz. Vui lòng thử lại."),
      );
    }
  }

  async function handlePermanentDeleteQuiz(quiz: Quiz) {
    const confirmed = window.confirm(
      `Xóa vĩnh viễn quiz "${quiz.title}"? Hành động này không thể hoàn tác.`,
    );

    if (!confirmed) return;

    try {
      await permanentlyDeleteQuizMutation.mutateAsync(quiz.id);

      toast.success("Đã xóa vĩnh viễn quiz");
      setSelectedQuiz(null);

      if (editingQuiz?.id === quiz.id) {
        setEditingQuiz(null);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể xóa vĩnh viễn quiz. Quiz có thể đang có dữ liệu liên quan.",
        ),
      );
    }
  }

  if (quizzesQuery.isLoading && !quizzesQuery.data) {
    return <QuizzesLoading />;
  }

  if (quizzesQuery.isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải danh sách quiz"
        description="Có lỗi xảy ra khi lấy dữ liệu quiz. Vui lòng thử lại sau."
        action={
          <Button onClick={() => quizzesQuery.refetch()}>
            <RefreshCcw className="size-4" />
            Tải lại
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <BookOpenCheck className="size-3.5 text-primary" />
              Quiz management
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Quản lý quizzes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Theo dõi danh sách quiz, trạng thái phát hành, cấu hình làm bài và
              lịch mở quiz.
            </p>
          </div>

          <div className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm">
            <p className="text-xs text-muted-foreground">Total quizzes</p>
            <p className="mt-1 text-2xl font-semibold">{meta?.total ?? 0}</p>
          </div>
        </div>
      </section>

      <AdminQuizFormPanel
        quiz={editingQuiz}
        categories={categories}
        isSubmitting={isMutating}
        onCancelEdit={() => setEditingQuiz(null)}
        onCreate={handleCreateQuiz}
        onUpdate={handleUpdateQuiz}
      />

      <AdminQuizFilters status={status} onStatusChange={handleStatusChange} />

      {quizzesQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          Đang cập nhật danh sách quiz...
        </p>
      ) : null}

      <AdminQuizTable
        quizzes={quizzes}
        onView={setSelectedQuiz}
        onEdit={(quiz) => {
          setEditingQuiz(quiz);
          setSelectedQuiz(null);
          setManagingQuestionsQuiz(null);
          setPasswordQuiz(null);
        }}
        onManageQuestions={(quiz) => {
          setManagingQuestionsQuiz(quiz);
          setSelectedQuiz(null);
          setEditingQuiz(null);
          setPasswordQuiz(null);
        }}
        onViewPassword={(quiz) => {
          setPasswordQuiz(quiz);
          setSelectedQuiz(null);
          setEditingQuiz(null);
          setManagingQuestionsQuiz(null);
        }}
        onDelete={handleDeleteQuiz}
        onRestore={handleRestoreQuiz}
        onPermanentDelete={handlePermanentDeleteQuiz}
      />

      <AdminQuizQuestionManager
        quiz={managingQuestionsQuiz}
        onClose={() => setManagingQuestionsQuiz(null)}
      />
      <AdminQuizPasswordPanel
        quiz={passwordQuiz}
        onClose={() => setPasswordQuiz(null)}
      />
      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 rounded-3xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} / {meta.totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page >= meta.totalPages}
              onClick={() =>
                setPage((current) => Math.min(meta.totalPages, current + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {selectedQuiz ? (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Chi tiết quiz</CardTitle>
              <CardDescription>
                Thông tin nhanh của quiz đang được chọn.
              </CardDescription>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedQuiz(null)}
            >
              Đóng
            </Button>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="mt-2 text-sm font-medium">{selectedQuiz.title}</p>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="mt-2 text-sm font-medium">
                {selectedQuiz.category?.name || "General"}
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Access mode</p>
              <p className="mt-2 text-sm font-medium">
                {selectedQuiz.accessMode}
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Show answer</p>
              <p className="mt-2 text-sm font-medium">
                {selectedQuiz.showAnswer ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Shuffle</p>
              <p className="mt-2 text-sm font-medium">
                Questions: {selectedQuiz.shuffleQuestions ? "Yes" : "No"} ·
                Options: {selectedQuiz.shuffleOptions ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Schedule</p>
              <p className="mt-2 text-sm font-medium">
                {formatDateTime(selectedQuiz.startsAt)} →{" "}
                {formatDateTime(selectedQuiz.endsAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
