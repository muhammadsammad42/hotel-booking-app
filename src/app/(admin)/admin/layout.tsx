import type { Metadata } from "next";
import { cookies } from "next/headers";

import { SIDEBAR_COOKIE } from "@/components/admin/admin-nav";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Sarai admin" },
  robots: { index: false, follow: false },
};

// The proxy redirects non-admins; this re-checks the role in the database.
// Every admin page, action and route handler checks again on its own.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";
  return (
    <AdminShell user={user} initialCollapsed={collapsed}>
      {children}
    </AdminShell>
  );
}
