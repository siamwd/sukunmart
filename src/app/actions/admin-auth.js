"use server";
import { redirect } from "next/navigation";
import { login, logout, getAdmin } from "@/lib/auth";
import { isEmail } from "@/lib/validation";

export async function loginAction(_prev, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!isEmail(email) || !password) return { error: "Enter your email and password." };
  const r = await login(email, password);
  if (!r.ok) return { error: r.error };
  redirect("/admin-dashboard");
}

export async function logoutAction() {
  await logout();
  redirect("/admin-login");
}

export async function redirectIfLoggedIn() {
  if (await getAdmin()) redirect("/admin-dashboard");
}
