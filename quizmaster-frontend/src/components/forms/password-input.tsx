import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = React.ComponentProps<"input">;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? "text" : "password"}
          className={cn("h-10 rounded-xl bg-background pr-10", className)}
          disabled={disabled}
          {...props}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:cursor-pointer"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? (
            <EyeOff className="size-4 " />
          ) : (
            <Eye className="size-4 " />
          )}

          <span className="sr-only">
            {isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          </span>
        </Button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
