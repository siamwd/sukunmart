"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/admin-auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" autoComplete="username" required className="input" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="input" /></div>
      {state?.error && <p role="alert" className="rounded-btn bg-red-50 p-3 text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
