import * as React from "react";

import { FormErrorMessage } from "@/components/forms/form-error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type TextFieldProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string;
};

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, error, disabled, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>

        <Input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-10 rounded-xl bg-background",
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

TextField.displayName = "TextField";

export { TextField };
