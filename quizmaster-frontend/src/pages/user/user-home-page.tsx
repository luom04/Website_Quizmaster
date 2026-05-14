import { useMemo, useState } from "react";
import { AlertCircle, BookOpenCheck, RotateCcw } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { QuizGridLoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/features/categories/categories.hooks";
import { QuizCard } from "@/features/quizzes/components/quiz-card";
import { QuizListFilters } from "@/features/quizzes/components/quiz-list-filters";
import { usePublicQuizzes } from "@/features/quizzes/quizzes.hooks";
import { useDebounce } from "@/hooks/useDebounce";
import type { Quiz } from "@/types/quiz";

export function UserHomePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const debouncedSearch = useDebounce(search);

  const quizParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      categoryId: selectedCategoryId || undefined,
      isPublished: true,
      sortBy: "createdAt" as const,
      order: "desc" as const,
    }),
    [debouncedSearch, page, selectedCategoryId],
  );

  const categoriesQuery = useCategories();
  const quizzesQuery = usePublicQuizzes(quizParams);

  const categories = categoriesQuery.data ?? [];

  const quizzes = quizzesQuery.data?.items ?? [];
  const meta = quizzesQuery.data?.meta;
  const totalQuizzes = quizzesQuery.data?.meta.total ?? quizzes.length;

  function handleResetFilters() {
    setSearch("");
    setSelectedCategoryId("");
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setSelectedCategoryId(value);
    setPage(1);
  }
  const hasFilters = Boolean(search || selectedCategoryId);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <BookOpenCheck className="size-3.5" />
            Quiz discovery
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Khám phá quiz
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Chọn một bài quiz phù hợp, xem thông tin chi tiết và bắt đầu làm bài
            khi bạn đã sẵn sàng.
          </p>
        </div>

        <div className="rounded-2xl border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">
            Các bài kiểm tra có sẵn
          </p>
          <p className="mt-1 text-2xl font-semibold">{totalQuizzes}</p>
        </div>
      </section>

      <QuizListFilters
        search={search}
        selectedCategoryId={selectedCategoryId}
        categories={categories}
        isCategoriesLoading={categoriesQuery.isLoading}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
      />

      {quizzesQuery.isLoading ? (
        <QuizGridLoadingState />
      ) : quizzesQuery.isError ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title="Không thể tải danh sách quiz"
          description="Có lỗi xảy ra khi lấy dữ liệu từ hệ thống. Vui lòng thử lại sau."
          action={
            <Button onClick={() => quizzesQuery.refetch()}>
              <RotateCcw className="size-4" />
              Tải lại
            </Button>
          }
        />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={<BookOpenCheck className="size-6" />}
          title={
            hasFilters ? "Không tìm thấy quiz phù hợp" : "Chưa có quiz nào"
          }
          description={
            hasFilters
              ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục."
              : "Hiện chưa có quiz public nào được phát hành."
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={handleResetFilters}>
                Xóa bộ lọc
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz: Quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
      {meta && meta.totalPages > 1 ? (
        <div className="mt-8 flex flex-col gap-3 rounded-3xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} / {meta.totalPages} · {meta.total} quizzes
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || quizzesQuery.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={page >= meta.totalPages || quizzesQuery.isFetching}
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
