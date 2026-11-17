import { getAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await getAdmin()) redirect("/admin-dashboard");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface p-4">
      <div className="card w-full max-w-sm p-6">
        <h1 className="mb-1 text-2xl font-bold text-brand">SUKUN Admin</h1>
        <p className="mb-5 text-sm text-muted">Sign in to manage the store.</p>
        <LoginForm />
      </div>
    </main>
  );
}
