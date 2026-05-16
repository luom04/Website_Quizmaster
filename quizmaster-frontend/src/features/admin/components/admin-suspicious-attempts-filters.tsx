import {
  CalendarClock,
  MousePointerClick,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const eventTypeOptions: Array<{
  value: "" | QuizEventType;
  label: string;
  description: string;
}> = [
  {
    value: "",
    label: "Tất cả event",
    description: "Hiển thị mọi lượt làm bài có dấu hiệu đáng ngờ.",
  },
  {
    value: "tab_blur",
    label: "Tab blur",
    description: "User rời khỏi tab làm bài.",
  },
  {
    value: "tab_focus",
    label: "Tab focus",
    description: "User quay lại tab làm bài.",
  },
  {
    value: "copy_attempt",
    label: "Copy attempt",
    description: "User cố gắng copy nội dung trong lúc làm bài.",
  },
  {
    value: "right_click",
    label: "Right click",
    description: "User click chuột phải trong lúc làm bài.",
  },
  {
    value: "auto_submitted",
    label: "Auto submitted",
    description: "Bài làm được hệ thống tự động nộp.",
  },
];

const eventToneClasses: Partial<Record<QuizEventType, string>> = {
  tab_blur: "bg-amber-500/10 text-amber-700",
  tab_focus: "bg-blue-500/10 text-blue-700",
  copy_attempt: "bg-rose-500/10 text-rose-700",
  right_click: "bg-orange-500/10 text-orange-700",
  auto_submitted: "bg-violet-500/10 text-violet-700",
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
  const selectedEvent =
    eventTypeOptions.find((option) => option.value === eventType) ??
    eventTypeOptions[0];

  const hasActiveFilters = Boolean(
    eventType || minTabSwitchCount.trim() || from || to,
  );

  return (
    <Card className="overflow-hidden border-dashed bg-background/80">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
              <SlidersHorizontal className="size-5" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">
                  Bộ lọc suspicious attempts
                </h2>

                {eventType ? (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      eventToneClasses[eventType] ??
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedEvent.label}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    All events
                  </span>
                )}

                {minTabSwitchCount.trim() ? (
                  <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">
                    Min tab: {minTabSwitchCount.trim()}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {selectedEvent.description}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer justify-start text-muted-foreground disabled:cursor-not-allowed"
            disabled={!hasActiveFilters}
            onClick={onClear}
          >
            <X className="mr-2 size-4" />
            Clear filters
          </Button>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_0.75fr_0.8fr_0.8fr]">
          <div className="relative">
            <ShieldAlert className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={eventType}
              className="h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 pl-9 text-sm outline-none qm-hover-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) =>
                onEventTypeChange(event.target.value as "" | QuizEventType)
              }
            >
              {eventTypeOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MousePointerClick className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              min={0}
              value={minTabSwitchCount}
              className="h-10 rounded-xl pl-9"
              placeholder="Min tab switch..."
              onChange={(event) =>
                onMinTabSwitchCountChange(event.target.value)
              }
            />
          </div>

          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={from}
              className="h-10 cursor-pointer rounded-xl pl-9"
              onChange={(event) => onFromChange(event.target.value)}
            />
          </div>

          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={to}
              className="h-10 cursor-pointer rounded-xl pl-9"
              onChange={(event) => onToChange(event.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Active filters:</span>

            {eventType ? (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 font-medium ${
                  eventToneClasses[eventType] ??
                  "bg-muted text-muted-foreground"
                }`}
              >
                Event: {selectedEvent.label}
              </span>
            ) : null}

            {minTabSwitchCount.trim() ? (
              <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-700">
                Min tab switches: {minTabSwitchCount.trim()}
              </span>
            ) : null}

            {from ? (
              <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-700">
                From: {from}
              </span>
            ) : null}

            {to ? (
              <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-700">
                To: {to}
              </span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
