import {
  AlertCircle,
  BarChart3,
  RefreshCcw,
  CheckCircle2,
  Layers3,
  FilePenLine,
  Trash2,
} from "lucide-react";
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
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
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

type QuizSummaryCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ElementType;
  tone: "violet" | "emerald" | "amber" | "rose";
};

const summaryToneClasses: Record<
  QuizSummaryCardProps["tone"],
  {
    icon: string;
    value: string;
  }
> = {
  violet: {
    icon: "bg-violet-500/10 text-violet-600",
    value: "text-violet-700",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600",
    value: "text-emerald-700",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600",
    value: "text-amber-700",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600",
    value: "text-rose-700",
  },
};

function QuizSummaryCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: QuizSummaryCardProps) {
  const styles = summaryToneClasses[tone];

  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-start gap-4 p-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`mt-1 text-2xl font-semibold ${styles.value}`}>
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
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

  const publishedCount = quizzes.filter((quiz) => quiz.isPublished).length;
  const draftCount = quizzes.filter((quiz) => quiz.status === "DRAFT").length;
  const deletedCount = quizzes.filter(
    (quiz) => quiz.status === "DELETED",
  ).length;

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

  const isInitialLoading =
    (quizzesQuery.isLoading && !quizzesQuery.data) ||
    (categoriesQuery.isLoading && !categoriesQuery.data);

  if (isInitialLoading) {
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
        <AdminPageHeader
          eyebrow="Admin dashboard"
          title="Tổng quan hệ thống"
          description="Theo dõi nhanh người dùng, quiz, câu hỏi, lượt làm bài và các dấu hiệu bất thường trong Quizmaster."
          icon={BarChart3}
          tone="blue"
          actions={
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => quizzesQuery.refetch()}
            >
              <RefreshCcw className="mr-2 size-4" />
              Làm mới dữ liệu
            </Button>
          }
        />
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuizSummaryCard
            label="Total in current view"
            value={quizzes.length}
            description={`Showing ${quizzes.length} of ${meta?.total ?? 0} quizzes.`}
            icon={Layers3}
            tone="violet"
          />

          <QuizSummaryCard
            label="Published"
            value={publishedCount}
            description="Quizzes currently visible to users."
            icon={CheckCircle2}
            tone="emerald"
          />

          <QuizSummaryCard
            label="Draft"
            value={draftCount}
            description="Quizzes still being prepared."
            icon={FilePenLine}
            tone="amber"
          />

          <QuizSummaryCard
            label="Deleted"
            value={deletedCount}
            description="Soft-deleted quizzes in this view."
            icon={Trash2}
            tone="rose"
          />
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
      {quizzesQuery.isFetching && quizzesQuery.data ? (
        <div className="rounded-2xl border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
          Đang cập nhật danh sách quizzes...
        </div>
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
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              className="cursor-pointer disabled:cursor-not-allowed"
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
