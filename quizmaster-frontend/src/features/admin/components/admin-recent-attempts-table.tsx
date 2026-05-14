import { Badge } from "@/components/ui/badge"
import type { AdminRecentAttemptItem } from "@/types/admin"
import type { AttemptStatus } from "@/types/attempt"

type AdminRecentAttemptsTableProps = {
  attempts: AdminRecentAttemptItem[]
}

function formatDateTime(value?: string | null) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDuration(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return "—"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}m ${remainingSeconds}s`
}

function getStatusLabel(status: AttemptStatus) {
  const labels: Record<string, string> = {
    in_progress: "In progress",
    submitted: "Submitted",
    timed_out: "Timed out",
  }

  return labels[status] || status
}

function getStatusClassName(status: AttemptStatus) {
  switch (status) {
    case "submitted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "timed_out":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
    case "in_progress":
    default:
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300"
  }
}

export function AdminRecentAttemptsTable({
  attempts,
}: AdminRecentAttemptsTableProps) {
  if (attempts.length === 0) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
        Không có attempt nào khớp với bộ lọc hiện tại.
      </div>
    )
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
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Monitoring</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {attempts.map((attempt) => (
              <tr key={attempt.attemptId} className="bg-card">
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    Attempt #{attempt.attemptNumber}
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
                      : `${attempt.score}/${attempt.maxScore}`}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <p>
                    {attempt.correctCount}/{attempt.totalQuestions} correct
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Total questions
                  </p>
                </td>

                <td className="px-4 py-3">
                  <p>{attempt.eventCount} events</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {attempt.tabSwitchCount} tab switches
                  </p>
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  <p>Started: {formatDateTime(attempt.startedAt)}</p>
                  <p className="mt-1">
                    Deadline: {formatDateTime(attempt.deadlineAt)}
                  </p>
                  <p className="mt-1">
                    Spent: {formatDuration(attempt.timeSpentSeconds)}
                  </p>
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(attempt.submittedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}