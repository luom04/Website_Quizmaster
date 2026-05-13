import { Check, Circle } from "lucide-react";

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
    <article className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary">Question {questionNumber}</Badge>

          <h2 className="mt-4 text-lg font-semibold leading-7 tracking-tight">
            {question.content}
          </h2>
        </div>

        <Badge variant="outline">
          {isMultiple ? "Multiple choice" : "Single choice"}
        </Badge>
      </div>

      <div className="mt-5 space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);

          return (
            <Button
              key={option.id}
              type="button"
              variant="outline"
              className={cn(
                "h-auto w-full justify-start rounded-2xl border px-4 py-3 text-left font-normal transition",
                isSelected &&
                  "border-primary bg-primary/10 text-foreground hover:bg-primary/15",
              )}
              onClick={() => handleSelect(option.id)}
            >
              <span
                className={cn(
                  "mr-3 flex size-5 shrink-0 items-center justify-center rounded-full border",
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

              <span className="whitespace-normal leading-6">
                {option.content}
              </span>
            </Button>
          );
        })}
      </div>
    </article>
  );
}
