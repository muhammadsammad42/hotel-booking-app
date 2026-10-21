"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { registerAction } from "@/app/(auth)/actions";
import { PasswordInput, PasswordStrengthMeter } from "@/components/auth/password-input";
import { useValidatedFields } from "@/components/auth/use-validated-fields";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { safe } from "@/lib/safe-action";
import { registerSchema } from "@/lib/validation/auth";

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string>();
  const { values, errors, setErrors, bind, validateAll } = useValidatedFields(registerSchema, {
    name: "",
    email: "",
    password: "",
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);
    const data = validateAll();
    if (!data) return;

    setPending(true);
    const result = await safe(registerAction(data));
    if (!result.ok) {
      setPending(false);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      setFormError(result.formError);
      return;
    }

    const signedIn = await signIn("credentials", { email: data.email, password: data.password, redirect: false }).catch(() => undefined);
    if (!signedIn || signedIn.error) {
      // The account exists; let the guest sign in by hand.
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    const firstName = data.name.split(" ")[0];
    toast.success(`Welcome to Sarai, ${firstName}`, { description: "Your account is ready." });
    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5">
      {formError && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive"
        >
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          {formError}
        </p>
      )}
      <Field label="Full name" error={errors.name}>
        <Input autoComplete="name" autoFocus {...bind("name")} />
      </Field>
      <Field label="Email" error={errors.email} hint="We send booking confirmations here.">
        <Input type="email" autoComplete="email" inputMode="email" {...bind("email")} />
      </Field>
      <div className="grid gap-2.5">
        <Field label="Password" error={errors.password}>
          <PasswordInput autoComplete="new-password" {...bind("password")} />
        </Field>
        <PasswordStrengthMeter password={values.password} />
      </div>
      <Button type="submit" size="lg" fullWidth loading={pending} className="mt-1">
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={callbackUrl === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
