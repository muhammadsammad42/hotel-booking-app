// Server actions are network calls. If the connection drops, the promise
// rejects; inside a transition React would then show the error page, and
// elsewhere the rejection would go unhandled. safe() turns that into an
// ordinary failed result the form can show.

/** The result used when the server could not be reached at all. */
export const OFFLINE = {
  ok: false,
  formError: "We could not reach Sarai. Check your connection and try again.",
  fieldErrors: undefined,
  unavailable: undefined,
  reason: "error",
} as const;

export async function safe<T>(call: Promise<T>): Promise<T | typeof OFFLINE> {
  try {
    return await call;
  } catch (error) {
    console.error("[action] Request failed:", error);
    return OFFLINE;
  }
}
