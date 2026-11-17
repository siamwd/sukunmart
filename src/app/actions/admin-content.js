"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { str, optStr, int, bool } from "@/lib/validation";
import { saveImage, deleteImage } from "@/lib/uploads";
import { saveSettings, SETTING_DEFAULTS } from "@/lib/settings";
import { REVIEW_STATUSES, BANNER_PLACEMENTS, HOME_SECTION_TYPES } from "@/lib/constants";
import { flash } from "@/components/admin/ui";

const back = (path, ok, err) => { revalidatePath("/", "layout"); redirect(err ? flash(path, "err", err) : flash(path, "ok", ok)); };
const order = (v) => int(v || 0, { min: 0, max: 9999 }) ?? 0;
const file = (fd, k) => { const f = fd.get(k); return f && typeof f !== "string" && f.size > 0 ? f : null; };

/* ---------- FAQs ---------- */
export async function saveFaq(id, fd) {
  await requireAdmin();
  const question = str(fd.get("question"), 300), answer = str(fd.get("answer"), 3000);
  if (!question || !answer) back("/admin-dashboard/faqs", null, "Question and answer are required.");
  const ids = fd.getAll("products").map(String);
  const valid = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true } });
  const data = { question, answer, isGlobal: bool(fd.get("isGlobal")), published: bool(fd.get("published")), sortOrder: order(fd.get("sortOrder")), products: { set: valid } };
  if (id) await prisma.fAQ.update({ where: { id }, data }); else await prisma.fAQ.create({ data: { ...data, products: { connect: valid } } });
  back("/admin-dashboard/faqs", "FAQ saved.");
}
export async function deleteFaq(id) { await requireAdmin(); await prisma.fAQ.delete({ where: { id } }); back("/admin-dashboard/faqs", "FAQ deleted."); }

/* ---------- Reviews ---------- */
export async function saveReview(id, fd) {
  await requireAdmin();
  const name = str(fd.get("name"), 100), status = String(fd.get("status"));
  const rating = fd.get("rating") ? int(fd.get("rating"), { min: 1, max: 5 }) : null;
  if (!name || !REVIEW_STATUSES.includes(status) || (fd.get("rating") && rating === null)) back("/admin-dashboard/reviews", null, "Name, status and a rating of 1–5 (or empty) are required.");
  const productId = optStr(fd.get("productId"), 40);
  const data = { name, status, rating, productId, group: optStr(fd.get("group"), 60), source: optStr(fd.get("source"), 100), body: optStr(fd.get("body"), 2000), sortOrder: order(fd.get("sortOrder")) };
  try { const f = file(fd, "image"); if (f) data.imagePath = await saveImage(f, "reviews"); } catch (e) { back("/admin-dashboard/reviews", null, e.message); }
  if (id) await prisma.review.update({ where: { id }, data }); else await prisma.review.create({ data });
  back("/admin-dashboard/reviews", "Review saved.");
}
export async function setReviewStatus(id, status) { await requireAdmin(); if (!REVIEW_STATUSES.includes(status)) return; await prisma.review.update({ where: { id }, data: { status } }); back("/admin-dashboard/reviews", `Review ${status.toLowerCase()}.`); }
export async function deleteReview(id) { await requireAdmin(); const r = await prisma.review.delete({ where: { id } }); await deleteImage(r.imagePath); back("/admin-dashboard/reviews", "Review deleted."); }

/* ---------- Homepage sections & banners ---------- */
export async function saveSection(id, fd) {
  await requireAdmin();
  const type = String(fd.get("type"));
  if (!HOME_SECTION_TYPES.includes(type)) back("/admin-dashboard/homepage", null, "Invalid section type.");
  const cfg = optStr(fd.get("config"), 4000);
  if (cfg) { try { JSON.parse(cfg); } catch { back("/admin-dashboard/homepage", null, "Config must be valid JSON."); } }
  const data = { type, title: optStr(fd.get("title"), 200), subtitle: optStr(fd.get("subtitle"), 300), body: optStr(fd.get("body"), 2000), config: cfg, visible: bool(fd.get("visible")), sortOrder: order(fd.get("sortOrder")) };
  if (id) await prisma.homeSection.update({ where: { id }, data }); else await prisma.homeSection.create({ data });
  back("/admin-dashboard/homepage", "Section saved.");
}
export async function deleteSection(id) { await requireAdmin(); await prisma.homeSection.delete({ where: { id } }); back("/admin-dashboard/homepage", "Section deleted."); }

