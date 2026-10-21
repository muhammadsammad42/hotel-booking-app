"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CameraIcon, CircleAlertIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { changePasswordAction, removeAvatarAction, updateProfileAction, uploadAvatarAction } from "@/app/(site)/account/actions";
import { PasswordInput, PasswordStrengthMeter } from "@/components/auth/password-input";
import { useValidatedFields } from "@/components/auth/use-validated-fields";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initials } from "@/lib/format";
import { safe } from "@/lib/safe-action";
import { cn } from "@/lib/utils";
import { AVATAR_MAX_BYTES, passwordChangeSchema, profileSchema } from "@/lib/validation/account";

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function NameForm({ name }: { name: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string>();
  const { values, errors, setErrors, bind, validateAll } = useValidatedFields(profileSchema, { name });
  const changed = values.name.trim() !== name;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    const data = validateAll();
    if (!data) return;
    startTransition(async () => {
      const result = await safe(updateProfileAction(data));
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        setFormError(result.formError);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <FormError message={formError} />
      <Field label="Full name" hint="Hotels see this name on your bookings and reviews." error={errors.name} required>
        <Input autoComplete="name" {...bind("name")} />
      </Field>
      <Button type="submit" loading={pending} disabled={!changed} className="justify-self-start">
        Save name
      </Button>
    </form>
  );
}

/** Crops the middle square of an image and scales it to 256px WebP. */
async function resizeToSquare(file: File, size = 256) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  // Older Safari cannot encode WebP and falls back to PNG; JPEG keeps it small.
  if (blob && blob.type === "image/webp") return blob;
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
}

export function AvatarForm({ name, email, image }: { name: string | null; email: string; image: string | null }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const shown = preview ?? image;

  React.useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function upload(file: File | undefined) {
    setError(undefined);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file is not a photo. Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("That photo is larger than 15 MB. Try a smaller one.");
      return;
    }
    startTransition(async () => {
      try {
        const blob = await resizeToSquare(file);
        if (!blob || blob.size > AVATAR_MAX_BYTES) throw new Error("Resized photo is too large");
        setPreview(URL.createObjectURL(blob));
        const formData = new FormData();
        formData.append("avatar", new File([blob], "avatar", { type: blob.type }));
        const result = await safe(uploadAvatarAction(formData));
        if (!result.ok) {
          setPreview(null);
          setError(result.formError);
          return;
        }
        toast.success(result.message);
        router.refresh();
      } catch {
        setPreview(null);
        setError("We could not read that photo. Try a different one.");
      }
    });
  }

  function remove() {
    setError(undefined);
    startTransition(async () => {
      const result = await safe(removeAvatarAction());
      if (!result.ok) {
        setError(result.formError);
        return;
      }
      setPreview(null);
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          upload(event.dataTransfer.files[0]);
        }}
        className={cn(
          "flex flex-col items-center gap-5 rounded-xl border border-dashed border-input p-5 text-center transition-colors duration-150 ease-soft sm:flex-row sm:text-left",
          dragging && "border-primary bg-primary/5",
        )}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group/avatar-edit relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-label="Choose a new photo"
        >
          <Avatar className={cn("size-24 transition-opacity duration-150 ease-soft", pending && "opacity-60")}>
            {shown && <AvatarImage src={shown} alt="" />}
            <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">{initials(name, email)}</AvatarFallback>
          </Avatar>
          <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-transform duration-150 ease-soft group-hover/avatar-edit:scale-110">
            <CameraIcon className="size-4" aria-hidden />
          </span>
        </button>
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            {dragging ? "Drop the photo to upload it." : "Drag a photo here, or choose one. A clear face works best; we crop it to a square."}
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button type="button" variant="outline" size="sm" loading={pending} onClick={() => inputRef.current?.click()}>
              <UploadIcon aria-hidden />
              {image ? "Change photo" : "Upload photo"}
            </Button>
            {image && (
              <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={remove}>
                <Trash2Icon aria-hidden />
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      <FormError message={error} />
    </div>
  );
}

const emptyPasswords = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function PasswordForm() {
  const [pending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string>();
  const [key, setKey] = React.useState(0);

  return <PasswordFields key={key} pending={pending} startTransition={startTransition} formError={formError} setFormError={setFormError} onDone={() => setKey((value) => value + 1)} />;
}

function PasswordFields({
  pending,
  startTransition,
  formError,
  setFormError,
  onDone,
}: {
  pending: boolean;
  startTransition: React.TransitionStartFunction;
  formError?: string;
  setFormError: (message?: string) => void;
  onDone: () => void;
}) {
  const { values, errors, setErrors, bind, validateAll } = useValidatedFields(passwordChangeSchema, emptyPasswords);
  const meterId = React.useId();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    const data = validateAll();
    if (!data) return;
    startTransition(async () => {
      const result = await safe(changePasswordAction(data));
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        setFormError(result.formError);
        return;
      }
      toast.success("Password changed", { description: result.message });
      onDone();
    });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <FormError message={formError} />
      <Field label="Current password" error={errors.currentPassword} required>
        <PasswordInput autoComplete="current-password" {...bind("currentPassword")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid content-start gap-2">
          <Field label="New password" error={errors.newPassword} required>
            <PasswordInput autoComplete="new-password" {...bind("newPassword")} />
          </Field>
          <PasswordStrengthMeter password={values.newPassword} id={meterId} />
        </div>
        <Field label="Confirm new password" error={errors.confirmPassword} required>
          <PasswordInput autoComplete="new-password" {...bind("confirmPassword")} />
        </Field>
      </div>
      <Button type="submit" loading={pending} className="justify-self-start">
        Change password
      </Button>
    </form>
  );
}
