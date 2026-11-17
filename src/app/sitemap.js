import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/utils";
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const [products, cats] = await Promise.all([
    prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const u = siteUrl();
  return [
    { url: u }, { url: `${u}/terms` }, { url: `${u}/privacy-policy` },
    ...cats.map((c) => ({ url: `${u}/${c.slug}`, lastModified: c.updatedAt })),
    ...products.map((p) => ({ url: `${u}/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
