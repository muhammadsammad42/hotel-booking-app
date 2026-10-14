import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { safeCallbackUrl } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Sarai account to book stays, save favourites and manage your trips.",
};

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { callbackUrl } = await searchParams;
  const next = safeCallbackUrl(typeof callbackUrl === "string" ? callbackUrl : undefined);

  return (
    <AuthShell
      photo={{
        url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1600&q=80",
        alt: "Overwater villas on stilts in a clear turquoise lagoon",
      }}
      caption={{ place: "Coral Lagoon Resort, Maldives", text: "Your deck, the lagoon, and nowhere else to be." }}
    >
      <h1 className="type-title-lg">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Book stays, save favourites and keep every trip in one place.
      </p>
      <div className="mt-8">
        <RegisterForm callbackUrl={next} />
      </div>
    </AuthShell>
  );
}
