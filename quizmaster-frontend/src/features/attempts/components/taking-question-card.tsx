import {
  Check,
  CheckSquare2,
  Circle,
  CircleDot,
  ListChecks,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AttemptQuestion } from "@/types/attempt";

type TakingQuestionCardProps = {
  question: AttemptQuestion;
  questionNumber: number;
  selectedOptionIds: string[];
  onChange: (attemptQuestionId: string, selectedOptionIds: string[]) => void;
};

export function TakingQuestionCard({
  question,
  questionNumber,
  selectedOptionIds,
  onChange,
}: TakingQuestionCardProps) {
  const isMultiple = question.type === "multiple";

  function handleSelect(optionId: string) {
    if (isMultiple) {
      const nextSelectedIds = selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId];

      onChange(question.id, nextSelectedIds);
      return;
    }

    onChange(question.id, [optionId]);
  }

  return (
    <article className="qm-soft-card overflow-hidden">
      <div className="border-b bg-muted/25 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Badge
              variant="secondary"
              className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10"
            >
              Question {questionNumber}
            </Badge>

            <h2 className="qm-text-pretty mt-4 text-lg font-semibold leading-7 tracking-tight sm:text-xl">
              {question.content}
            </h2>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "w-fit shrink-0 rounded-full px-3 py-1",
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

        <div className="mt-4 flex items-start gap-2 rounded-2xl border bg-background/70 p-3 text-xs leading-5 text-muted-foreground">
          <ListChecks className="mt-0.5 size-4 shrink-0" />
          {isMultiple
            ? "Câu hỏi này có thể chọn nhiều đáp án. Bấm lại vào đáp án đã chọn để bỏ chọn."
            : "Câu hỏi này chỉ chọn một đáp án. Khi chọn đáp án mới, lựa chọn cũ sẽ được thay thế."}
        </div>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionIds.includes(option.id);
          const optionLabel = String.fromCharCode(65 + index);

          return (
            <Button
              key={option.id}
              type="button"
              variant="outline"
              className={cn(
                "group h-auto w-full justify-start rounded-2xl border px-4 py-4 text-left font-normal transition-[color,box-shadow,transform,opacity] hover:-translate-y-0.5 hover:bg-hover-surface",
                isSelected &&
                  "border-primary bg-primary/10 text-foreground shadow-sm hover:bg-primary/15",
              )}
              onClick={() => handleSelect(option.id)}
            >
              <span
                className={cn(
                  "mr-3 flex size-8 shrink-0 items-center justify-center rounded-2xl border bg-background text-xs font-semibold text-muted-foreground transition-colors",
                  isSelected &&
                    "border-primary bg-primary text-primary-foreground",
                )}
              >
                {optionLabel}
              </span>

              <span className="min-w-0 flex-1 whitespace-normal leading-6">
                {option.content}
              </span>

              <span
                className={cn(
                  "ml-3 flex size-6 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-colors",
                  isSelected &&
                    "border-primary bg-primary text-primary-foreground",
                )}
              >
                {isSelected ? (
                  <Check className="size-3.5" />
                ) : (
                  <Circle className="size-3" />
                )}
              </span>
            </Button>
          );
        })}
      </div>
    </article>
  );
}
