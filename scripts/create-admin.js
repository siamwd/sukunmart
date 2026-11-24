// Usage: set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then `npm run admin:create`.
// Re-running with an existing email resets that admin's password.
require("fs").existsSync(".env") && loadEnv();
function loadEnv() {
  for (const line of require("fs").readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(.*))\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2] ?? m[3] ?? m[4];
  }
}
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

(async () => {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL is missing or invalid.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  if (password === "change-this-password-min-12-chars") throw new Error("Change the example ADMIN_PASSWORD first.");
  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
  await prisma.adminSession.deleteMany({ where: { admin: { email } } });
  console.log(`Admin ready: ${email}. Remove ADMIN_PASSWORD from .env now.`);
  await prisma.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
