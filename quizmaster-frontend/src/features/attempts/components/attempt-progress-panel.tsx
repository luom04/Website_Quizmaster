import { Clock3, Send } from "lucide-react";

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

  return (
    <aside className="rounded-3xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Tiến độ làm bài</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {answeredQuestions}/{totalQuestions} câu đã trả lời
          </p>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold",
            isAlmostExpired && "border-destructive/40 text-destructive",
          )}
        >
          <Clock3 className="size-4" />
          {remainingSeconds === null
            ? "--:--"
            : formatRemainingTime(remainingSeconds)}
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Hoàn thành {progress}% bài quiz.
        </p>
      </div>

      <Button
        className="mt-5 w-full cursor-pointer"
        disabled={isSubmitting}
        onClick={onSubmit}
      >
        <Send className="size-4" />
        {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
      </Button>
    </aside>
  );
}
