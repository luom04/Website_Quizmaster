import type { ReactNode } from "react";

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
        "border-border/70 bg-card/95 shadow-sm backdrop-blur",
        "rounded-3xl",
        className,
      )}
    >
      <CardHeader className="space-y-3 px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>

          <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">
            {title}
          </CardTitle>
        </div>

        <CardDescription className="text-sm leading-6">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-7 sm:pb-7">
        {children}

        {footer ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
