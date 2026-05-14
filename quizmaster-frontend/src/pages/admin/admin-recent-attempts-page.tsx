import { Activity, AlertCircle, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminRecentAttemptsFilters } from "@/features/admin/components/admin-recent-attempts-filters";
import { AdminRecentAttemptsTable } from "@/features/admin/components/admin-recent-attempts-table";
import { useAdminRecentAttempts } from "@/features/admin/admin.hooks";
import { useDebounce } from "@/hooks/useDebounce";
import type { AttemptStatus } from "@/types/attempt";

function RecentAttemptsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

export function AdminRecentAttemptsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | AttemptStatus>("");
  const [quizId, setQuizId] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const debouncedQuizId = useDebounce(quizId);
  const debouncedUserId = useDebounce(userId);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      status: status || undefined,
      quizId: debouncedQuizId.trim() || undefined,
      userId: debouncedUserId.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [debouncedQuizId, debouncedUserId, from, page, status, to],
  );

  const attemptsQuery = useAdminRecentAttempts(queryParams);

  const attempts = attemptsQuery.data?.items ?? [];
  const meta = attemptsQuery.data?.meta;

  function resetPage() {
    setPage(1);
  }

  function handleStatusChange(value: "" | AttemptStatus) {
    setStatus(value);
    resetPage();
  }

  function handleFromChange(value: string) {
    setFrom(value);
    resetPage();
  }

  function handleToChange(value: string) {
    setTo(value);
    resetPage();
  }

  function handleClearFilters() {
    setStatus("");
    setQuizId("");
    setUserId("");
    setFrom("");
    setTo("");
    resetPage();
  }

  if (attemptsQuery.isLoading && !attemptsQuery.data) {
    return <RecentAttemptsLoading />;
  }

  if (attemptsQuery.isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải recent attempts"
        description="Có lỗi xảy ra khi lấy dữ liệu lượt làm bài gần đây. Vui lòng thử lại sau."
        action={
          <Button onClick={() => attemptsQuery.refetch()}>
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
              <Activity className="size-3.5 text-primary" />
              Recent attempts
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Lượt làm bài gần đây
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Theo dõi các lượt làm bài mới nhất, điểm số, trạng thái nộp bài và
              các sự kiện giám sát như chuyển tab hoặc hành vi bất thường.
            </p>
          </div>

          <div className="rounded-2xl border bg-background/80 px-4 py-3 shadow-sm">
            <p className="text-xs text-muted-foreground">Total attempts</p>
            <p className="mt-1 text-2xl font-semibold">{meta?.total ?? 0}</p>
          </div>
        </div>
      </section>

      <AdminRecentAttemptsFilters
        status={status}
        from={from}
        to={to}
        onStatusChange={handleStatusChange}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onClear={handleClearFilters}
      />

      {attemptsQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          Đang cập nhật danh sách attempts...
        </p>
      ) : null}

      <AdminRecentAttemptsTable attempts={attempts} />

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
