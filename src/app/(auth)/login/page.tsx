import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeCallbackUrl } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Sarai to see your trips and book in a few taps.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  const next = safeCallbackUrl(typeof callbackUrl === "string" ? callbackUrl : undefined);

  return (
    <AuthShell
      photo={{
        url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1600&q=80",
        alt: "Bed and bistro table on a timber deck high above a mountain lake",
      }}
      caption={{ place: "Baltit Heights Lodge, Hunza", text: "First light on the peaks, and breakfast on the deck." }}
    >
      <h1 className="type-title-lg">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {next.startsWith("/book")
          ? "Sign in to finish your booking. Your dates and room are saved."
          : "Sign in to see your trips and book in a few taps."}
      </p>
      <div className="mt-8">
        <LoginForm callbackUrl={next} />
      </div>
    </AuthShell>
  );
}
