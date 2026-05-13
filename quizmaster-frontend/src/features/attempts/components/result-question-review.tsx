import { Check, CheckCircle2, Circle, XCircle } from "lucide-react";

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
  const isCorrect = showAnswer && question.isCorrect === true;
  const isWrong = showAnswer && question.isCorrect === false;

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Question {questionNumber}</Badge>

            <Badge variant="outline">
              {question.type === "multiple"
                ? "Multiple choice"
                : "Single choice"}
            </Badge>

            {isCorrect ? (
              <Badge variant="secondary">
                <CheckCircle2 className="size-3.5" />
                Correct
              </Badge>
            ) : null}

            {isWrong ? (
              <Badge variant="outline">
                <XCircle className="size-3.5" />
                Incorrect
              </Badge>
            ) : null}
          </div>

          <h2 className="mt-4 text-lg font-semibold leading-7 tracking-tight">
            {question.content}
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {question.options.map((option) => {
          const isSelected = option.selected;
          const isCorrectOption = showAnswer && option.isCorrect === true;
          const isSelectedWrong = showAnswer && isSelected && !isCorrectOption;

          return (
            <div
              key={option.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl border bg-muted/20 p-4 text-sm",
                !showAnswer && isSelected && "border-primary/40 bg-primary/10",
                isCorrectOption && "border-primary/40 bg-primary/10",
                isSelectedWrong && "border-destructive/40 bg-destructive/10",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                  isSelected &&
                    "border-primary bg-primary text-primary-foreground",
                  isSelectedWrong &&
                    "border-destructive bg-destructive text-destructive-foreground",
                )}
              >
                {isSelected ? (
                  <Check className="size-3.5" />
                ) : (
                  <Circle className="size-3" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="leading-6">{option.content}</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {isSelected ? (
                    <Badge variant="outline">Your answer</Badge>
                  ) : null}

                  {showAnswer && isCorrectOption ? (
                    <Badge variant="secondary">Correct answer</Badge>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
