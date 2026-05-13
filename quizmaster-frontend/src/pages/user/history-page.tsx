import { useState } from "react";
import { AlertCircle, History, RotateCcw } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AttemptHistoryCard } from "@/features/attempts/components/attempt-history-card";
import { useMyHistory } from "@/features/attempts/attempts.hooks";
import type { AttemptStatus } from "@/types/attempt";

const statusOptions: Array<{
  label: string;
  value: "" | AttemptStatus;
}> = [
  {
    label: "Tất cả",
    value: "",
  },
  {
    label: "Đang làm",
    value: "in_progress",
  },
  {
    label: "Đã nộp",
    value: "submitted",
  },
  {
    label: "Hết giờ",
    value: "timed_out",
  },
];

function HistoryLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-7 w-44 rounded-full" />
              <Skeleton className="h-7 w-72 max-w-full" />
              <Skeleton className="h-4 w-56" />
            </div>

            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, statIndex) => (
              <Skeleton key={statIndex} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | AttemptStatus>("");

  const historyQuery = useMyHistory({
    page,
    limit: 10,
    status: status || undefined,
  });

  const attempts = historyQuery.data?.items ?? [];
  const meta = historyQuery.data?.meta;

  function handleStatusChange(nextStatus: "" | AttemptStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <History className="size-3.5" />
            My attempts
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Lịch sử làm bài
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Theo dõi các lần làm quiz, trạng thái bài làm, điểm số và xem lại
            bài đã nộp khi cần.
          </p>
        </div>

        <div className="rounded-2xl border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Total attempts</p>
          <p className="mt-1 text-2xl font-semibold">{meta?.total ?? 0}</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-3xl border bg-card p-3 shadow-sm">
        {statusOptions.map((item) => (
          <Button
            className="cursor-pointer"
            key={item.value || "all"}
            type="button"
            variant={status === item.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {historyQuery.isLoading ? (
        <HistoryLoading />
      ) : historyQuery.isError ? (
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title="Không thể tải lịch sử làm bài"
          description="Có lỗi xảy ra khi lấy dữ liệu từ hệ thống. Vui lòng thử lại sau."
          action={
            <Button onClick={() => historyQuery.refetch()}>
              <RotateCcw className="size-4" />
              Tải lại
            </Button>
          }
        />
      ) : attempts.length === 0 ? (
        <EmptyState
          icon={<History className="size-6" />}
          title="Chưa có lịch sử làm bài"
          description={
            status
              ? "Không có attempt nào khớp với trạng thái đang chọn."
              : "Bạn chưa bắt đầu hoặc nộp bài quiz nào."
          }
          action={
            status ? (
              <Button variant="outline" onClick={() => handleStatusChange("")}>
                Xóa bộ lọc
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <AttemptHistoryCard key={attempt.id} attempt={attempt} />
          ))}
        </div>
      )}

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
