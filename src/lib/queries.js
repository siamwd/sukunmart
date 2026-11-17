import { prisma } from "./prisma";

export const productCardSelect = {
  id: true, slug: true, name: true, tagline: true, badge: true, price: true, compareAtPrice: true,
  priceNote: true, stockMode: true, featuredImage: true,
};
export const listProducts = (where = {}, take) =>
  prisma.product.findMany({ where: { published: true, ...where }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: productCardSelect, ...(take ? { take } : {}) });

export const listTrending = (take = 8) =>
  prisma.product.findMany({ where: { published: true, isTrending: true, stockMode: { not: "OUT_OF_STOCK" } }, orderBy: [{ trendingOrder: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }], select: productCardSelect, take });

/** Every search term must match name, tagline, descriptions, model code or category name. */
export function searchWhere(q) {
  const terms = String(q || "").trim().split(/\s+/).filter(Boolean).slice(0, 5).map((t) => t.slice(0, 60));
  return {
    published: true,
    AND: terms.map((t) => ({ OR: [
      { name: { contains: t } }, { tagline: { contains: t } }, { shortDescription: { contains: t } },
      { description: { contains: t } }, { modelCode: { contains: t } }, { category: { name: { contains: t } } },
    ] })),
  };
}

export const getProductBySlug = (slug) =>
  prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      specs: { orderBy: { sortOrder: "asc" } },
      benefits: { orderBy: { sortOrder: "asc" } },
      orderFields: { where: { enabled: true }, orderBy: { sortOrder: "asc" } },
      faqs: { where: { published: true }, orderBy: { sortOrder: "asc" } },
      reviews: { where: { status: "APPROVED" }, orderBy: { sortOrder: "asc" } },
    },
  });
