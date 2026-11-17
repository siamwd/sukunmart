"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { str, optStr, int, optInt, bool, validateFieldDef } from "@/lib/validation";
import { slugify, RESERVED_SLUGS } from "@/lib/utils";
import { STOCK_MODES, VARIANT_TYPES, FIELD_TYPES } from "@/lib/constants";
import { saveImage, deleteImage } from "@/lib/uploads";
import { flash } from "@/components/admin/ui";

const LIST = "/admin-dashboard/products";
const edit = (id) => `${LIST}/${id}`;
const done = (id, msg) => { revalidatePath("/", "layout"); redirect(flash(edit(id), "ok", msg)); };
const fail = (id, msg) => redirect(flash(id === "new" ? `${LIST}/new` : edit(id), "err", msg));

async function slugTaken(slug, exceptProductId) {
  if (RESERVED_SLUGS.includes(slug)) return true;
  const [p, c] = await Promise.all([prisma.product.findUnique({ where: { slug }, select: { id: true } }), prisma.category.findUnique({ where: { slug }, select: { id: true } })]);
  return !!c || (!!p && p.id !== exceptProductId);
}

export async function saveProduct(id, formData) {
  await requireAdmin();
  const key = id || "new";
  const name = str(formData.get("name"), 150);
  const slug = slugify(formData.get("slug") || name);
  const price = int(formData.get("price"), { min: 0, max: 10_000_000 });
  if (!name || !slug) fail(key, "Name and slug are required.");
  if (price === null) fail(key, "Price must be a whole number (BDT).");
  if (await slugTaken(slug, id)) fail(key, "That slug is reserved or already used.");
  const compareAtPrice = optInt(formData.get("compareAtPrice"), { min: 0, max: 10_000_000 });
  if (formData.get("compareAtPrice") && compareAtPrice === null) fail(key, "Original price must be a whole number.");
  const stockMode = String(formData.get("stockMode"));
  if (!STOCK_MODES.includes(stockMode)) fail(key, "Invalid stock mode.");
  const minQty = int(formData.get("minQty") || 1, { min: 1, max: 1000 }), maxQty = int(formData.get("maxQty") || 10, { min: 1, max: 1000 });
  if (minQty === null || maxQty === null || maxQty < minQty) fail(key, "Quantity limits are invalid.");
  const stockQty = optInt(formData.get("stockQty"), { min: 0, max: 1_000_000 });
  if (stockMode === "TRACKED" && stockQty === null) fail(key, "Enter a stock quantity for tracked stock.");
  const categoryId = optStr(formData.get("categoryId"), 40);
  if (categoryId && !(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) fail(key, "Unknown category.");
  const advanceRequired = bool(formData.get("advanceRequired"));
  const advanceAmount = optInt(formData.get("advanceAmount"), { min: 0, max: 10_000_000 });
  const deliveryCharge = optInt(formData.get("deliveryCharge"), { min: 0, max: 100000 });
  const data = {
    name, slug, price, compareAtPrice, stockMode, stockQty, minQty, maxQty, categoryId, advanceRequired, advanceAmount, deliveryCharge,
    modelCode: optStr(formData.get("modelCode"), 60), badge: optStr(formData.get("badge"), 60), tagline: optStr(formData.get("tagline"), 200),
    shortDescription: optStr(formData.get("shortDescription"), 600), description: optStr(formData.get("description"), 8000),
    priceNote: optStr(formData.get("priceNote"), 200), deliveryNote: optStr(formData.get("deliveryNote"), 400),
    orderInstructions: optStr(formData.get("orderInstructions"), 800), importantNotes: optStr(formData.get("importantNotes"), 2000),
    seoTitle: optStr(formData.get("seoTitle"), 120), seoDescription: optStr(formData.get("seoDescription"), 300),
    sortOrder: int(formData.get("sortOrder") || 0, { min: 0, max: 9999 }) ?? 0, published: bool(formData.get("published")),
    isTrending: bool(formData.get("isTrending")), trendingOrder: int(formData.get("trendingOrder") || 0, { min: 0, max: 9999 }) ?? 0,
  };
  if (id) { await prisma.product.update({ where: { id }, data }); return done(id, "Product saved."); }
  const p = await prisma.product.create({ data: { ...data, orderFields: { create: [
    { key: "customerName", label: "Name", type: "text", required: true, sortOrder: 0 },
    { key: "customerPhone", label: "Mobile number", type: "tel", required: true, sortOrder: 1 },
    { key: "customerAddress", label: "Delivery address", type: "textarea", required: true, sortOrder: 2 },
    { key: "notes", label: "Notes (optional)", type: "textarea", required: false, sortOrder: 3 },
  ] } } });
  return done(p.id, "Product created. Add images, variants and details below.");
}

export async function deleteProduct(id) {
  await requireAdmin();
  const imgs = await prisma.productImage.findMany({ where: { productId: id }, select: { path: true } });
  const p = await prisma.product.delete({ where: { id } }); // past orders keep their snapshot (FK SetNull)
  await Promise.all([...imgs.map((i) => deleteImage(i.path)), deleteImage(p.featuredImage)]);
  revalidatePath("/", "layout");
  redirect(flash(LIST, "ok", "Product deleted. Existing orders keep their saved details."));
}

export async function uploadImages(id, formData) {
  await requireAdmin();
  const files = formData.getAll("images").filter((f) => typeof f !== "string" && f.size > 0).slice(0, 10);
  if (!files.length) fail(id, "Choose at least one image.");
  const max = await prisma.productImage.aggregate({ where: { productId: id }, _max: { sortOrder: true } });
  let n = (max._max.sortOrder ?? -1) + 1;
  try {
    for (const f of files) { const path = await saveImage(f, "products"); await prisma.productImage.create({ data: { productId: id, path, alt: optStr(formData.get("alt"), 150), sortOrder: n++ } }); }
  } catch (e) { fail(id, e.message); }
  const p = await prisma.product.findUnique({ where: { id }, select: { featuredImage: true } });
  if (!p.featuredImage) { const first = await prisma.productImage.findFirst({ where: { productId: id }, orderBy: { sortOrder: "asc" } }); await prisma.product.update({ where: { id }, data: { featuredImage: first.path } }); }
  done(id, "Images uploaded.");
}

export async function setFeaturedImage(id, imageId) {
  await requireAdmin();
  const img = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!img) fail(id, "Image not found.");
  await prisma.product.update({ where: { id }, data: { featuredImage: img.path } });
  done(id, "Featured image set.");
}

