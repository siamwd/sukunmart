import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { rateLimit, clientIp } from "./rate-limit";

const COOKIE = "sukun_admin";
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const sessionMs = () => (Number(process.env.ADMIN_SESSION_HOURS) || 8) * 3600 * 1000;

// Used to keep timing similar when the email does not exist.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

export const hashPassword = (pw) => bcrypt.hash(pw, 12);

export async function login(email, password) {
  const h = await headers();
  const ip = clientIp(h);
  const byIp = rateLimit(`login:ip:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  const byEmail = rateLimit(`login:email:${String(email).toLowerCase()}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!byIp.ok || !byEmail.ok) return { ok: false, error: "Too many attempts. Try again in a few minutes." };

  const admin = await prisma.admin.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  const valid = await bcrypt.compare(String(password), admin ? admin.passwordHash : DUMMY_HASH);
  if (!admin || !valid) return { ok: false, error: "Invalid email or password." };

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionMs());
  await prisma.adminSession.create({ data: { tokenHash: sha256(token), adminId: admin.id, expiresAt } });
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", expires: expiresAt,
  });
  return { ok: true };
}

export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const s = await prisma.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { admin: { select: { id: true, email: true } } },
  });
  if (!s || s.expiresAt < new Date()) return null;
  return s.admin;
}

/** Call at the top of EVERY admin page, server action and route handler. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin-login");
  return admin;
}

/** For route handlers: returns null instead of redirecting. */
export const getAdminOrNull = getAdmin;

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(COOKIE);
}

/** CSRF defence for route handlers (Server Actions get Next's built-in Origin check). */
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}
