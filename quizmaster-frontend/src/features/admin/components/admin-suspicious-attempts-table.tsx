import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminSuspiciousAttemptItem } from "@/types/admin";
import type { AttemptStatus } from "@/types/attempt";

type AdminSuspiciousAttemptsTableProps = {
  attempts: AdminSuspiciousAttemptItem[];
  onViewEvents: (attempt: AdminSuspiciousAttemptItem) => void;
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

function getStatusLabel(status: AttemptStatus) {
  const labels: Record<string, string> = {
    in_progress: "In progress",
    submitted: "Submitted",
    timed_out: "Timed out",
  };

  return labels[status] || status;
}

function getStatusClassName(status: AttemptStatus) {
  switch (status) {
    case "submitted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "timed_out":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300";
    case "in_progress":
    default:
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300";
  }
}

function renderEventSummary(
  eventSummary: AdminSuspiciousAttemptItem["eventSummary"],
) {
  const entries = Object.entries(eventSummary).filter(
    ([, count]) => Number(count) > 0,
  );

  if (entries.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([eventType, count]) => (
        <Badge key={eventType} variant="outline">
          {EVENT_LABELS[eventType] || eventType}: {count}
        </Badge>
      ))}
    </div>
  );
}

export function AdminSuspiciousAttemptsTable({
  attempts,
  onViewEvents,
}: AdminSuspiciousAttemptsTableProps) {
  if (attempts.length === 0) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
        Không có suspicious attempt nào khớp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Quiz</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Monitoring</th>
              <th className="px-4 py-3 font-medium">Event summary</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {attempts.map((attempt) => (
              <tr key={attempt.attemptId} className="bg-card align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {attempt.user.name || "Unnamed user"}
                  </p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {attempt.user.email}
                  </p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {attempt.user.id}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <p className="line-clamp-2 max-w-sm font-medium">
                    {attempt.quiz.title}
                  </p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {attempt.quiz.id}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={getStatusClassName(attempt.status)}
                  >
                    {getStatusLabel(attempt.status)}
                  </Badge>

                  {attempt.isPassed !== null ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {attempt.isPassed ? "Passed" : "Failed"}
                    </p>
                  ) : null}
                </td>

                <td className="px-4 py-3">
                  <p className="font-medium">
                    {attempt.score === null
                      ? "—"
                      : `${attempt.score}/${attempt.totalQuestions}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {attempt.correctCount}/{attempt.totalQuestions} correct
                  </p>
                </td>

                <td className="px-4 py-3">
                  <p>{attempt.eventCount} events</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {attempt.tabSwitchCount} tab switches
                  </p>
                </td>

                <td className="px-4 py-3">
                  {renderEventSummary(attempt.eventSummary)}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  <p>Started: {formatDateTime(attempt.startedAt)}</p>
                  <p className="mt-1">
                    Submitted: {formatDateTime(attempt.submittedAt)}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewEvents(attempt)}
                    >
                      <Eye className="size-4" />
                      View events
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
