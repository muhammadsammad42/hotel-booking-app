import { z } from "zod";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./auth";

export const idSchema = z.string().trim().min(1).max(64);

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name as you would like hotels to see it")
    .max(80, "Use 80 characters or fewer"),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `Use ${PASSWORD_MAX_LENGTH} characters or fewer`),
    confirmPassword: z.string().min(1, "Type your new password again"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "The two passwords do not match",
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current one",
  });

/** Avatars are resized in the browser; the server still checks them. */
export const AVATAR_MAX_BYTES = 200 * 1024;
export const AVATAR_TYPES = ["image/webp", "image/jpeg", "image/png"] as const;

const score = (label: string) =>
  z.coerce
    .number({ error: `Rate the ${label}` })
    .int()
    .min(1, `Rate the ${label}`)
    .max(5);

export const REVIEW_COMMENT_MAX = 1000;

export const reviewSchema = z.object({
  bookingId: idSchema,
  rating: score("stay overall"),
  cleanliness: score("cleanliness"),
  location: score("location"),
  value: score("value for money"),
  service: score("service"),
  comment: z
    .string()
    .trim()
    .max(REVIEW_COMMENT_MAX, `Keep your review to ${REVIEW_COMMENT_MAX} characters`)
    .refine((value) => value === "" || value.length >= 20, "Write at least 20 characters, or leave it empty"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
