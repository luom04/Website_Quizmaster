import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminDashboardSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminDashboardSection({
  title,
  description,
  children,
}: AdminDashboardSectionProps) {
  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>

        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}