export async function saveBanner(id, fd) {
  await requireAdmin();
  const placement = String(fd.get("placement"));
  if (!BANNER_PLACEMENTS.includes(placement)) back("/admin-dashboard/homepage", null, "Invalid placement.");
  const href = optStr(fd.get("ctaHref"), 300);
  if (href && !/^(\/|https:\/\/)/.test(href)) back("/admin-dashboard/homepage", null, "Link must start with / or https://");
  const data = { placement, title: optStr(fd.get("title"), 200), subtitle: optStr(fd.get("subtitle"), 300), ctaLabel: optStr(fd.get("ctaLabel"), 60), ctaHref: href, published: bool(fd.get("published")), sortOrder: order(fd.get("sortOrder")) };
  try { const f = file(fd, "image"); if (f) data.image = await saveImage(f, "banners"); } catch (e) { back("/admin-dashboard/homepage", null, e.message); }
  if (id) await prisma.banner.update({ where: { id }, data }); else await prisma.banner.create({ data });
  back("/admin-dashboard/homepage", "Banner saved.");
}
export async function deleteBanner(id) { await requireAdmin(); const b = await prisma.banner.delete({ where: { id } }); await deleteImage(b.image); back("/admin-dashboard/homepage", "Banner deleted."); }

/* ---------- Settings ---------- */
export async function saveSiteSettings(fd) {
  await requireAdmin();
  const values = {};
  for (const k of Object.keys(SETTING_DEFAULTS)) if (k !== "logo" && fd.has(k)) values[k] = str(fd.get(k), k.endsWith("Content") ? 30000 : 500);
  for (const k of ["facebookUrl", "whatsappUrl", "messengerUrl"]) if (values[k] && !/^https:\/\//.test(values[k])) back("/admin-dashboard/settings", null, `${k} must start with https://`);
  try { const f = file(fd, "logo"); if (f) values.logo = await saveImage(f, "site"); } catch (e) { back("/admin-dashboard/settings", null, e.message); }
  await saveSettings(values);
  back("/admin-dashboard/settings", "Settings saved.");
}

/* ---------- Hero slides (multiple images, rotate automatically) ---------- */
const HERO = "/admin-dashboard/homepage";
export async function addHeroSlides(fd) {
  await requireAdmin();
  const files = fd.getAll("images").filter((f) => typeof f !== "string" && f.size > 0).slice(0, 8);
  if (!files.length) back(HERO, null, "Choose at least one image.");
  const count = await prisma.banner.count({ where: { placement: "HOME_HERO" } });
  if (count + files.length > 10) back(HERO, null, "A maximum of 10 hero images is allowed.");
  const max = await prisma.banner.aggregate({ where: { placement: "HOME_HERO" }, _max: { sortOrder: true } });
  let n = (max._max.sortOrder ?? -1) + 1;
  try { for (const f of files) { const image = await saveImage(f, "banners"); await prisma.banner.create({ data: { placement: "HOME_HERO", image, title: optStr(fd.get("alt"), 150), published: true, sortOrder: n++ } }); } }
  catch (e) { back(HERO, null, e.message); }
  back(HERO, `${files.length} hero image(s) added.`);
}
export async function updateHeroSlide(id, fd) {
  await requireAdmin();
  await prisma.banner.updateMany({ where: { id, placement: "HOME_HERO" }, data: { title: optStr(fd.get("alt"), 150), sortOrder: order(fd.get("sortOrder")), published: bool(fd.get("published")) } });
  back(HERO, "Hero image saved.");
}
export async function deleteHeroSlide(id) {
  await requireAdmin();
  const b = await prisma.banner.findFirst({ where: { id, placement: "HOME_HERO" } });
  if (b) { await prisma.banner.delete({ where: { id } }); await deleteImage(b.image); }
  back(HERO, "Hero image deleted.");
}
