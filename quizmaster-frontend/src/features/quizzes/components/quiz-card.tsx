import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Clock3,
  LockKeyhole,
  RotateCcw,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import type { Quiz } from "@/types/quiz";

type QuizCardProps = {
  quiz: Quiz;
};

function getQuizDetailPath(quizId: string) {
  return ROUTES.USER.QUIZ_DETAIL.replace(":quizId", quizId);
}

// Cập nhật hàm này để trả về màu sắc cho Access Mode
function getAccessModeMeta(accessMode: Quiz["accessMode"]) {
  return accessMode === "password_required"
    ? {
        label: "Password",
        className:
          "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        icon: LockKeyhole,
      }
    : {
        label: "Public",
        className:
          "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
        icon: Unlock,
      };
}

function getStatusMeta(status?: Quiz["status"]) {
  switch (status) {
    case "ONGOING":
      return {
        label: "Ongoing",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    case "UPCOMING":
      return {
        label: "Upcoming",
        className:
          "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
      };
    case "ENDED":
      return {
        label: "Ended",
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
      };
    case "DRAFT":
      return {
        label: "Draft",
        className: "border-muted bg-muted text-muted-foreground",
      };
    case "DELETED":
      return {
        label: "Deleted",
        className: "border-destructive/30 bg-destructive/10 text-destructive",
      };
    default:
      return {
        label: "Available",
        className: "border-primary/20 bg-primary/10 text-primary",
      };
  }
}

export function QuizCard({ quiz }: QuizCardProps) {
  const statusMeta = getStatusMeta(quiz.status);
  const accessMeta = getAccessModeMeta(quiz.accessMode);
  const AccessIcon = accessMeta.icon;

  // Lấy số lượng câu hỏi từ API hoặc fallback từ relation count
  const questionCount = quiz.questionCount ?? quiz._count?.quizQuestions ?? 0;

  return (
    <article className="group flex h-full flex-col rounded-3xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            <BookOpenCheck className="size-3.5 text-primary/70" />
            <span className="truncate">{quiz.category?.name || "General"}</span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
            {quiz.title}
          </h3>
        </div>

        {/* Cập nhật Badge Public/Password với màu nền mới */}
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 gap-1 rounded-full px-2.5 py-0.5 font-semibold shadow-sm",
            accessMeta.className,
          )}
        >
          <AccessIcon className="size-3.5" />
          {accessMeta.label}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground/90">
        {quiz.description || "Quiz này chưa có mô tả chi tiết."}
      </p>

      {/* Stats Grid */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border/50 bg-muted/30 p-3 text-center transition-colors group-hover:bg-muted/50">
          <Clock3 className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-2 text-sm font-bold">{quiz.durationMinutes}m</p>
          <p className="text-[10px] uppercase font-medium text-muted-foreground">
            Duration
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-muted/30 p-3 text-center transition-colors group-hover:bg-muted/50">
          <BookOpenCheck className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-2 text-sm font-bold">{questionCount}</p>
          <p className="text-[10px] uppercase font-medium text-muted-foreground">
            Questions
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-muted/30 p-3 text-center transition-colors group-hover:bg-muted/50">
          <RotateCcw className="mx-auto size-4 text-muted-foreground" />
          <p className="mt-2 text-sm font-bold">{quiz.maxAttempts}</p>
          <p className="text-[10px] uppercase font-medium text-muted-foreground">
            Attempts
          </p>
        </div>
      </div>

      <div className="mt-auto pt-5 flex items-center justify-between gap-3">
        <Badge
          variant="outline"
          className={cn(
            "rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase tracking-tight shadow-sm",
            statusMeta.className,
          )}
        >
          {statusMeta.label}
        </Badge>

        <Button
          asChild
          size="sm"
          className="h-9 gap-1.5 rounded-xl px-4 font-semibold shadow-md shadow-primary/10 transition-all hover:gap-2.5"
        >
          <Link to={getQuizDetailPath(quiz.id)}>
            View quiz
            <ArrowRight className="size-4 transition-transform" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
