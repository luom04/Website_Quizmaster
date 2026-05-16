import { FolderTree, Search, SlidersHorizontal, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminCategoryFiltersProps = {
  search: string;
  includeDeleted: boolean;
  onSearchChange: (value: string) => void;
  onIncludeDeletedChange: (value: boolean) => void;
};

export function AdminCategoryFilters({
  search,
  includeDeleted,
  onSearchChange,
  onIncludeDeletedChange,
}: AdminCategoryFiltersProps) {
  const hasActiveFilters = Boolean(search.trim() || includeDeleted);

  function handleClearFilters() {
    onSearchChange("");
    onIncludeDeletedChange(false);
  }

  return (
    <Card className="overflow-hidden border-dashed bg-background/80">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <SlidersHorizontal className="size-5" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">Bộ lọc categories</h2>

                {includeDeleted ? (
                  <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600">
                    Include deleted
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Active only
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Tìm category theo tên và chọn có hiển thị category đã xóa mềm
                hay không.
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

        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              className="h-10 rounded-xl pl-9"
              placeholder="Tìm category theo tên..."
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 text-sm qm-hover-surface">
            <input
              type="checkbox"
              checked={includeDeleted}
              className="size-4 cursor-pointer"
              onChange={(event) => onIncludeDeletedChange(event.target.checked)}
            />

            <Trash2 className="size-4 text-muted-foreground" />
            <span className="whitespace-nowrap">Include deleted</span>
          </label>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Active filters:</span>

            {search.trim() ? (
              <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600">
                Search: {search.trim()}
              </span>
            ) : null}

            {includeDeleted ? (
              <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 font-medium text-rose-600">
                Include deleted
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FolderTree className="size-3.5" />
            Đang hiển thị categories active.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
