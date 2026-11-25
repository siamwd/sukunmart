import { cache } from "react";
import { prisma } from "./prisma";

export const SETTING_DEFAULTS = {
  siteName: "TRENDORA MART",
  tagline: "For Easy Living",
  footerText: "",
  contactPhone: "",
  contactEmail: "",
  address: "",
  facebookUrl: "",
  whatsappUrl: "",
  messengerUrl: "",
  deliveryInfo: "",
  seoTitle: "Trendora Mart",
  seoDescription: "",
  logo: "",
  announcement: "",
  termsContent: "",
  privacyContent: "",
};

export const getSettings = cache(async () => {
  const rows = await prisma.siteSetting.findMany();
  const out = { ...SETTING_DEFAULTS };
  for (const r of rows) out[r.key] = r.value;
  return out;
});

export async function saveSettings(values) {
  const ops = Object.keys(SETTING_DEFAULTS)
    .filter((k) => k in values)
    .map((k) => prisma.siteSetting.upsert({ where: { key: k }, update: { value: String(values[k]) }, create: { key: k, value: String(values[k]) } }));
  await prisma.$transaction(ops);
}
