import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions/admin-auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  await requireAdmin(); // pages and actions re-check; layouts alone are not a security boundary
  return (
    <div className="min-h-dvh bg-surface lg:flex">
      <AdminNav logout={<form action={logoutAction}><button type="submit" className="w-full rounded-btn px-3 py-2 text-left text-sm hover:bg-brand-soft">Log out</button></form>} />
      <div className="min-w-0 flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}
