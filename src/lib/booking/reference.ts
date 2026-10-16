import { randomInt } from "node:crypto";

// No 0/O or 1/I, so a reference is easy to read back over the phone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** A booking reference like "HB-7K3M9Q": about a billion combinations. */
export function generateReference() {
  let code = "";
  for (let i = 0; i < 6; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `HB-${code}`;
}
