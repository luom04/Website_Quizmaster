import {
  Award,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldAlert,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

function getStatusMeta(result: AttemptResult) {
  const showAnswer = result.quiz.showAnswer;

  if (!showAnswer || result.isPassed === null) {
    return {
      label: "Submitted",
      icon: FileCheck2,
      className:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300",
    };
  }

  if (result.isPassed) {
    return {
      label: "Passed",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
    };
  }

  return {
    label: "Not passed",
    icon: XCircle,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
  };
}

export function ResultSummaryCard({ result }: ResultSummaryCardProps) {
  const showAnswer = result.quiz.showAnswer;
  const isPassed = result.isPassed === true;
  const statusMeta = getStatusMeta(result);
  const StatusIcon = statusMeta.icon;

  const scorePercent =
    result.maxScore > 0
      ? Math.round((result.score / result.maxScore) * 100)
      : 0;

  const stats = [
    {
      label: "Điểm số",
      value: `${result.score}/${result.maxScore}`,
      helper: `${scorePercent}% tổng điểm`,
      icon: Target,
    },
    {
      label: showAnswer ? "Số câu đúng" : "Số câu hỏi",
      value: showAnswer
        ? `${result.correctCount}/${result.totalQuestions}`
        : result.totalQuestions,
      helper: showAnswer
        ? "Dựa trên đáp án đúng"
        : "Quiz không mở xem đáp án đúng",
      icon: FileCheck2,
    },
    {
      label: "Thời gian làm",
      value: formatDuration(result.timeSpentSeconds),
      helper: "Tính từ lúc bắt đầu đến khi nộp",
      icon: Clock3,
    },
    {
      label: "Chuyển tab",
      value: result.tabSwitchCount ?? 0,
      helper: "Số lần rời khỏi màn hình quiz",
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="qm-soft-card overflow-hidden">
      <div className="border-b bg-muted/25 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Badge
              variant="outline"
              className={cn("rounded-full px-3 py-1", statusMeta.className)}
            >
              <StatusIcon className="size-3.5" />
              {statusMeta.label}
            </Badge>

            <h1 className="qm-section-title mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              {showAnswer ? "Kết quả bài làm" : "Bài làm đã nộp"}
            </h1>

            <p className="qm-section-description mt-3 max-w-2xl leading-7">
              {showAnswer
                ? "Bạn có thể xem điểm, đáp án đã chọn và đáp án đúng của từng câu hỏi."
                : "Quiz này không bật xem đáp án đúng. Bạn vẫn có thể xem lại các lựa chọn mình đã nộp."}
            </p>

            <p className="mt-4 text-sm font-medium text-foreground">
              {result.quiz.title}
            </p>
          </div>

          <div
            className={cn(
              "w-full rounded-3xl border p-5 text-center shadow-sm lg:w-64",
              showAnswer && isPassed
                ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/25"
                : showAnswer && !isPassed
                  ? "border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/25"
                  : "border-sky-200 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/25",
            )}
          >
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm">
              {showAnswer ? (
                <Trophy
                  className={cn(
                    "size-6",
                    isPassed ? "text-emerald-600" : "text-red-600",
                  )}
                />
              ) : (
                <Award className="size-6 text-sky-600" />
              )}
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Final score
            </p>

            <div className="mt-2 flex items-end justify-center gap-1">
              <span className="text-5xl font-bold tracking-tight">
                {result.score}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                / {result.maxScore}
              </span>
            </div>

            {showAnswer && result.quiz.passingScore !== null ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Điểm đạt yêu cầu: {result.quiz.passingScore}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Tổng quan điểm số</span>
            <span className="font-semibold">{scorePercent}%</span>
          </div>

          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                showAnswer && isPassed
                  ? "bg-emerald-500"
                  : showAnswer && !isPassed
                    ? "bg-red-500"
                    : "bg-primary",
              )}
              style={{ width: `${Math.min(scorePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="qm-muted-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.helper}
                    </p>
                  </div>

                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-background shadow-sm">
                    <Icon className="size-5 text-primary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
