import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatRemainingTime } from "@/features/attempts/attempt.utils";
import { cn } from "@/lib/utils";

type AttemptProgressPanelProps = {
  totalQuestions: number;
  answeredQuestions: number;
  remainingSeconds: number | null;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function AttemptProgressPanel({
  totalQuestions,
  answeredQuestions,
  remainingSeconds,
  isSubmitting,
  onSubmit,
}: AttemptProgressPanelProps) {
  const progress =
    totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0;

  const isAlmostExpired = remainingSeconds !== null && remainingSeconds <= 60;
  const isFinished = totalQuestions > 0 && answeredQuestions === totalQuestions;

  return (
    <aside className="qm-soft-card overflow-hidden">
      <div className="border-b bg-muted/25 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Tiến độ làm bài</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Theo dõi thời gian và số câu đã hoàn thành.
            </p>
          </div>

          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-2xl",
              isAlmostExpired
                ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                : "bg-primary/10 text-primary",
            )}
          >
            {isAlmostExpired ? (
              <AlertTriangle className="size-5" />
            ) : (
              <Clock3 className="size-5" />
            )}
          </div>
        </div>

        <div
          className={cn(
            "mt-5 rounded-3xl border p-4 text-center",
            isAlmostExpired
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/25 dark:text-red-300"
              : "border-border bg-background",
          )}
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Thời gian còn lại
          </p>

          <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
            {remainingSeconds === null
              ? "--:--"
              : formatRemainingTime(remainingSeconds)}
          </p>

          {isAlmostExpired ? (
            <p className="mt-2 text-xs font-medium">
              Sắp hết giờ, hãy kiểm tra lại bài làm.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Câu đã trả lời</span>
            <span className="font-semibold">
              {answeredQuestions}/{totalQuestions}
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isFinished ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Hoàn thành {progress}% bài quiz.
            </p>

            {isFinished ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="size-3.5" />
                Đủ câu
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/25 p-4 text-xs leading-5 text-muted-foreground">
          Bạn có thể kiểm tra lại đáp án trước khi nộp. Sau khi nộp bài, hệ
          thống sẽ chuyển sang trang kết quả hoặc trang xem lại bài làm.
        </div>

        <Button
          type="button"
          size="lg"
          className="h-11 w-full cursor-pointer rounded-2xl font-semibold shadow-sm transition-all hover:-translate-y-0.5"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang nộp bài...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Nộp bài
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
