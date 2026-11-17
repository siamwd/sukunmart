// `npm run db:seed` — idempotent: skipped if any category already exists.
const { PrismaClient } = require("@prisma/client");
const data = require("./seed-data");
const prisma = new PrismaClient();

async function main() {
  if ((await prisma.category.count()) > 0) { console.log("Categories exist — seed skipped. (Use `npx prisma migrate reset` for a clean start.)"); return; }
  for (const [i, [slug, name]] of data.categories.entries()) await prisma.category.create({ data: { slug, name, sortOrder: i, published: true } });
  for (const [i, f] of data.faqs.entries()) await prisma.fAQ.create({ data: { question: f.q, answer: f.a, isGlobal: !!f.global, sortOrder: i } });
  for (const [k, v] of Object.entries(data.settings)) await prisma.siteSetting.upsert({ where: { key: k }, update: { value: v }, create: { key: k, value: v } });
  for (const [n, s] of data.homeSections.entries())
    await prisma.homeSection.create({ data: { type: s.type, title: s.title || null, subtitle: s.subtitle || null, body: s.body || null, config: s.config ? JSON.stringify(s.config) : null, sortOrder: n } });
  console.log("Seeded: %d categories, %d FAQ, settings, %d home sections. Add products in the admin dashboard.", data.categories.length, data.faqs.length, data.homeSections.length);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
