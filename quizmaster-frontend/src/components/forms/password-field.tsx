import * as React from "react";

import { FormErrorMessage } from "@/components/forms/form-error-message";
import { PasswordInput } from "@/components/forms/password-input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PasswordFieldProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string;
  rightLabel?: React.ReactNode;
};

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label, error, rightLabel, disabled, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>

          {rightLabel}
        </div>

        <PasswordInput
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cn(
            error &&
              "border-destructive/60 focus-visible:border-destructive/70 focus-visible:ring-destructive/20",
            className,
          )}
          {...props}
        />

        <FormErrorMessage message={error} />
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";

export { PasswordField };
