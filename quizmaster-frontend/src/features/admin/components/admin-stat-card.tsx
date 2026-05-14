import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type AdminStatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
};

export function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
}: AdminStatCardProps) {
  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>

            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex size-11 items-center justify-center rounded-2xl border bg-muted/40 text-muted-foreground">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
