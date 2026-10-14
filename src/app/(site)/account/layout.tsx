import { requireUser } from "@/lib/auth/guards";

// The proxy already redirects signed-out visitors; this is the server-side check.
export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  await requireUser("/account/trips");
  return children;
}
