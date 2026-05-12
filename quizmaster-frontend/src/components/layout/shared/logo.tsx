import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link
      to={ROUTES.USER.QUIZZES}
      className={cn("flex items-center gap-2", className)}
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-5" />
      </div>

      {showText ? (
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Quizmaster</p>
          <p className="text-xs text-muted-foreground">Learning platform</p>
        </div>
      ) : null}
    </Link>
  );
}
