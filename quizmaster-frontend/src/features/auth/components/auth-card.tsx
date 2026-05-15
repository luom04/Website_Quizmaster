import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Card
      className={cn(
        "qm-soft-card relative overflow-hidden border-0 bg-card/95 backdrop-blur-xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

      <CardHeader className="space-y-4 px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
          <Sparkles className="size-5" />
        </div>

        <div>
          <p className="qm-section-eyebrow">{eyebrow}</p>

          <CardTitle className="qm-section-title mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </CardTitle>
        </div>

        <CardDescription className="qm-section-description text-sm leading-6">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        {children}

        {footer ? (
          <div className="mt-6 rounded-2xl border bg-muted/25 px-4 py-3 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
