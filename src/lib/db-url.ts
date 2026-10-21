/**
 * The Postgres connection string with an explicit SSL mode.
 *
 * node-postgres treats sslmode=prefer, require and verify-ca as verify-full
 * today and warns that this will change in its next major version. Neon's
 * connection strings say sslmode=require, so they are rewritten to
 * verify-full: the same behaviour, stated explicitly, without the warning.
 * A string that opts into libpq semantics (uselibpqcompat) is left alone.
 */
export function databaseUrl(value: string | undefined) {
  if (!value) return value;
  try {
    const url = new URL(value);
    const mode = url.searchParams.get("sslmode");
    if (mode && ["prefer", "require", "verify-ca"].includes(mode) && !url.searchParams.has("uselibpqcompat")) {
      url.searchParams.set("sslmode", "verify-full");
    }
    return url.toString();
  } catch {
    return value;
  }
}
