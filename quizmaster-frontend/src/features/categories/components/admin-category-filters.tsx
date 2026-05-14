import { Search } from "lucide-react";

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
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            placeholder="Tìm category theo tên..."
            className="h-10 rounded-xl bg-background pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
          />
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
    </div>
  );
}
