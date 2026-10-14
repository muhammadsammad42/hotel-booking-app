import { describe, expect, it } from "vitest";

import { loginSchema, passwordStrength, registerSchema } from "./auth";

describe("registerSchema", () => {
  it("normalises the email and accepts a valid sign-up", () => {
    const result = registerSchema.parse({ name: "  Ayesha Khan ", email: " Ayesha@Example.COM ", password: "long enough" });
    expect(result).toEqual({ name: "Ayesha Khan", email: "ayesha@example.com", password: "long enough" });
  });

  it("explains each problem in plain words", () => {
    const result = registerSchema.safeParse({ name: "A", email: "not-an-email", password: "short" });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages).toContain("Use at least 8 characters");
    expect(messages.some((message) => message.startsWith("Enter a valid email"))).toBe(true);
  });

  it("rejects passwords bcrypt would truncate", () => {
    expect(registerSchema.safeParse({ name: "Ayesha", email: "a@example.com", password: "x".repeat(73) }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires both fields", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@example.com", password: "anything" }).success).toBe(true);
  });
});

describe("passwordStrength", () => {
  it("scores longer, more varied passwords higher", () => {
    expect(passwordStrength("").score).toBe(0);
    expect(passwordStrength("abc").label).toBe("Too short");
    expect(passwordStrength("abcdefgh").label).toBe("Weak");
    expect(passwordStrength("abcdefgh12").label).toBe("Fair");
    expect(passwordStrength("Abcdefgh12").label).toBe("Good");
    expect(passwordStrength("Abcdefgh12!xyz").label).toBe("Strong");
    // Long passphrases are strong even without symbols or capitals.
    expect(passwordStrength("correct horse battery staple").label).toBe("Strong");
  });
});
