import { z } from "@/lib/validation/zod";

export const PASSWORD_MIN_LENGTH = 8;
// bcrypt ignores everything after 72 bytes.
export const PASSWORD_MAX_LENGTH = 72;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address")
  .pipe(z.email("Enter a valid email address, like name@example.com"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name as you would like the hotel to see it")
    .max(80, "Use 80 characters or fewer"),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Use ${PASSWORD_MAX_LENGTH} characters or fewer`),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type PasswordStrength = {
  /** 0 (empty) to 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

/**
 * A quick estimate for the strength meter. Length matters most; mixing
 * character types helps. It guides the guest but does not block sign-up:
 * the only hard rule is the minimum length.
 */
export function passwordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "" };
  if (password.length < PASSWORD_MIN_LENGTH) return { score: 1, label: "Too short" };

  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;
  const lengthPoints = password.length >= 16 ? 2 : password.length >= 12 ? 1 : 0;
  const points = lengthPoints + (variety >= 3 ? 2 : variety === 2 ? 1 : 0);

  if (points >= 3) return { score: 4, label: "Strong" };
  if (points === 2) return { score: 3, label: "Good" };
  if (points === 1) return { score: 2, label: "Fair" };
  return { score: 1, label: "Weak" };
}

/** Field errors keyed by field name, as returned to the forms. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function fieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const result: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T | undefined;
    if (key !== undefined && !result[key]) result[key] = issue.message;
  }
  return result;
}
