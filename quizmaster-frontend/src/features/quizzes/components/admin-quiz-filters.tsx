import { SlidersHorizontal } from "lucide-react";

import type { QuizStatus } from "@/types/quiz";

type AdminQuizFiltersProps = {
  status: "" | QuizStatus;
  onStatusChange: (value: "" | QuizStatus) => void;
};

export function AdminQuizFilters({
  status,
  onStatusChange,
}: AdminQuizFiltersProps) {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[240px_1fr] lg:items-center">
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <select
            value={status}
            className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-9 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              onStatusChange(event.target.value as "" | QuizStatus)
            }
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Draft</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="ENDED">Ended</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>

        <p className="text-sm text-muted-foreground">
          Lọc quiz theo trạng thái để dễ quản lý các bài đang mở, sắp diễn ra,
          đã kết thúc hoặc đã bị xóa mềm.
        </p>
      </div>
    </div>
  );
}
