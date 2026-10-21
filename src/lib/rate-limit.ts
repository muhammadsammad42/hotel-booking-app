// Fixed-window rate limits, counted in Postgres so they hold across
// serverless instances without an extra service. Server only.
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

/** Limits in one place: attempts per window, window in seconds. */
export const LIMITS = {
  loginByEmail: { limit: 8, window: 15 * 60 },
  loginByIp: { limit: 30, window: 15 * 60 },
  register: { limit: 5, window: 60 * 60 },
  booking: { limit: 12, window: 10 * 60 },
  passwordChange: { limit: 5, window: 15 * 60 },
  accountWrite: { limit: 30, window: 10 * 60 },
} as const;

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

/**
 * Counts one attempt for `key` and says whether it is within `limit` for the
 * current window. Fails open: if the database cannot be reached, the request
 * is allowed, because the rest of the request will fail anyway.
 */
export async function hit(key: string, { limit, window }: { limit: number; window: number }): Promise<RateLimitResult> {
  try {
    const [row] = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, now() + ${window} * interval '1 second')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= now() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= now() THEN now() + ${window} * interval '1 second' ELSE "RateLimit"."resetAt" END
      RETURNING "count", "resetAt"`;
    if (row.count <= limit) return { ok: true };
    return { ok: false, retryAfter: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)) };
  } catch (error) {
    console.error("[rate-limit] Could not count an attempt:", error);
    return { ok: true };
  }
}

/** Clears a key, e.g. after a successful sign-in. */
export async function clear(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key } }).catch(() => {});
}

/** Removes windows that ended more than a day ago. Called by the cron route. */
export async function pruneRateLimits() {
  const { count } = await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 86_400_000) } } });
  return count;
}

/** The caller's IP address as reported by the proxy in front of the app (Vercel sets x-forwarded-for). */
export function ipFrom(source: Headers) {
  return source.get("x-forwarded-for")?.split(",")[0]?.trim() || source.get("x-real-ip") || "unknown";
}

export async function clientIp() {
  return ipFrom(await headers());
}

/** "a few seconds", "3 minutes": for friendly limit messages. */
export function waitText(seconds: number) {
  if (seconds < 60) return "a few seconds";
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}
