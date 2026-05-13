import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldAlert,
  Target,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AttemptResult } from "@/types/attempt";

type ResultSummaryCardProps = {
  result: AttemptResult;
};

function formatDuration(seconds?: number | null) {
  if (!seconds) return "—";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export function ResultSummaryCard({ result }: ResultSummaryCardProps) {
  const isPassed = result.isPassed === true;
  const showAnswer = result.quiz.showAnswer;

  const stats = [
    {
      label: "Score",
      value: `${result.score}/${result.maxScore}`,
      icon: Target,
    },
    {
      label: showAnswer ? "Correct" : "Answered",
      value: showAnswer
        ? `${result.correctCount}/${result.totalQuestions}`
        : `${result.totalQuestions}/${result.totalQuestions}`,
      icon: FileCheck2,
    },
    {
      label: "Time spent",
      value: formatDuration(result.timeSpentSeconds),
      icon: Clock3,
    },
    {
      label: "Tab switches",
      value: result.tabSwitchCount ?? 0,
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {showAnswer ? (
            <Badge variant={isPassed ? "secondary" : "outline"}>
              {isPassed ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <XCircle className="size-3.5" />
              )}
              {isPassed ? "Passed" : "Not passed"}
            </Badge>
          ) : (
            <Badge variant="outline">
              <FileCheck2 className="size-3.5" />
              Submitted
            </Badge>
          )}

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {showAnswer ? "Kết quả bài làm" : "Bài làm đã nộp"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {showAnswer
              ? "Bạn có thể xem điểm, đáp án đã chọn và đáp án đúng của từng câu hỏi."
              : "Quiz này không bật xem đáp án đúng. Bạn vẫn có thể xem lại các lựa chọn mình đã nộp."}
          </p>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {result.quiz.title}
          </p>
        </div>

        <div className="rounded-3xl border bg-muted/30 px-6 py-5 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            Final score
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            {result.score}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            out of {result.maxScore}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border bg-muted/30 p-4"
            >
              <Icon className="size-4 text-muted-foreground" />
              <p className="mt-3 text-lg font-semibold">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
