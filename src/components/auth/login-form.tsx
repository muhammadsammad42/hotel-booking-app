"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { useValidatedFields } from "@/components/auth/use-validated-fields";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validation/auth";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string>();
  const { errors, bind, validateAll } = useValidatedFields(loginSchema, { email: "", password: "" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);
    const data = validateAll();
    if (!data) return;

    setPending(true);
    const result = await signIn("credentials", { ...data, redirect: false });
    if (!result || result.error) {
      setPending(false);
      setFormError("That email and password do not match an account. Check them and try again.");
      return;
    }

    toast.success("Welcome back", { description: "You are signed in." });
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
      <Field label="Email" error={errors.email}>
        <Input type="email" autoComplete="email" inputMode="email" autoFocus {...bind("email")} />
      </Field>
      <Field label="Password" error={errors.password}>
        <PasswordInput autoComplete="current-password" {...bind("password")} />
      </Field>
      <Button type="submit" size="lg" fullWidth loading={pending} className="mt-1">
        Sign in
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to Sarai?{" "}
        <Link
          href={callbackUrl === "/" ? "/register" : `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
