import {
  Check,
  CheckCircle2,
  CheckSquare2,
  Circle,
  CircleDot,
  EyeOff,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttemptResultQuestion } from "@/types/attempt";

type ResultQuestionReviewProps = {
  question: AttemptResultQuestion;
  questionNumber: number;
  showAnswer: boolean;
};

export function ResultQuestionReview({
  question,
  questionNumber,
  showAnswer,
}: ResultQuestionReviewProps) {
  const isMultiple = question.type === "multiple";
  const isCorrect = showAnswer && question.isCorrect === true;
  const isWrong = showAnswer && question.isCorrect === false;

  return (
    <article
      className={cn(
        "qm-soft-card overflow-hidden",
        isCorrect && "border-emerald-200 dark:border-emerald-900/50",
        isWrong && "border-red-200 dark:border-red-900/50",
      )}
    >
      <div className="border-b bg-muted/25 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10"
              >
                Question {questionNumber}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-3 py-1",
                  isMultiple
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300",
                )}
              >
                {isMultiple ? (
                  <CheckSquare2 className="size-3.5" />
                ) : (
                  <CircleDot className="size-3.5" />
                )}
                {isMultiple ? "Multiple choice" : "Single choice"}
              </Badge>
            </div>

            <h2 className="qm-text-pretty mt-4 text-lg font-semibold leading-7 tracking-tight sm:text-xl">
              {question.content}
            </h2>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {isCorrect ? (
              <Badge
                variant="outline"
                className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <CheckCircle2 className="size-3.5" />
                Correct
              </Badge>
            ) : null}

            {isWrong ? (
              <Badge
                variant="outline"
                className="rounded-full border-red-200 bg-red-50 px-3 py-1 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
              >
                <XCircle className="size-3.5" />
                Incorrect
              </Badge>
            ) : null}

            {!showAnswer ? (
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300"
              >
                <EyeOff className="size-3.5" />
                Answer hidden
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        {question.options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isSelected = option.selected;
          const isCorrectOption = showAnswer && option.isCorrect === true;
          const isSelectedWrong = showAnswer && isSelected && !isCorrectOption;
          const isSelectedCorrect = showAnswer && isSelected && isCorrectOption;
          const isSelectedOnly = !showAnswer && isSelected;

          return (
            <div
              key={option.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl border bg-background p-4 transition-colors",
                isSelectedOnly && "border-primary bg-primary/10",
                isSelectedCorrect &&
                  "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/25",
                isSelectedWrong &&
                  "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/25",
                !isSelected &&
                  isCorrectOption &&
                  "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-2xl border bg-card text-xs font-semibold text-muted-foreground",
                  isSelectedOnly &&
                    "border-primary bg-primary text-primary-foreground",
                  isSelectedCorrect &&
                    "border-emerald-500 bg-emerald-500 text-white",
                  isSelectedWrong && "border-red-500 bg-red-500 text-white",
                  !isSelected &&
                    isCorrectOption &&
                    "border-emerald-500 bg-emerald-500 text-white",
                )}
              >
                {optionLabel}
              </span>

              <div className="min-w-0 flex-1">
                <p className="qm-text-pretty text-sm font-medium leading-6 sm:text-base">
                  {option.content}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {isSelected ? (
                    <span className="qm-status-pill">
                      <Check className="size-3.5" />
                      Đáp án của bạn
                    </span>
                  ) : null}

                  {showAnswer && isCorrectOption ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <CheckCircle2 className="size-3.5" />
                      Đáp án đúng
                    </span>
                  ) : null}

                  {isSelectedWrong ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                      <XCircle className="size-3.5" />
                      Đáp án sai
                    </span>
                  ) : null}
                </div>
              </div>

              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-muted-foreground",
                  isSelectedOnly &&
                    "border-primary bg-primary text-primary-foreground",
                  isSelectedCorrect &&
                    "border-emerald-500 bg-emerald-500 text-white",
                  isSelectedWrong && "border-red-500 bg-red-500 text-white",
                  !isSelected &&
                    isCorrectOption &&
                    "border-emerald-500 bg-emerald-500 text-white",
                )}
              >
                {isSelected || isCorrectOption ? (
                  <Check className="size-3.5" />
                ) : (
                  <Circle className="size-3" />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
