"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { passwordStrength } from "@/lib/validation/auth";

/** Password field with a show/hide toggle. Accepts the props of Input. */
function PasswordInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-12", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors duration-150 ease-soft outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {visible ? <EyeOffIcon className="size-4" aria-hidden /> : <EyeIcon className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

const meterColours = ["", "bg-destructive", "bg-warning", "bg-success", "bg-success"] as const;

/** Four-segment strength meter shown under a new password. */
function PasswordStrengthMeter({ password, id }: { password: string; id?: string }) {
  const { score, label } = passwordStrength(password);

  return (
    <div id={id} className="grid gap-1.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1 rounded-full bg-border transition-colors duration-200 ease-soft",
              score >= segment && meterColours[score],
            )}
          />
        ))}
      </div>
      <p className="flex justify-between gap-3 text-xs text-muted-foreground">
        <span>{label ? `Strength: ${label}` : "Use at least 8 characters."}</span>
        {score > 0 && score < 4 && <span>Longer is stronger</span>}
      </p>
    </div>
  );
}

export { PasswordInput, PasswordStrengthMeter };
