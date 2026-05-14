import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { Category } from "@/types/category";
import type { QuestionType } from "@/types/question";

type AdminQuestionFiltersProps = {
  search: string;
  categoryId: string;
  includeDeleted: boolean;
  type: "" | QuestionType;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: "" | QuestionType) => void;
  onIncludeDeletedChange: (value: boolean) => void;
};

export function AdminQuestionFilters({
  search,
  categoryId,
  includeDeleted,
  type,
  categories,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onIncludeDeletedChange,
}: AdminQuestionFiltersProps) {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            placeholder="Tìm câu hỏi theo nội dung..."
            className="h-10 rounded-xl bg-background pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <select
            value={categoryId}
            className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-9 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Tất cả category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <select
          value={type}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          onChange={(event) =>
            onTypeChange(event.target.value as "" | QuestionType)
          }
        >
          <option value="">Tất cả type</option>
          <option value="single">Single choice</option>
          <option value="multiple">Multiple choice</option>
        </select>
      </div>
      <label className="flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={includeDeleted}
          className="size-4"
          onChange={(event) => onIncludeDeletedChange(event.target.checked)}
        />
        Include deleted
      </label>
    </div>
  );
}
