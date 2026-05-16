import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminPageHeaderTone =
  | "blue"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "slate";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: AdminPageHeaderTone;
  actions?: ReactNode;
  meta?: ReactNode;
};

const toneClasses: Record<
  AdminPageHeaderTone,
  {
    shell: string;
    icon: string;
    glow: string;
  }
> = {
  blue: {
    shell: "from-blue-500/10 via-background to-sky-500/10",
    icon: "bg-blue-500/10 text-blue-600",
    glow: "bg-blue-500/20",
  },
  violet: {
    shell: "from-violet-500/10 via-background to-fuchsia-500/10",
    icon: "bg-violet-500/10 text-violet-600",
    glow: "bg-violet-500/20",
  },
  emerald: {
    shell: "from-emerald-500/10 via-background to-teal-500/10",
    icon: "bg-emerald-500/10 text-emerald-600",
    glow: "bg-emerald-500/20",
  },
  amber: {
    shell: "from-amber-500/10 via-background to-orange-500/10",
    icon: "bg-amber-500/10 text-amber-600",
    glow: "bg-amber-500/20",
  },
  rose: {
    shell: "from-rose-500/10 via-background to-pink-500/10",
    icon: "bg-rose-500/10 text-rose-600",
    glow: "bg-rose-500/20",
  },
  slate: {
    shell: "from-slate-500/10 via-background to-muted/80",
    icon: "bg-slate-500/10 text-slate-700",
    glow: "bg-slate-500/20",
  },
};

export function AdminPageHeader({
  eyebrow = "Admin workspace",
  title,
  description,
  icon: Icon,
  tone = "blue",
  actions,
  meta,
}: AdminPageHeaderProps) {
  const styles = toneClasses[tone];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 shadow-sm sm:p-6",
        styles.shell,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-32 rounded-full blur-3xl",
          styles.glow,
        )}
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3">
            {Icon ? (
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                  styles.icon,
                )}
              >
                <Icon className="size-5" />
              </span>
            ) : null}

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </p>
              {meta ? <div className="mt-1">{meta}</div> : null}
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