export async function deleteImageAction(id, imageId) {
  await requireAdmin();
  const img = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
  if (!img) fail(id, "Image not found.");
  await prisma.productImage.delete({ where: { id: imageId } });
  const p = await prisma.product.findUnique({ where: { id }, select: { featuredImage: true } });
  if (p.featuredImage === img.path) {
    const next = await prisma.productImage.findFirst({ where: { productId: id }, orderBy: { sortOrder: "asc" } });
    await prisma.product.update({ where: { id }, data: { featuredImage: next?.path ?? null } });
  }
  await deleteImage(img.path);
  done(id, "Image deleted.");
}

export async function addVariant(id, formData) {
  await requireAdmin();
  const type = String(formData.get("type")), label = str(formData.get("label"), 60);
  if (!VARIANT_TYPES.includes(type) || !label) fail(id, "Variant type and label are required.");
  const delta = int(formData.get("priceDelta") || 0, { min: -1_000_000, max: 1_000_000 });
  if (delta === null) fail(id, "Price change must be a whole number.");
  try { await prisma.productVariant.create({ data: { productId: id, type, label, priceDelta: delta, stockQty: optInt(formData.get("stockQty"), { min: 0, max: 1_000_000 }), sortOrder: int(formData.get("sortOrder") || 0, { min: 0, max: 999 }) ?? 0 } }); }
  catch (e) { if (e.code === "P2002") fail(id, "That variant already exists."); throw e; }
  done(id, "Variant added.");
}
export async function updateVariant(id, variantId, formData) {
  await requireAdmin();
  const delta = int(formData.get("priceDelta") || 0, { min: -1_000_000, max: 1_000_000 });
  if (delta === null) fail(id, "Price change must be a whole number.");
  await prisma.productVariant.updateMany({ where: { id: variantId, productId: id }, data: { priceDelta: delta, stockQty: optInt(formData.get("stockQty"), { min: 0, max: 1_000_000 }), available: bool(formData.get("available")), sortOrder: int(formData.get("sortOrder") || 0, { min: 0, max: 999 }) ?? 0 } });
  done(id, "Variant saved.");
}
export async function deleteVariant(id, variantId) { await requireAdmin(); await prisma.productVariant.deleteMany({ where: { id: variantId, productId: id } }); done(id, "Variant deleted."); }

