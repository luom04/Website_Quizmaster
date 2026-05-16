import {
  CalendarClock,
  SlidersHorizontal,
  Target,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AttemptStatus } from "@/types/attempt";

type AdminRecentAttemptsFiltersProps = {
  status: "" | AttemptStatus;
  quizId: string;
  userId: string;
  from: string;
  to: string;
  onStatusChange: (value: "" | AttemptStatus) => void;
  onQuizIdChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
};

const statusOptions: Array<{
  value: "" | AttemptStatus;
  label: string;
  description: string;
}> = [
  {
    value: "",
    label: "Tất cả status",
    description: "Hiển thị mọi lượt làm bài gần đây.",
  },
  {
    value: "in_progress",
    label: "In progress",
    description: "Các lượt làm bài đang diễn ra.",
  },
  {
    value: "submitted",
    label: "Submitted",
    description: "Các lượt làm bài đã nộp.",
  },
  {
    value: "timed_out",
    label: "Timed out",
    description: "Các lượt làm bài hết thời gian.",
  },
];

const statusToneClasses: Record<AttemptStatus, string> = {
  in_progress: "bg-sky-500/10 text-sky-700",
  submitted: "bg-emerald-500/10 text-emerald-700",
  timed_out: "bg-amber-500/10 text-amber-700",
};

export function AdminRecentAttemptsFilters({
  status,
  quizId,
  userId,
  from,
  to,
  onStatusChange,
  onQuizIdChange,
  onUserIdChange,
  onFromChange,
  onToChange,
  onClear,
}: AdminRecentAttemptsFiltersProps) {
  const selectedStatus =
    statusOptions.find((option) => option.value === status) ?? statusOptions[0];

  const hasActiveFilters = Boolean(
    status || quizId.trim() || userId.trim() || from || to,
  );

  return (
    <Card className="overflow-hidden border-dashed bg-background/80">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <SlidersHorizontal className="size-5" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">
                  Bộ lọc recent attempts
                </h2>

                {status ? (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusToneClasses[status]}`}
                  >
                    {selectedStatus.label}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    All status
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {selectedStatus.description}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer justify-start text-muted-foreground disabled:cursor-not-allowed"
            disabled={!hasActiveFilters}
            onClick={onClear}
          >
            <X className="mr-2 size-4" />
            Clear filters
          </Button>
        </div>

        <div className="grid gap-3 xl:grid-cols-[0.75fr_1fr_1fr_0.8fr_0.8fr]">
          <select
            value={status}
            className="h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 text-sm outline-none qm-hover-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              onStatusChange(event.target.value as "" | AttemptStatus)
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <Target className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={quizId}
              className="h-10 rounded-xl pl-9"
              placeholder="Filter by quizId..."
              onChange={(event) => onQuizIdChange(event.target.value)}
            />
          </div>

          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={userId}
              className="h-10 rounded-xl pl-9"
              placeholder="Filter by userId..."
              onChange={(event) => onUserIdChange(event.target.value)}
            />
          </div>

          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={from}
              className="h-10 cursor-pointer rounded-xl pl-9"
              onChange={(event) => onFromChange(event.target.value)}
            />
          </div>

          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={to}
              className="h-10 cursor-pointer rounded-xl pl-9"
              onChange={(event) => onToChange(event.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Active filters:</span>

            {status ? (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 font-medium ${statusToneClasses[status]}`}
              >
                Status: {selectedStatus.label}
              </span>
            ) : null}

            {quizId.trim() ? (
              <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 font-medium text-violet-700">
                Quiz: {quizId.trim()}
              </span>
            ) : null}

            {userId.trim() ? (
              <span className="inline-flex rounded-full bg-slate-500/10 px-2.5 py-1 font-medium text-slate-700">
                User: {userId.trim()}
              </span>
            ) : null}

            {from ? (
              <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-700">
                From: {from}
              </span>
            ) : null}

            {to ? (
              <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-700">
                To: {to}
              </span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
