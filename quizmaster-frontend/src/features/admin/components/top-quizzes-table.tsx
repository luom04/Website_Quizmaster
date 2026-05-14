import { Badge } from "@/components/ui/badge";
import type { AdminTopQuizItem } from "@/types/admin";

type TopQuizzesTableProps = {
  items: AdminTopQuizItem[];
};

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}%`;
}

function formatScore(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(1);
}

export function TopQuizzesTable({ items }: TopQuizzesTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Chưa có dữ liệu top quizzes.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Quiz</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Attempts</th>
              <th className="px-4 py-3 font-medium">Completed</th>
              <th className="px-4 py-3 font-medium">Avg score</th>
              <th className="px-4 py-3 font-medium">Pass rate</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.map((quiz) => (
              <tr key={quiz.quizId} className="bg-card">
                <td className="px-4 py-3">
                  <p className="font-medium">{quiz.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {quiz.questionCount} questions
                  </p>
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {quiz.category?.name || "General"}
                </td>

                <td className="px-4 py-3">{quiz.attemptCount}</td>

                <td className="px-4 py-3">{quiz.completedAttemptCount}</td>

                <td className="px-4 py-3">{formatScore(quiz.averageScore)}</td>

                <td className="px-4 py-3">{formatPercent(quiz.passRate)}</td>

                <td className="px-4 py-3">
                  <Badge variant={quiz.isPublished ? "secondary" : "outline"}>
                    {quiz.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
