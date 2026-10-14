import { requireAdmin } from "@/lib/auth/guards";

// The proxy redirects non-admins; this re-checks the role in the database.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return children;
}
