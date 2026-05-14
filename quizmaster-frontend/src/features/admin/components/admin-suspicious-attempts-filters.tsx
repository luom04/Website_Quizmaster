import { ShieldAlert, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { QuizEventType } from "@/types/attempt";

type AdminSuspiciousAttemptsFiltersProps = {
  eventType: "" | QuizEventType;
  minTabSwitchCount: string;
  from: string;
  to: string;
  onEventTypeChange: (value: "" | QuizEventType) => void;
  onMinTabSwitchCountChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
};

export function AdminSuspiciousAttemptsFilters({
  eventType,
  minTabSwitchCount,
  from,
  to,
  onEventTypeChange,
  onMinTabSwitchCountChange,
  onFromChange,
  onToChange,
  onClear,
}: AdminSuspiciousAttemptsFiltersProps) {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[230px_190px_180px_180px_auto] xl:items-center">
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <select
            value={eventType}
            className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-9 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              onEventTypeChange(event.target.value as "" | QuizEventType)
            }
          >
            <option value="">Tất cả event</option>
            <option value="tab_blur">Tab blur</option>
            <option value="tab_focus">Tab focus</option>
            <option value="copy_attempt">Copy attempt</option>
            <option value="right_click">Right click</option>
            <option value="auto_submitted">Auto submitted</option>
          </select>
        </div>

        <div className="relative">
          <ShieldAlert className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="number"
            min={0}
            value={minTabSwitchCount}
            placeholder="Min tab switches"
            className="h-10 rounded-xl bg-background pl-9"
            onChange={(event) => onMinTabSwitchCountChange(event.target.value)}
          />
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
