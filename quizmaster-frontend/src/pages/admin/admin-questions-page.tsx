import { AlertCircle, FileQuestion, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/features/categories/categories.hooks";
import { AdminQuestionFilters } from "@/features/questions/components/admin-question-filters";
import { AdminQuestionFormPanel } from "@/features/questions/components/admin-question-form-panel";
import { AdminQuestionTable } from "@/features/questions/components/admin-question-table";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
  useCreateQuestion,
  useDeleteQuestion,
  usePermanentlyDeleteQuestion,
  useQuestions,
  useUpdateQuestion,
  useRestoreQuestion,
} from "@/features/questions/questions.hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/axios";
import type {
  CreateQuestionRequest,
  Question,
  QuestionType,
} from "@/types/question";

function QuestionsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

export function AdminQuestionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"" | QuestionType>("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const debouncedSearch = useDebounce(search);

  const questionParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
      type: type || undefined,
      includeDeleted: includeDeleted || undefined,
    }),
    [categoryId, debouncedSearch, page, type, includeDeleted],
  );

  const categoriesQuery = useCategories();
  const questionsQuery = useQuestions(questionParams);
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();
  const permanentlyDeleteQuestionMutation = usePermanentlyDeleteQuestion();
  const restoreQuestionMutation = useRestoreQuestion();
  const categories = categoriesQuery.data ?? [];
  const questions = questionsQuery.data?.items ?? [];
  const meta = questionsQuery.data?.meta;

  const isInitialLoading = questionsQuery.isLoading && !questionsQuery.data;

  const isMutating =
    createQuestionMutation.isPending ||
    updateQuestionMutation.isPending ||
    deleteQuestionMutation.isPending ||
    restoreQuestionMutation.isPending ||
    permanentlyDeleteQuestionMutation.isPending;

  function resetPage() {
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetPage();
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    resetPage();
  }

  function handleTypeChange(value: "" | QuestionType) {
    setType(value);
    resetPage();
  }

  function handleIncludeDeletedChange(value: boolean) {
    setIncludeDeleted(value);
    resetPage();
  }
  async function handleCreateQuestion(payload: CreateQuestionRequest) {
    try {
      await createQuestionMutation.mutateAsync(payload);
      toast.success("Tạo câu hỏi thành công");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể tạo câu hỏi. Vui lòng thử lại."),
      );
    }
  }

  async function handleUpdateQuestion(
    questionId: string,
    payload: CreateQuestionRequest,
  ) {
    try {
      await updateQuestionMutation.mutateAsync({
        questionId,
        payload,
      });

      toast.success("Cập nhật câu hỏi thành công");
      setEditingQuestion(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể cập nhật câu hỏi. Vui lòng thử lại.",
        ),
      );
    }
  }

  async function handleDeleteQuestion(question: Question) {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa mềm câu hỏi này không?",
    );

    if (!confirmed) return;

    try {
      await deleteQuestionMutation.mutateAsync(question.id);
      toast.success("Đã xóa câu hỏi");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Không thể xóa câu hỏi. Vui lòng thử lại."),
      );
    }
  }

  async function handleRestoreQuestion(question: Question) {
    try {
      await restoreQuestionMutation.mutateAsync(question.id);
      toast.success("Đã restore câu hỏi");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể restore câu hỏi. Vui lòng thử lại.",
        ),
      );
    }
  }

  async function handlePermanentDeleteQuestion(question: Question) {
    const confirmed = window.confirm(
      "Xóa vĩnh viễn câu hỏi này? Hành động này không thể hoàn tác.",
    );

    if (!confirmed) return;

    try {
      await permanentlyDeleteQuestionMutation.mutateAsync(question.id);
      toast.success("Đã xóa vĩnh viễn câu hỏi");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể xóa vĩnh viễn câu hỏi. Vui lòng thử lại.",
        ),
      );
    }
  }

  if (isInitialLoading) {
    return <QuestionsLoading />;
  }

  if (questionsQuery.isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải danh sách câu hỏi"
        description="Có lỗi xảy ra khi lấy dữ liệu câu hỏi. Vui lòng thử lại sau."
        action={
          <Button onClick={() => questionsQuery.refetch()}>
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
          eyebrow="Question management"
          title="Quản lý câu hỏi"
          description="Tạo và quản lý ngân hàng câu hỏi single choice hoặc multiple choice theo từng category."
          icon={FileQuestion}
          tone="emerald"
          meta={
            <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
              Total questions: {meta?.total ?? 0}
            </span>
          }
          actions={
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => questionsQuery.refetch()}
            >
              <RefreshCcw className="mr-2 size-4" />
              Refresh
            </Button>
          }
        />
      </section>

      <AdminQuestionFormPanel
        question={editingQuestion}
        categories={categories}
        isSubmitting={
          createQuestionMutation.isPending || updateQuestionMutation.isPending
        }
        onCancelEdit={() => setEditingQuestion(null)}
        onCreate={handleCreateQuestion}
        onUpdate={handleUpdateQuestion}
      />

      <AdminQuestionFilters
        search={search}
        categoryId={categoryId}
        type={type}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onTypeChange={handleTypeChange}
        includeDeleted={includeDeleted}
        onIncludeDeletedChange={handleIncludeDeletedChange}
      />

      {questionsQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          Đang cập nhật danh sách câu hỏi...
        </p>
      ) : null}

      <AdminQuestionTable
        questions={questions}
        isMutating={isMutating}
        onEdit={setEditingQuestion}
        onDelete={handleDeleteQuestion}
        onRestore={handleRestoreQuestion}
        onPermanentDelete={handlePermanentDeleteQuestion}
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
    </div>
  );
}
