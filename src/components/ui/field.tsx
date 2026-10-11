"use client";

import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  required?: boolean;
};

type FieldProps = {
  label: string;
  /** Helper text shown under the control. */
  hint?: string;
  /** Error message; replaces the hint and marks the control invalid. */
  error?: string;
  required?: boolean;
  className?: string;
  /** A single form control: Input, Textarea or SelectTrigger. */
  children: React.ReactElement<ControlProps>;
};

/** Label, control and message wired together for assistive technology. */
function Field({ label, hint, error, required, className, children }: FieldProps) {
  const generatedId = React.useId();
  const id = children.props.id ?? generatedId;
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div data-slot="field" className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-muted-foreground" aria-hidden>
            *
          </span>
        )}
      </Label>
      {React.cloneElement(children, {
        id,
        required,
        "aria-describedby": message ? messageId : undefined,
        "aria-invalid": error ? true : undefined,
      })}
      {message && (
        <p
          id={messageId}
          className={cn(
            "flex items-start gap-1.5 text-sm",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error && <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />}
          {message}
        </p>
      )}
    </div>
  );
}

export { Field };
