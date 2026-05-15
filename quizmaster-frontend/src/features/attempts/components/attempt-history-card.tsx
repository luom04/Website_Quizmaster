import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Play,
  ShieldAlert,
  TimerReset,
  Trophy,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ROUTES } from "@/config/routes";

import { cn } from "@/lib/utils";
import type { AttemptHistoryItem, AttemptStatus } from "@/types/attempt";

type AttemptHistoryCardProps = {
  attempt: AttemptHistoryItem;
};

function getTakingPath(attemptId: string) {
  return ROUTES.USER.TAKING_QUIZ.replace(":attemptId", attemptId);
}

function getResultPath(attemptId: string) {
  return ROUTES.USER.RESULT.replace(":attemptId", attemptId);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return minutes <= 0
    ? `${remainingSeconds}s`
    : `${minutes}m ${remainingSeconds}s`;
}

function getStatusMeta(status: AttemptStatus) {
  switch (status) {
    case "in_progress":
      return {
        label: "In progress",
        icon: Play,
        className:
          "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300",
      };

    case "submitted":
      return {
        label: "Submitted",
        icon: CheckCircle2,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
      };

    case "timed_out":
      return {
        label: "Timed out",
        icon: TimerReset,
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
      };

    default:
      return {
        label: status,
        icon: FileText,
        className: "border-border bg-muted text-muted-foreground",
      };
  }
}

export function AttemptHistoryCard({ attempt }: AttemptHistoryCardProps) {
  const statusMeta = getStatusMeta(attempt.status);
  const StatusIcon = statusMeta.icon;

  const canContinue = attempt.status === "in_progress";
  const canViewResult =
    attempt.status === "submitted" || attempt.status === "timed_out";

  const stats = [
    {
      icon: Trophy,
      label: "Score",
      value:
        attempt.score === null ? "—" : `${attempt.score}/${attempt.maxScore}`,
      className: "text-amber-500",
    },
    {
      icon: CheckCircle2,
      label: "Correct",
      value:
        attempt.status === "in_progress"
          ? `0/${attempt.totalQuestions}`
          : `${attempt.correctCount}/${attempt.totalQuestions}`,
      className: "text-emerald-500",
    },
    {
      icon: Clock3,
      label: "Time spent",
      value: formatDuration(attempt.timeSpentSeconds),
      className: "text-sky-500",
    },
    {
      icon: ShieldAlert,
      label: "Tab switches",
      value: attempt.tabSwitchCount ?? 0,
      className: "text-rose-500",
    },
  ];

  return (
    <article className="qm-soft-card qm-soft-card-hover group overflow-hidden">
      <div className="border-b bg-muted/25 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("rounded-full px-3 py-1", statusMeta.className)}
              >
                <StatusIcon className="size-3.5" />
                {statusMeta.label}
              </Badge>

              <Badge
                variant="secondary"
                className="rounded-full bg-background/80 px-3 py-1"
              >
                Attempt #{attempt.attemptNumber}
              </Badge>

              {attempt.isPassed !== null ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-3 py-1",
                    attempt.isPassed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
                  )}
                >
                  {attempt.isPassed ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <XCircle className="size-3.5" />
                  )}
                  {attempt.isPassed ? "Passed" : "Failed"}
                </Badge>
              ) : null}
            </div>

            <h3 className="qm-text-balance mt-4 line-clamp-2 text-xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary">
              {attempt.quiz.title}
            </h3>

            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 shrink-0" />
              <span>Bắt đầu lúc {formatDateTime(attempt.startedAt)}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {canContinue ? (
              <Button
                asChild
                className="rounded-2xl font-semibold shadow-sm transition-all hover:-translate-y-0.5"
              >
                <Link to={getTakingPath(attempt.id)}>
                  Tiếp tục
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : null}

            {canViewResult ? (
              <Button
                asChild
                variant="outline"
                className="rounded-2xl bg-background/75 font-semibold"
              >
                <Link to={getResultPath(attempt.id)}>
                  <Eye className="size-4" />
                  Xem bài làm
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const StatIcon = stat.icon;

            return (
              <div key={stat.label} className="qm-muted-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-background shadow-sm">
                    <StatIcon className={cn("size-5", stat.className)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            <span>Thời gian: {attempt.quiz.durationMinutes} phút</span>
          </div>

          <span className="hidden text-border sm:inline">•</span>

          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            <span>Đáp án: {attempt.quiz.showAnswer ? "Hiển thị" : "Ẩn"}</span>
          </div>

          {attempt.submittedAt ? (
            <>
              <span className="hidden text-border sm:inline">•</span>
              <span>Đã nộp: {formatDateTime(attempt.submittedAt)}</span>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
