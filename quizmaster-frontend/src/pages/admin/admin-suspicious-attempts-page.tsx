import { AlertCircle, RefreshCcw, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSuspiciousAttempts } from "@/features/admin/admin.hooks";
import { AdminSuspiciousAttemptsFilters } from "@/features/admin/components/admin-suspicious-attempts-filters";
import { AdminSuspiciousAttemptsTable } from "@/features/admin/components/admin-suspicious-attempts-table";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminAttemptEventsPanel } from "@/features/admin/components/admin-attempt-events-panel";
import type { QuizEventType } from "@/types/attempt";
import type { AdminSuspiciousAttemptItem } from "@/types/admin";

function SuspiciousAttemptsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

export function AdminSuspiciousAttemptsPage() {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState<"" | QuizEventType>("");
  const [minTabSwitchCount, setMinTabSwitchCount] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedAttempt, setSelectedAttempt] =
    useState<AdminSuspiciousAttemptItem | null>(null);
  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      eventType: eventType || undefined,
      minTabSwitchCount:
        minTabSwitchCount.trim() === "" ? undefined : Number(minTabSwitchCount),
      from: from || undefined,
      to: to || undefined,
    }),
    [eventType, from, minTabSwitchCount, page, to],
  );

  const suspiciousAttemptsQuery = useAdminSuspiciousAttempts(queryParams);

  const attempts = suspiciousAttemptsQuery.data?.items ?? [];
  const meta = suspiciousAttemptsQuery.data?.meta;

  function resetPage() {
    setPage(1);
  }

  function handleEventTypeChange(value: "" | QuizEventType) {
    setEventType(value);
    resetPage();
  }

  function handleMinTabSwitchCountChange(value: string) {
    setMinTabSwitchCount(value);
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
    setEventType("");
    setMinTabSwitchCount("");
    setFrom("");
    setTo("");
    setSelectedAttempt(null);
    resetPage();
  }

  if (suspiciousAttemptsQuery.isLoading && !suspiciousAttemptsQuery.data) {
    return <SuspiciousAttemptsLoading />;
  }

  if (suspiciousAttemptsQuery.isError) {
    return (
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải suspicious attempts"
        description="Có lỗi xảy ra khi lấy dữ liệu suspicious attempts. Vui lòng kiểm tra filter và thử lại."
        action={
          <Button onClick={() => suspiciousAttemptsQuery.refetch()}>
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
          eyebrow="Suspicious attempts"
          title="Theo dõi bài làm đáng ngờ"
          description="Tập trung vào các lượt làm bài có dấu hiệu bất thường như chuyển tab nhiều lần, copy attempt, right click hoặc auto submit."
          icon={ShieldAlert}
          tone="rose"
          meta={
            <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600">
              Suspicious attempts: {meta?.total ?? 0}
            </span>
          }
          actions={
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => suspiciousAttemptsQuery.refetch()}
            >
              <RefreshCcw className="mr-2 size-4" />
              Refresh
            </Button>
          }
        />
      </section>

      <AdminSuspiciousAttemptsFilters
        eventType={eventType}
        minTabSwitchCount={minTabSwitchCount}
        from={from}
        to={to}
        onEventTypeChange={handleEventTypeChange}
        onMinTabSwitchCountChange={handleMinTabSwitchCountChange}
        onFromChange={handleFromChange}
        onToChange={handleToChange}
        onClear={handleClearFilters}
      />

      {suspiciousAttemptsQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          Đang cập nhật danh sách suspicious attempts...
        </p>
      ) : null}

      <AdminSuspiciousAttemptsTable
        attempts={attempts}
        onViewEvents={setSelectedAttempt}
      />
      <AdminAttemptEventsPanel
        attempt={selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
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
    </div>
  );
}