// One line per item. Specs: "Label | Value". Benefits: "Title | Optional text".
function lines(v) { return String(v || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 60); }
export async function saveSpecs(id, formData) {
  await requireAdmin();
  const rows = lines(formData.get("specs")).map((l, i) => { const [a, ...b] = l.split("|"); return { productId: id, label: str(a, 100), value: str(b.join("|"), 400), sortOrder: i }; });
  if (rows.some((r) => !r.label || !r.value)) fail(id, 'Each spec line must look like "Label | Value".');
  await prisma.$transaction([prisma.productSpec.deleteMany({ where: { productId: id } }), prisma.productSpec.createMany({ data: rows })]);
  done(id, "Specifications saved.");
}
export async function saveBenefits(id, formData) {
  await requireAdmin();
  const rows = lines(formData.get("benefits")).map((l, i) => { const [a, ...b] = l.split("|"); return { productId: id, title: str(a, 150), text: optStr(b.join("|"), 500), sortOrder: i }; });
  if (rows.some((r) => !r.title)) fail(id, "Each benefit needs a title.");
  await prisma.$transaction([prisma.productBenefit.deleteMany({ where: { productId: id } }), prisma.productBenefit.createMany({ data: rows })]);
  done(id, "Benefits saved.");
}

function fieldData(formData) {
  const type = String(formData.get("type"));
  const options = type === "select" ? JSON.stringify(String(formData.get("options") || "").split(/[\n,]/).map((o) => str(o, 100)).filter(Boolean).slice(0, 40)) : null;
  return { key: str(formData.get("key"), 41), label: str(formData.get("label"), 100), type, required: bool(formData.get("required")), enabled: bool(formData.get("enabled")), options,
    placeholder: optStr(formData.get("placeholder"), 100), helpText: optStr(formData.get("helpText"), 200), sortOrder: int(formData.get("sortOrder") || 0, { min: 0, max: 999 }) ?? 0 };
}
export async function addOrderField(id, formData) {
  await requireAdmin();
  const d = fieldData(formData);
  const errs = validateFieldDef(d); if (!FIELD_TYPES.includes(d.type)) errs.push("Invalid type.");
  if (d.type === "select" && JSON.parse(d.options).length < 1) errs.push("Select fields need at least one option.");
  if (errs.length) fail(id, errs[0]);
  try { await prisma.orderFormField.create({ data: { ...d, productId: id } }); } catch (e) { if (e.code === "P2002") fail(id, "A field with that key already exists."); throw e; }
  done(id, "Order field added.");
}
export async function updateOrderField(id, fieldId, formData) {
  await requireAdmin();
  const { key, ...d } = fieldData(formData); // key is immutable (orders reference it)
  if (!d.label) fail(id, "Label is required.");
  await prisma.orderFormField.updateMany({ where: { id: fieldId, productId: id }, data: d });
  done(id, "Order field saved.");
}
export async function deleteOrderField(id, fieldId) { await requireAdmin(); await prisma.orderFormField.deleteMany({ where: { id: fieldId, productId: id } }); done(id, "Order field deleted."); }

/** Bulk positions: "All products" order and Trending flag/order, saved atomically. Lower number = shown first. */
export async function saveProductOrder(formData) {
  await requireAdmin();
  const back = `${LIST}/order`;
  const prods = await prisma.product.findMany({ select: { id: true } });
  const ops = [];
  for (const { id } of prods) {
    const pos = int(formData.get(`pos_${id}`) || 0, { min: 0, max: 9999 }), tp = int(formData.get(`tp_${id}`) || 0, { min: 0, max: 9999 });
    if (pos === null || tp === null) redirect(flash(back, "err", "Positions must be whole numbers from 0 to 9999."));
    ops.push(prisma.product.update({ where: { id }, data: { sortOrder: pos, isTrending: bool(formData.get(`tr_${id}`)), trendingOrder: tp } }));
  }
  await prisma.$transaction(ops);
  revalidatePath("/", "layout");
  redirect(flash(back, "ok", "Product positions saved."));
}
