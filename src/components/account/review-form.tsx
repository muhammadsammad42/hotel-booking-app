"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";

import { submitReviewAction } from "@/app/(site)/account/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { StarInput } from "@/components/ui/star-input";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_COMMENT_MAX, type ReviewInput } from "@/lib/validation/account";
import type { FieldErrors } from "@/lib/validation/auth";

const categories = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "location", label: "Location" },
  { key: "value", label: "Value for money" },
  { key: "service", label: "Service" },
] as const;

type Scores = Pick<ReviewInput, "rating" | "cleanliness" | "location" | "value" | "service">;

/** Overall stars, four sub-ratings and an optional comment. One review per stay. */
export function ReviewForm({ bookingId, hotelName }: { bookingId: string; hotelName: string }) {
  const router = useRouter();
  const [scores, setScores] = React.useState<Scores>({ rating: 0, cleanliness: 0, location: 0, value: 0, service: 0 });
  const [comment, setComment] = React.useState("");
  const [errors, setErrors] = React.useState<FieldErrors<ReviewInput>>({});
  const [formError, setFormError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();

  function setScore(key: keyof Scores, value: number) {
    setScores((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    const missing: FieldErrors<ReviewInput> = {};
    if (!scores.rating) missing.rating = "Choose a rating for your stay overall";
    for (const { key, label } of categories) if (!scores[key]) missing[key] = `Rate ${label.toLowerCase()}`;
    if (Object.keys(missing).length) {
      setErrors(missing);
      return;
    }

    startTransition(async () => {
      const result = await submitReviewAction({ bookingId, ...scores, comment });
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        if (result.formError) setFormError(result.formError);
        return;
      }
      toast.success("Review published", { description: result.message });
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      {formError && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          {formError}
        </p>
      )}
      <StarInput
        name="rating"
        label={`How was your stay at ${hotelName}?`}
        size="lg"
        value={scores.rating}
        onChange={(value) => setScore("rating", value)}
        error={errors.rating}
      />
      <div className="grid gap-5 rounded-xl bg-muted/50 p-4 sm:grid-cols-2 sm:p-5">
        {categories.map(({ key, label }) => (
          <StarInput key={key} name={key} label={label} value={scores[key]} onChange={(value) => setScore(key, value)} error={errors[key]} />
        ))}
      </div>
      <div className="grid gap-1.5">
        <Field label="Tell other travellers about it" hint="Optional. What stood out? What should others know?" error={errors.comment}>
          <Textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} maxLength={REVIEW_COMMENT_MAX} />
        </Field>
        <p className="text-right text-xs text-muted-foreground tabular-nums" aria-hidden>
          {comment.length} / {REVIEW_COMMENT_MAX}
        </p>
      </div>
      <Button type="submit" size="lg" loading={pending} className="justify-self-start">
        <SendIcon aria-hidden />
        Publish review
      </Button>
    </form>
  );
}
