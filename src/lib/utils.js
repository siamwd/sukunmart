const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const toBn = (v) => String(v).replace(/\d/g, (d) => BN[d]);

/** ৳১,৪৯৯ — Bangla digits to match the original site. */
export function formatBDT(n) {
  if (n === null || n === undefined) return "";
  return "৳" + toBn(Number(n).toLocaleString("en-US"));
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function slugify(s) {
  return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function parseJSON(text, fallback) {
  if (!text) return fallback;
  try { return JSON.parse(text); } catch { return fallback; }
}

export const cn = (...c) => c.filter(Boolean).join(" ");

/** Reserved top-level paths that a product/category slug must not use. */
export const RESERVED_SLUGS = [
  "admin-dashboard", "admin-login", "api", "terms", "privacy-policy", "order-confirmation",
  "_next", "search", "sitemap.xml", "robots.txt", "uploads",
];
