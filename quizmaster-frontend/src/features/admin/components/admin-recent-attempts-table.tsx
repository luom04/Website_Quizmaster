import {
  Activity,
  Clock3,
  FileQuestion,
  MousePointerClick,
  Timer,
  Trophy,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AdminRecentAttemptItem } from "@/types/admin";
import type { AttemptStatus } from "@/types/attempt";

type AdminRecentAttemptsTableProps = {
  attempts: AdminRecentAttemptItem[];
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return "—";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function getStatusLabel(status: AttemptStatus) {
  const labels: Record<AttemptStatus, string> = {
    in_progress: "In progress",
    submitted: "Submitted",
    timed_out: "Timed out",
  };

  return labels[status] || status;
}

function getStatusClassName(status: AttemptStatus) {
  switch (status) {
    case "submitted":
      return "border-emerald-200 bg-emerald-500/10 text-emerald-700";
    case "timed_out":
      return "border-amber-200 bg-amber-500/10 text-amber-700";
    case "in_progress":
    default:
      return "border-sky-200 bg-sky-500/10 text-sky-700";
  }
}

export function AdminRecentAttemptsTable({
  attempts,
}: AdminRecentAttemptsTableProps) {
  if (attempts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed bg-background p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
          <Activity className="size-6" />
        </div>

        <h3 className="mt-4 text-sm font-semibold">Không có attempt nào</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Không có lượt làm bài nào khớp với bộ lọc hiện tại.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Quiz</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Monitoring</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>

          <tbody>
            {attempts.map((attempt) => (
              <tr
                key={attempt.attemptId}
                className="border-t transition hover:bg-muted/40"
              >
                <td className="max-w-[260px] px-4 py-4 align-top">
                  <div className="flex items-center gap-3">
                    {attempt.user.avatarUrl ? (
                      <img
                        src={attempt.user.avatarUrl}
                        alt={attempt.user.name || attempt.user.email}
                        className="size-11 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-700">
                        <UserRound className="size-5" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {attempt.user.name || "Unnamed user"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {attempt.user.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="max-w-[280px] px-4 py-4 align-top">
                  <div className="line-clamp-2 font-medium">
                    {attempt.quiz.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Attempt #{attempt.attemptNumber}
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="space-y-2">
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-1 ${getStatusClassName(
                        attempt.status,
                      )}`}
                    >
                      {getStatusLabel(attempt.status)}
                    </Badge>

                    {attempt.isPassed !== null ? (
                      <Badge
                        variant="outline"
                        className={
                          attempt.isPassed
                            ? "rounded-full border-emerald-200 bg-emerald-500/10 px-2.5 py-1 text-emerald-700"
                            : "rounded-full border-rose-200 bg-rose-500/10 px-2.5 py-1 text-rose-700"
                        }
                      >
                        {attempt.isPassed ? "Passed" : "Failed"}
                      </Badge>
                    ) : null}
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700">
                    <Trophy className="size-3.5" />
                    {attempt.score === null
                      ? "—"
                      : `${attempt.score}/${attempt.maxScore}`}
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <FileQuestion className="size-3.5" />
                      {attempt.correctCount}/{attempt.totalQuestions} correct
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Total questions: {attempt.totalQuestions}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <Activity className="size-3.5" />
                      {attempt.eventCount} events
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">
                      <MousePointerClick className="size-3.5" />
                      {attempt.tabSwitchCount} tab switches
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-3.5" />
                      Started: {formatDateTime(attempt.startedAt)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Timer className="size-3.5" />
                      Spent: {formatDuration(attempt.timeSpentSeconds)}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 align-top text-muted-foreground">
                  {formatDateTime(attempt.submittedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
