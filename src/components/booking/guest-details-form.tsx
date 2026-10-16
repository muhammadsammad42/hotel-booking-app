"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, LockIcon } from "lucide-react";

import { createBookingAction } from "@/app/(site)/book/actions";
import { useValidatedFields } from "@/components/auth/use-validated-fields";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { guestDetailsSchema, type GuestDetails, type StayRequest } from "@/lib/validation/booking";

type GuestDetailsFormProps = {
  stay: StayRequest;
  initial: GuestDetails;
  /** Where "Change dates" goes: the hotel page with this stay. */
  backHref: string;
  total: string;
};

/** Lead guest details, then on to payment. Validates as you go and on the server. */
export function GuestDetailsForm({ stay, initial, backHref, total }: GuestDetailsFormProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<{ message: string; unavailable?: boolean }>();
  const { values, errors, setErrors, bind, validateAll } = useValidatedFields(guestDetailsSchema, initial);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);
    const guest = validateAll();
    if (!guest) return;

    setPending(true);
    const result = await createBookingAction({ ...stay, guest });
    if (!result.ok) {
      setPending(false);
      if (result.fieldErrors) setErrors(result.fieldErrors);
      if (result.formError) setFormError({ message: result.formError, unavailable: result.unavailable });
      return;
    }
    router.push(`/book/${result.bookingId}`);
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5">
      {formError && (
        <div
          role="alert"
          className="grid gap-3 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          <p className="flex items-start gap-2.5">
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {formError.message}
          </p>
          {formError.unavailable && (
            <Button asChild variant="outline" size="sm" className="justify-self-start">
              <Link href={backHref}>Choose other dates</Link>
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.name} hint="As it appears on your ID." required>
          <Input autoComplete="name" {...bind("name")} />
        </Field>
        <Field label="Email" error={errors.email} hint="Your confirmation goes here." required>
          <Input type="email" inputMode="email" autoComplete="email" {...bind("email")} />
        </Field>
      </div>
      <Field label="Phone" error={errors.phone} hint="Optional. The hotel may call about your arrival.">
        <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="+92 300 1234567" {...bind("phone")} />
      </Field>
      <Field label="Special requests" error={errors.specialRequests} hint="Optional. Arrival time, dietary needs, a quiet room...">
        <Textarea {...bind("specialRequests")} maxLength={500} rows={3} />
      </Field>
      <p className="text-right text-xs text-muted-foreground tabular-nums" aria-hidden>
        {values.specialRequests.length} / 500
      </p>

      <div className="grid gap-3 border-t pt-5">
        <Button type="submit" size="lg" fullWidth loading={pending}>
          <LockIcon aria-hidden />
          Continue to payment · {total}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Next, we hold your room for 30 minutes while you pay securely with Stripe.
        </p>
      </div>
    </form>
  );
}
