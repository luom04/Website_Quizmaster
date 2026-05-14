import { Badge } from "@/components/ui/badge";
import type { AdminRecentAttemptItem } from "@/types/admin";
import type { AttemptStatus } from "@/types/attempt";

type RecentAttemptsTableProps = {
  items: AdminRecentAttemptItem[];
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
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

function getStatusVariant(status: AttemptStatus) {
  if (status === "submitted") return "secondary";
  return "outline";
}

export function RecentAttemptsTable({ items }: RecentAttemptsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Chưa có attempt gần đây.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Quiz</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Correct</th>
              <th className="px-4 py-3 font-medium">Events</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.map((attempt) => (
              <tr key={attempt.attemptId} className="bg-card">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {attempt.user.name || "Unnamed user"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {attempt.user.email}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <p className="font-medium">{attempt.quiz.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Attempt #{attempt.attemptNumber}
                  </p>
                </td>

                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(attempt.status)}>
                    {getStatusLabel(attempt.status)}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  {attempt.score === null
                    ? "—"
                    : `${attempt.score}/${attempt.maxScore}`}
                </td>

                <td className="px-4 py-3">
                  {attempt.correctCount}/{attempt.totalQuestions}
                </td>

                <td className="px-4 py-3">
                  <span className="text-muted-foreground">
                    {attempt.eventCount} events · {attempt.tabSwitchCount} tabs
                  </span>
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
  );
}
