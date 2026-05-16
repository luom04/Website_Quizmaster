import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizStatus } from "@/types/quiz";

type AdminQuizFiltersProps = {
  status: "" | QuizStatus;
  onStatusChange: (value: "" | QuizStatus) => void;
};

const statusOptions: Array<{
  value: "" | QuizStatus;
  label: string;
  description: string;
}> = [
  {
    value: "",
    label: "Tất cả trạng thái",
    description: "Hiển thị toàn bộ quizzes trong hệ thống.",
  },
  {
    value: "DRAFT",
    label: "Draft",
    description: "Quiz đang được chuẩn bị, chưa phát hành.",
  },
  {
    value: "UPCOMING",
    label: "Upcoming",
    description: "Quiz đã lên lịch và sắp mở.",
  },
  {
    value: "ONGOING",
    label: "Ongoing",
    description: "Quiz đang trong thời gian hoạt động.",
  },
  {
    value: "ENDED",
    label: "Ended",
    description: "Quiz đã kết thúc thời gian làm bài.",
  },
  {
    value: "DELETED",
    label: "Deleted",
    description: "Quiz đã bị xóa mềm và có thể restore.",
  },
];

const statusToneClasses: Record<QuizStatus, string> = {
  DRAFT: "bg-amber-500/10 text-amber-700",
  UPCOMING: "bg-blue-500/10 text-blue-700",
  ONGOING: "bg-emerald-500/10 text-emerald-700",
  ENDED: "bg-slate-500/10 text-slate-700",
  DELETED: "bg-rose-500/10 text-rose-700",
};

export function AdminQuizFilters({
  status,
  onStatusChange,
}: AdminQuizFiltersProps) {
  const selectedOption =
    statusOptions.find((option) => option.value === status) ?? statusOptions[0];

  return (
    <Card className="overflow-hidden border-dashed bg-background/80">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
              <SlidersHorizontal className="size-5" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">Bộ lọc quizzes</h2>

                {status ? (
                  <span className={statusToneClasses[status]}>
                    <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium">
                      {selectedOption.label}
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    All
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {selectedOption.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              className="h-10 min-w-48 cursor-pointer rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20"
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as "" | QuizStatus)
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer justify-start text-muted-foreground disabled:cursor-not-allowed"
              disabled={!status}
              onClick={() => onStatusChange("")}
            >
              <X className="mr-2 size-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
