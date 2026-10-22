import { z } from "@/lib/validation/zod";

import { BOOKING_CONFIG } from "@/lib/booking/config";
import { isIsoDate } from "@/lib/booking/stay";
import { MAX_GUESTS } from "@/lib/search/params";

const isoDate = z.string().refine(isIsoDate, "Choose a valid date");

/** The stay a guest is booking, as carried in the /book URL. */
export const stayRequestSchema = z.object({
  hotel: z.string().trim().min(1).max(120),
  room: z.string().trim().min(1).max(64),
  checkIn: isoDate,
  checkOut: isoDate,
  guests: z.coerce.number().int().min(1).max(MAX_GUESTS),
  rooms: z.coerce.number().int().min(1).max(BOOKING_CONFIG.maxRooms),
});

/** The lead guest's details, shown to the hotel. */
export const guestDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter the full name of the lead guest")
    .max(80, "Use 80 characters or fewer"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter an email address for your confirmation")
    .pipe(z.email("Enter a valid email address, like name@example.com")),
  phone: z
    .string()
    .trim()
    .max(24, "Use 24 characters or fewer")
    .refine((value) => value === "" || /^\+?[0-9][0-9 ()-]{6,22}$/.test(value), {
      message: "Enter a phone number with its country code, like +92 300 1234567",
    }),
  specialRequests: z.string().trim().max(500, "Keep requests to 500 characters"),
});

export const bookingSubmissionSchema = stayRequestSchema.extend({ guest: guestDetailsSchema });

export type StayRequest = z.infer<typeof stayRequestSchema>;
export type GuestDetails = z.infer<typeof guestDetailsSchema>;
export type BookingSubmission = z.infer<typeof bookingSubmissionSchema>;
