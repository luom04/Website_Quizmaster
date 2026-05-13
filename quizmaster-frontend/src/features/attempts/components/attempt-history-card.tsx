import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Play,
  ShieldAlert,
  TimerReset,
  XCircle,
  Calendar,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
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
          "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900",
      };
    case "submitted":
      return {
        label: "Submitted",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
      };
    case "timed_out":
      return {
        label: "Timed out",
        icon: TimerReset,
        className:
          "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
      };
    default:
      return {
        label: status,
        icon: FileText,
        className: "bg-muted text-muted-foreground",
      };
  }
}

export function AttemptHistoryCard({ attempt }: AttemptHistoryCardProps) {
  const statusMeta = getStatusMeta(attempt.status);
  const StatusIcon = statusMeta.icon;
  const canContinue = attempt.status === "in_progress";
  const canViewResult =
    attempt.status === "submitted" || attempt.status === "timed_out";

  return (
    <article className="group flex flex-col rounded-[2rem] border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {/* Badge Group */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "gap-1 rounded-full px-2.5 py-0.5 font-bold uppercase text-[10px] tracking-wider shadow-sm",
                statusMeta.className,
              )}
            >
              <StatusIcon className="size-3" />
              {statusMeta.label}
            </Badge>

            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            >
              Attempt #{attempt.attemptNumber}
            </Badge>

            {attempt.isPassed !== null && (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 rounded-full px-2.5 py-0.5 font-bold uppercase text-[10px] tracking-wider",
                  attempt.isPassed
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-red-50 text-red-700 border-red-100",
                )}
              >
                {attempt.isPassed ? (
                  <CheckCircle2 className="size-3" />
                ) : (
                  <XCircle className="size-3" />
                )}
                {attempt.isPassed ? "Passed" : "Failed"}
              </Badge>
            )}
          </div>

          <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
            {attempt.quiz.title}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>Bắt đầu lúc {formatDateTime(attempt.startedAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 gap-2">
          {canContinue && (
            <Button
              asChild
              className="rounded-xl font-bold shadow-md shadow-primary/20 transition-all hover:gap-3"
            >
              <Link to={getTakingPath(attempt.id)}>
                Tiếp tục
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}

          {canViewResult && (
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-border/60 font-bold hover:bg-primary/5 hover:text-primary"
            >
              <Link to={getResultPath(attempt.id)} className="gap-2">
                <Eye className="size-4" />
                Xem bài làm
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Trophy,
            label: "Score",
            value:
              attempt.score === null
                ? "—"
                : `${attempt.score}/${attempt.maxScore}`,
            color: "text-amber-500",
          },
          {
            icon: CheckCircle2,
            label: "Correct",
            value:
              attempt.status === "in_progress"
                ? `0/${attempt.totalQuestions}`
                : `${attempt.correctCount}/${attempt.totalQuestions}`,
            color: "text-emerald-500",
          },
          {
            icon: Clock3,
            label: "Time spent",
            value: formatDuration(attempt.timeSpentSeconds),
            color: "text-sky-500",
          },
          {
            icon: ShieldAlert,
            label: "Tab switches",
            value: attempt.tabSwitchCount ?? 0,
            color: "text-rose-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-muted/20 py-4 transition-colors group-hover:bg-muted/40"
          >
            <stat.icon className={cn("size-4 mb-2", stat.color)} />
            <span className="text-lg font-bold leading-none">{stat.value}</span>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Card Footer Info */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/50 pt-5 text-[11px] font-medium text-muted-foreground/70">
        <div className="flex items-center gap-1.5">
          <Clock3 className="size-3" />
          <span>Thời gian: {attempt.quiz.durationMinutes} phút</span>
        </div>
        <span className="hidden sm:inline text-border">•</span>
        <div className="flex items-center gap-1.5">
          <FileText className="size-3" />
          <span>Đáp án: {attempt.quiz.showAnswer ? "Hiển thị" : "Ẩn"}</span>
        </div>
        {attempt.submittedAt && (
          <>
            <span className="hidden sm:inline text-border">•</span>
            <span>Đã nộp: {formatDateTime(attempt.submittedAt)}</span>
          </>
        )}
      </div>
    </article>
  );
}
