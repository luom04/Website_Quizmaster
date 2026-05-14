import { AlertCircle, Eye, Loader2, RefreshCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAttemptEvents } from "@/features/admin/admin.hooks";
import type { AdminSuspiciousAttemptItem } from "@/types/admin";
import type { QuizEventType } from "@/types/attempt";

type AdminAttemptEventsPanelProps = {
  attempt: AdminSuspiciousAttemptItem | null;
  onClose: () => void;
};

const EVENT_LABELS: Record<string, string> = {
  tab_blur: "Tab blur",
  tab_focus: "Tab focus",
  copy_attempt: "Copy attempt",
  right_click: "Right click",
  auto_submitted: "Auto submitted",
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getEventLabel(eventType: QuizEventType) {
  return EVENT_LABELS[eventType] || eventType;
}

export function AdminAttemptEventsPanel({
  attempt,
  onClose,
}: AdminAttemptEventsPanelProps) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [eventType, setEventType] = useState<"" | QuizEventType>("");

  useEffect(() => {
    setPage(1);
    setSort("asc");
    setEventType("");
  }, [attempt?.attemptId]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 5,
      sort,
      eventType: eventType || undefined,
    }),
    [eventType, page, sort],
  );

  const eventsQuery = useAdminAttemptEvents(attempt?.attemptId, queryParams);

  if (!attempt) return null;

  const events = eventsQuery.data?.items ?? [];
  const meta = eventsQuery.data?.meta;

  function handleSortChange(value: "asc" | "desc") {
    setSort(value);
    setPage(1);
  }

  function handleEventTypeChange(value: "" | QuizEventType) {
    setEventType(value);
    setPage(1);
  }

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Event timeline
          </CardTitle>

          <CardDescription>
            Xem các event của attempt theo thứ tự thời gian. Mặc định hiển thị 5
            event đầu tiên.
          </CardDescription>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <X className="size-4" />
          Đóng
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 rounded-2xl border bg-muted/30 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">User</p>
            <p className="mt-1 text-sm font-medium">
              {attempt.user.name || "Unnamed user"}
            </p>
            <p className="mt-1 break-all text-xs text-muted-foreground">
              {attempt.user.email}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Quiz</p>
            <p className="mt-1 line-clamp-2 text-sm font-medium">
              {attempt.quiz.title}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Monitoring</p>
            <p className="mt-1 text-sm font-medium">
              {attempt.eventCount} events · {attempt.tabSwitchCount} tab
              switches
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[220px_180px_auto] md:items-center">
          <select
            value={eventType}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              handleEventTypeChange(event.target.value as "" | QuizEventType)
            }
          >
            <option value="">Tất cả event</option>
            <option value="tab_blur">Tab blur</option>
            <option value="tab_focus">Tab focus</option>
            <option value="copy_attempt">Copy attempt</option>
            <option value="right_click">Right click</option>
            <option value="auto_submitted">Auto submitted</option>
          </select>

          <select
            value={sort}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              handleSortChange(event.target.value as "asc" | "desc")
            }
          >
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={() => eventsQuery.refetch()}
          >
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>

        {eventsQuery.isLoading && !eventsQuery.data ? (
          <div className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải event timeline...
          </div>
        ) : eventsQuery.isError ? (
          <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-6 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 text-destructive" />
            Không thể tải event timeline. Vui lòng thử lại.
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Không có event nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[80px_220px_1fr]"
              >
                <div>
                  <p className="text-xs text-muted-foreground">No.</p>
                  <p className="mt-1 text-sm font-semibold">
                    #
                    {(meta?.page ?? 1) * (meta?.limit ?? 5) -
                      (meta?.limit ?? 5) +
                      index +
                      1}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Event</p>
                  <p className="mt-1 text-sm font-medium">
                    {getEventLabel(event.eventType)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(event.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Metadata</p>

                  {event.metadata ? (
                    <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {meta ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} / {meta.totalPages || 1} · Total {meta.total}{" "}
              events
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1 || eventsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={
                  page >= meta.totalPages ||
                  meta.totalPages === 0 ||
                  eventsQuery.isFetching
                }
                onClick={() =>
                  setPage((current) => Math.min(meta.totalPages, current + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
