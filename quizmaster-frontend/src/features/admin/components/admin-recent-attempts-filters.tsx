import { SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { AttemptStatus } from "@/types/attempt";

type AdminRecentAttemptsFiltersProps = {
  status: "" | AttemptStatus;
  from: string;
  to: string;
  onStatusChange: (value: "" | AttemptStatus) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
};

export function AdminRecentAttemptsFilters({
  status,
  from,
  to,
  onStatusChange,
  onFromChange,
  onToChange,
  onClear,
}: AdminRecentAttemptsFiltersProps) {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[300px_300px_300px_auto] md:items-center">
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <select
            value={status}
            className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-9 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              onStatusChange(event.target.value as "" | AttemptStatus)
            }
          >
            <option value="">Tất cả status</option>
            <option value="in_progress">In progress</option>
            <option value="submitted">Submitted</option>
            <option value="timed_out">Timed out</option>
          </select>
        </div>

        <Input
          type="date"
          value={from}
          className="h-10 rounded-xl"
          onChange={(event) => onFromChange(event.target.value)}
        />

        <Input
          type="date"
          value={to}
          className="h-10 rounded-xl"
          onChange={(event) => onToChange(event.target.value)}
        />

        <button
          type="button"
          className="h-10 rounded-xl border px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
