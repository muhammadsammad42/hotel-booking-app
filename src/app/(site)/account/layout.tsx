import { AccountNav } from "@/components/account/account-nav";
import { PageContainer, Section } from "@/components/layout/page-container";
import { requireUser } from "@/lib/auth/guards";

// The proxy already redirects signed-out visitors; this is the server-side check.
// Each page checks again, because layouts do not re-run on every navigation.
export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  await requireUser("/account/trips");
  return (
    <Section spacing="compact" className="print:py-0">
      <PageContainer width="app" className="print:max-w-none print:px-0">
        <AccountNav />
        <div className="min-w-0 pt-8 print:pt-0">{children}</div>
      </PageContainer>
    </Section>
  );
}
