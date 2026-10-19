"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/guards";
import { refreshSession } from "@/lib/auth";
import { CancellationError, cancelBooking } from "@/lib/booking/cancellation";
import { sendBookingCancelledEmail } from "@/lib/email";
import { formatPrice } from "@/lib/format";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  idSchema,
  passwordChangeSchema,
  profileSchema,
  reviewSchema,
  type PasswordChangeInput,
  type ProfileInput,
  type ReviewInput,
} from "@/lib/validation/account";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";

type Result<Input = never> =
  | { ok: true; message: string }
  | { ok: false; formError?: string; fieldErrors?: FieldErrors<Input> };

const SIGNED_OUT = { ok: false, formError: "Your session has ended. Sign in again to continue." } as const;

export async function cancelBookingAction(bookingId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const id = idSchema.safeParse(bookingId);
  if (!id.success) return { ok: false, formError: "We could not find this booking." };

  try {
    const { refunded, currency } = await cancelBooking({ bookingId: id.data, actor: "guest", userId: user.id });
    after(() => sendBookingCancelledEmail(id.data));
    revalidatePath("/account/trips", "layout");
    return {
      ok: true,
      message: refunded > 0 ? `We have refunded ${formatPrice(refunded, currency)} to your card.` : "Your booking is cancelled.",
    };
  } catch (error) {
    if (error instanceof CancellationError) return { ok: false, formError: error.message };
    console.error("[account] Cancel failed:", error);
    return { ok: false, formError: "We could not cancel this booking just now. Nothing has changed; please try again." };
  }
}

export async function updateProfileAction(input: ProfileInput): Promise<Result<ProfileInput>> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  await refreshSession();
  revalidatePath("/", "layout");
  return { ok: true, message: "Your name is updated." };
}

export async function changePasswordAction(input: PasswordChangeInput): Promise<Result<PasswordChangeInput>> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!record?.passwordHash || !(await verifyPassword(parsed.data.currentPassword, record.passwordHash))) {
    return { ok: false, fieldErrors: { currentPassword: "That is not your current password" } };
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  return { ok: true, message: "Your password is changed. Use it next time you sign in." };
}

/** Checks the first bytes of the file, not just the type the browser claims. */
function sniffImage(bytes: Uint8Array): (typeof AVATAR_TYPES)[number] | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function uploadAvatarAction(formData: FormData): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { ok: false, formError: "Choose a photo to upload." };
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, formError: "That photo is too large. Try a smaller one." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = sniffImage(bytes);
  if (!contentType) return { ok: false, formError: "Use a JPG, PNG or WebP photo." };

  const avatar = await prisma.userAvatar.upsert({
    where: { userId: user.id },
    create: { userId: user.id, data: bytes, contentType },
    update: { data: bytes, contentType },
  });
  await prisma.user.update({ where: { id: user.id }, data: { image: `/api/avatars/${user.id}?v=${avatar.updatedAt.getTime()}` } });
  await refreshSession();
  revalidatePath("/", "layout");
  return { ok: true, message: "Looking good. Your new photo is saved." };
}

export async function removeAvatarAction(): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  await prisma.$transaction([
    prisma.userAvatar.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({ where: { id: user.id }, data: { image: null } }),
  ]);
  await refreshSession();
  revalidatePath("/", "layout");
  return { ok: true, message: "Your photo is removed." };
}

export async function submitReviewAction(input: ReviewInput): Promise<Result<ReviewInput>> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { bookingId, comment, ...ratings } = parsed.data;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: user.id },
    select: { status: true, review: { select: { id: true } }, roomType: { select: { hotel: { select: { id: true, slug: true } } } } },
  });
  if (!booking) return { ok: false, formError: "We could not find this booking." };
  if (booking.status !== "CHECKED_OUT") return { ok: false, formError: "You can review a stay once you have checked out." };
  if (booking.review) return { ok: false, formError: "You have already reviewed this stay. Thank you!" };

  try {
    await prisma.review.create({
      data: { ...ratings, comment: comment || null, bookingId, userId: user.id, hotelId: booking.roomType.hotel.id },
    });
  } catch {
    // The unique booking id also stops a double submit.
    return { ok: false, formError: "You have already reviewed this stay. Thank you!" };
  }

  revalidatePath(`/hotels/${booking.roomType.hotel.slug}`);
  revalidatePath("/account/trips", "layout");
  return { ok: true, message: "Thank you for your review. It helps other travellers choose." };
}
