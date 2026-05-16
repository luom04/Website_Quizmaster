import {
  FolderTree,
  ListChecks,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const typeOptions: Array<{
  value: "" | QuestionType;
  label: string;
  description: string;
}> = [
  {
    value: "",
    label: "Tất cả type",
    description: "Hiển thị cả single choice và multiple choice.",
  },
  {
    value: "single",
    label: "Single choice",
    description: "Câu hỏi chỉ có một đáp án đúng.",
  },
  {
    value: "multiple",
    label: "Multiple choice",
    description: "Câu hỏi có thể có nhiều đáp án đúng.",
  },
];

const typeToneClasses: Record<QuestionType, string> = {
  single: "bg-blue-500/10 text-blue-700",
  multiple: "bg-violet-500/10 text-violet-700",
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
  const selectedCategory = categories.find(
    (category) => category.id === categoryId,
  );

  const selectedType =
    typeOptions.find((option) => option.value === type) ?? typeOptions[0];

  const hasActiveFilters = Boolean(
    search.trim() || categoryId || type || includeDeleted,
  );

  function handleClearFilters() {
    onSearchChange("");
    onCategoryChange("");
    onTypeChange("");
    onIncludeDeletedChange(false);
  }

  return (
    <Card className="overflow-hidden border-dashed bg-background/80">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <SlidersHorizontal className="size-5" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">Bộ lọc question bank</h2>

                {type ? (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${typeToneClasses[type]}`}
                  >
                    {selectedType.label}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    All types
                  </span>
                )}

                {includeDeleted ? (
                  <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600">
                    Include deleted
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {selectedType.description}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer justify-start text-muted-foreground disabled:cursor-not-allowed"
            disabled={!hasActiveFilters}
            onClick={handleClearFilters}
          >
            <X className="mr-2 size-4" />
            Clear filters
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              className="h-10 rounded-xl pl-9"
              placeholder="Tìm câu hỏi theo nội dung..."
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="relative">
            <FolderTree className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={categoryId}
              className="h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 pl-9 text-sm outline-none qm-hover-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

          <div className="relative">
            <ListChecks className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={type}
              className="h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 pl-9 text-sm outline-none qm-hover-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) =>
                onTypeChange(event.target.value as "" | QuestionType)
              }
            >
              {typeOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 text-sm qm-hover-surface">
            <input
              type="checkbox"
              checked={includeDeleted}
              className="size-4 cursor-pointer"
              onChange={(event) => onIncludeDeletedChange(event.target.checked)}
            />

            <Trash2 className="size-4 text-muted-foreground" />
            <span className="whitespace-nowrap">Deleted</span>
          </label>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Active filters:</span>

            {search.trim() ? (
              <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600">
                Search: {search.trim()}
              </span>
            ) : null}

            {selectedCategory ? (
              <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600">
                Category: {selectedCategory.name}
              </span>
            ) : null}

            {type ? (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 font-medium ${typeToneClasses[type]}`}
              >
                Type: {selectedType.label}
              </span>
            ) : null}

            {includeDeleted ? (
              <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 font-medium text-rose-600">
                Include deleted
              </span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
