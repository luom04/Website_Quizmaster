import {
  BookOpenCheck,
  CalendarClock,
  Clock3,
  Eye,
  EyeOff,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  Unlock,
  UserRound,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Quiz } from "@/types/quiz";

type QuizDetailSummaryProps = {
  quiz: Quiz;
};

function formatDateTime(value?: string | null) {
  if (!value) return "Không giới hạn";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusMeta(status?: Quiz["status"]) {
  const meta: Record<string, { label: string; className: string }> = {
    ONGOING: {
      label: "Ongoing",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    UPCOMING: {
      label: "Upcoming",
      className:
        "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-400",
    },
    ENDED: {
      label: "Ended",
      className:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400",
    },
    DRAFT: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-border",
    },
  };
  return status
    ? meta[status] || { label: status, className: "" }
    : { label: "Available", className: "" };
}

function getAccessMeta(accessMode: Quiz["accessMode"]) {
  return accessMode === "password_required"
    ? {
        label: "Password required",
        icon: LockKeyhole,
        className:
          "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30",
      }
    : {
        label: "Public",
        icon: Unlock,
        className:
          "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30",
      };
}

export function QuizDetailSummary({ quiz }: QuizDetailSummaryProps) {
  const statusMeta = getStatusMeta(quiz.status);
  const accessMeta = getAccessMeta(quiz.accessMode);
  const AccessIcon = accessMeta.icon;
  const questionCount = quiz.questionCount ?? quiz._count?.quizQuestions ?? 0;

  const stats = [
    {
      label: "Duration",
      value: `${quiz.durationMinutes}m`,
      icon: Clock3,
      color: "text-sky-500",
    },
    {
      label: "Questions",
      value: questionCount,
      icon: BookOpenCheck,
      color: "text-primary",
    },
    {
      label: "Max attempts",
      value: quiz.maxAttempts,
      icon: RotateCcw,
      color: "text-orange-500",
    },
    {
      label: "Passing score",
      value: quiz.passingScore ? `${quiz.passingScore}%` : "—",
      icon: Trophy,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Header Card */}
      <section className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-3 py-1 font-bold uppercase text-[10px] tracking-wider shadow-sm",
              statusMeta.className,
            )}
          >
            {statusMeta.label}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 rounded-full px-3 py-1 font-bold uppercase text-[10px] tracking-wider shadow-sm",
              accessMeta.className,
            )}
          >
            <AccessIcon className="size-3" />
            {accessMeta.label}
          </Badge>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          {quiz.title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground/90">
          {quiz.description || "Quiz này chưa có mô tả chi tiết từ người tạo."}
        </p>

        {/* Stats Grid - High Contrast Style */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="group flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-muted/20 py-6 transition-all hover:bg-muted/40 hover:shadow-inner"
            >
              <item.icon
                className={cn(
                  "size-5 mb-3 transition-transform group-hover:scale-110",
                  item.color,
                )}
              />
              <p className="text-2xl font-black tracking-tight">{item.value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Info & Config Sections */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Thông tin chi tiết
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                label: "Category",
                value: quiz.category?.name || "General",
              },
              {
                icon: UserRound,
                label: "Created by",
                value: quiz.creator?.name || "Admin",
              },
              {
                icon: CalendarClock,
                label: "Starts at",
                value: formatDateTime(quiz.startsAt),
              },
              {
                icon: CalendarClock,
                label: "Ends at",
                value: formatDateTime(quiz.endsAt),
              },
            ].map((info, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/10 p-4 transition-colors hover:bg-muted/20"
              >
                <div className="rounded-lg bg-background p-2 shadow-sm">
                  <info.icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {info.label}
                  </p>
                  <p className="text-sm font-semibold mt-0.5">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-600 dark:bg-sky-900/30">
              <Shuffle className="size-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Cấu hình bài thi
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {[
              {
                label: "Show answers",
                value: quiz.showAnswer ? "Bật" : "Tắt",
                icon: quiz.showAnswer ? Eye : EyeOff,
              },
              {
                label: "Shuffle questions",
                value: quiz.shuffleQuestions ? "Bật" : "Tắt",
                icon: Shuffle,
              },
              {
                label: "Shuffle options",
                value: quiz.shuffleOptions ? "Bật" : "Tắt",
                icon: Shuffle,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/10 p-4 transition-all hover:translate-x-1"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                <Badge
                  variant={item.value === "Bật" ? "secondary" : "outline"}
                  className="rounded-lg font-bold"
                >
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
