import { useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileClock,
  History,
  ListFilter,
  RotateCcw,
  SearchX,
} from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { AttemptHistoryCard } from "@/features/attempts/components/attempt-history-card";
import { useMyHistory } from "@/features/attempts/attempts.hooks";

import { cn } from "@/lib/utils";
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
        <div key={index} className="qm-soft-card overflow-hidden">
          <div className="border-b bg-muted/25 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-28 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>

                <Skeleton className="mt-5 h-7 w-[420px] max-w-full" />
                <Skeleton className="mt-3 h-5 w-64 max-w-full" />
              </div>

              <Skeleton className="h-10 w-32 rounded-2xl" />
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
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
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] qm-exam-focus-bg px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="qm-page-shell-wide space-y-6 animate-in fade-in duration-500">
        <section className="qm-soft-card overflow-hidden">
          <div className="border-b bg-muted/25 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="qm-section-eyebrow">
                  <History className="size-3.5" />
                  My attempts
                </p>

                <h1 className="qm-section-title mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Lịch sử làm bài
                </h1>

                <p className="qm-section-description mt-3 max-w-2xl leading-7">
                  Theo dõi các lần làm quiz, trạng thái bài làm, điểm số và xem
                  lại bài đã nộp khi cần.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-fit">
                <div className="rounded-2xl border bg-background/75 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Total attempts
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {meta?.total ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl border bg-background/75 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Current page</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {meta?.page ?? page}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ListFilter className="size-4" />
                Lọc theo trạng thái
              </div>

              <div className="flex flex-wrap gap-2 rounded-3xl border bg-background/70 p-1.5">
                {statusOptions.map((item) => {
                  const isActive = status === item.value;

                  return (
                    <Button
                      key={item.value || "all"}
                      type="button"
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "rounded-2xl px-4",
                        !isActive &&
                          "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => handleStatusChange(item.value)}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {historyQuery.isLoading ? (
          <HistoryLoading />
        ) : historyQuery.isError ? (
          <div className="qm-soft-card p-5 sm:p-6">
            <EmptyState
              icon={<AlertCircle className="size-6" />}
              title="Không thể tải lịch sử làm bài"
              description="Có lỗi xảy ra khi lấy dữ liệu từ hệ thống. Vui lòng thử lại sau."
              action={
                <Button
                  type="button"
                  className="rounded-2xl"
                  onClick={() => historyQuery.refetch()}
                >
                  <RotateCcw className="size-4" />
                  Tải lại
                </Button>
              }
            />
          </div>
        ) : attempts.length === 0 ? (
          <div className="qm-soft-card p-5 sm:p-6">
            <EmptyState
              icon={
                status ? (
                  <SearchX className="size-6" />
                ) : (
                  <FileClock className="size-6" />
                )
              }
              title="Chưa có lịch sử làm bài"
              description={
                status
                  ? "Không có attempt nào khớp với trạng thái đang chọn."
                  : "Bạn chưa bắt đầu hoặc nộp bài quiz nào."
              }
              action={
                status ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl bg-background/75"
                    onClick={() => handleStatusChange("")}
                  >
                    Xóa bộ lọc
                  </Button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <AttemptHistoryCard key={attempt.id} attempt={attempt} />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="qm-soft-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-semibold text-foreground">{meta.page}</span>{" "}
              / {meta.totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl bg-background/75"
                disabled={meta.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                className="rounded-2xl bg-background/75"
                disabled={meta.page >= meta.totalPages}
                onClick={() =>
                  setPage((current) => Math.min(meta.totalPages, current + 1))
                }
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
