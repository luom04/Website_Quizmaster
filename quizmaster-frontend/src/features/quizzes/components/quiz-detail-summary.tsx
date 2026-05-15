import {
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  Trophy,
  Unlock,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
      label: "Đang mở",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    UPCOMING: {
      label: "Sắp diễn ra",
      className:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-400",
    },
    ENDED: {
      label: "Đã kết thúc",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400",
    },
    DRAFT: {
      label: "Bản nháp",
      className: "border-border bg-muted text-muted-foreground",
    },
  };

  return status
    ? meta[status] || { label: status, className: "" }
    : { label: "Khả dụng", className: "" };
}

function getAccessMeta(accessMode: Quiz["accessMode"]) {
  return accessMode === "password_required"
    ? {
        label: "Cần mật khẩu",
        icon: LockKeyhole,
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400",
      }
    : {
        label: "Công khai",
        icon: Unlock,
        className:
          "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-400",
      };
}

export function QuizDetailSummary({ quiz }: QuizDetailSummaryProps) {
  const statusMeta = getStatusMeta(quiz.status);
  const accessMeta = getAccessMeta(quiz.accessMode);
  const AccessIcon = accessMeta.icon;

  const questionCount = quiz.questionCount ?? quiz._count?.quizQuestions ?? 0;

  const stats = [
    {
      label: "Thời lượng",
      value: `${quiz.durationMinutes} phút`,
      icon: Clock3,
    },
    {
      label: "Số câu hỏi",
      value: questionCount,
      icon: BookOpenCheck,
    },
    {
      label: "Số lượt làm",
      value: quiz.maxAttempts,
      icon: RotateCcw,
    },
    {
      label: "Điểm đạt",
      value: quiz.passingScore ? `${quiz.passingScore}%` : "—",
      icon: Trophy,
    },
  ];

  const infoItems = [
    {
      icon: ShieldCheck,
      label: "Danh mục",
      value: quiz.category?.name || "General",
    },
    {
      icon: UserRound,
      label: "Người tạo",
      value: quiz.creator?.name || "Admin",
    },
    {
      icon: CalendarClock,
      label: "Bắt đầu",
      value: formatDateTime(quiz.startsAt),
    },
    {
      icon: CalendarClock,
      label: "Kết thúc",
      value: formatDateTime(quiz.endsAt),
    },
  ];

  const configItems = [
    {
      label: "Hiển thị đáp án sau khi nộp",
      value: quiz.showAnswer ? "Bật" : "Tắt",
      icon: quiz.showAnswer ? Eye : EyeOff,
    },
    {
      label: "Xáo trộn câu hỏi",
      value: quiz.shuffleQuestions ? "Bật" : "Tắt",
      icon: Shuffle,
    },
    {
      label: "Xáo trộn đáp án",
      value: quiz.shuffleOptions ? "Bật" : "Tắt",
      icon: Shuffle,
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="qm-soft-card overflow-hidden">
        <div className="border-b bg-muted/25 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("rounded-full", statusMeta.className)}
            >
              <CheckCircle2 className="size-3.5" />
              {statusMeta.label}
            </Badge>

            <Badge
              variant="outline"
              className={cn("rounded-full", accessMeta.className)}
            >
              <AccessIcon className="size-3.5" />
              {accessMeta.label}
            </Badge>
          </div>

          <div className="mt-5 max-w-3xl">
            <p className="qm-section-eyebrow">
              <Info className="size-3.5" />
              Thông tin bài thi
            </p>

            <h1 className="qm-section-title mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {quiz.title}
            </h1>

            <p className="qm-section-description mt-3 max-w-2xl leading-7">
              {quiz.description ||
                "Quiz này chưa có mô tả chi tiết từ người tạo."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="qm-muted-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xl font-semibold tracking-tight">
                      {item.value}
                    </p>
                  </div>

                  <div className="flex size-10 items-center justify-center rounded-2xl bg-background shadow-sm">
                    <Icon className="size-5 text-primary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <aside className="space-y-5">
        <section className="qm-soft-card p-5">
          <h2 className="text-base font-semibold">Thông tin chi tiết</h2>

          <div className="mt-4 space-y-3">
            {infoItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-2xl border bg-muted/20 p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="qm-soft-card p-5">
          <h2 className="text-base font-semibold">Cấu hình bài thi</h2>

          <div className="mt-4 space-y-3">
            {configItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>

                    <p className="truncate text-sm font-medium">{item.label}</p>
                  </div>

                  <span className="qm-status-pill shrink-0">{item.value}</span>
                </div>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
