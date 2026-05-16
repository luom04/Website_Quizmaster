import {
  AlertCircle,
  Clock3,
  Filter,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  X,
} from "lucide-react";
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

const EVENT_LABELS: Record<QuizEventType, string> = {
  tab_blur: "Tab blur",
  tab_focus: "Tab focus",
  copy_attempt: "Copy attempt",
  right_click: "Right click",
  auto_submitted: "Auto submitted",
};

const EVENT_TONE_CLASSES: Record<QuizEventType, string> = {
  tab_blur: "bg-amber-500/10 text-amber-700",
  tab_focus: "bg-blue-500/10 text-blue-700",
  copy_attempt: "bg-rose-500/10 text-rose-700",
  right_click: "bg-orange-500/10 text-orange-700",
  auto_submitted: "bg-violet-500/10 text-violet-700",
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
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <CardHeader className="relative overflow-hidden border-b bg-rose-50/80">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/20 via-orange-500/10 to-amber-500/20" />
        <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-rose-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
                <ShieldAlert className="size-5" />
              </span>

              <div>
                <CardTitle>Event timeline</CardTitle>
                <CardDescription className="mt-1">
                  Xem các event của attempt theo thứ tự thời gian.
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {attempt.eventCount} events
              </span>

              <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-700">
                {attempt.tabSwitchCount} tab switches
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {attempt.user.email}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onClose}
          >
            <X className="mr-2 size-4" />
            Đóng
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 rounded-3xl border bg-muted/20 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              User
            </p>
            <p className="mt-1 truncate text-sm font-medium">
              {attempt.user.name || "Unnamed user"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {attempt.user.email}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quiz
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-medium">
              {attempt.quiz.title}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Monitoring
            </p>
            <p className="mt-1 text-sm font-medium">
              {attempt.eventCount} events · {attempt.tabSwitchCount} tab
              switches
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={eventType}
              className="h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 pl-9 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          </div>

          <select
            value={sort}
            className="h-10 cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            className="cursor-pointer"
            onClick={() => eventsQuery.refetch()}
          >
            <RefreshCcw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>

        {eventsQuery.isLoading && !eventsQuery.data ? (
          <div className="flex items-center gap-2 rounded-2xl border bg-muted/20 p-5 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải event timeline...
          </div>
        ) : eventsQuery.isError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Không thể tải event timeline.</p>
              <p className="mt-1 text-destructive/80">
                Vui lòng thử lại hoặc kiểm tra quyền admin.
              </p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-background p-5 text-sm text-muted-foreground">
            Không có event nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => {
              const timelineIndex =
                (meta?.page ?? 1) * (meta?.limit ?? 5) -
                (meta?.limit ?? 5) +
                index +
                1;

              return (
                <div
                  key={event.id}
                  className="rounded-3xl border bg-background p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          #{timelineIndex}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            EVENT_TONE_CLASSES[event.eventType]
                          }`}
                        >
                          {getEventLabel(event.eventType)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="size-4" />
                        {formatDateTime(event.createdAt)}
                      </div>
                    </div>

                    <div className="min-w-0 lg:w-[55%]">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Metadata
                      </p>

                      {event.metadata ? (
                        <pre className="max-h-40 overflow-auto rounded-2xl bg-muted/70 p-3 text-xs leading-5">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      ) : (
                        <div className="rounded-2xl border border-dashed p-3 text-sm text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {meta ? (
          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {meta.page} / {meta.totalPages || 1} · Total {meta.total}{" "}
              events
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer disabled:cursor-not-allowed"
                disabled={meta.page <= 1 || eventsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer disabled:cursor-not-allowed"
                disabled={
                  meta.page >= meta.totalPages ||
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
