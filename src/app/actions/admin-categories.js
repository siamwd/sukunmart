"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { str, optStr, int, bool } from "@/lib/validation";
import { slugify, RESERVED_SLUGS } from "@/lib/utils";
import { saveImage, deleteImage } from "@/lib/uploads";
import { flash } from "@/components/admin/ui";

const LIST = "/admin-dashboard/categories";

async function slugTaken(slug, exceptCategoryId) {
  if (RESERVED_SLUGS.includes(slug)) return true;
  const [p, c] = await Promise.all([
    prisma.product.findUnique({ where: { slug }, select: { id: true } }),
    prisma.category.findUnique({ where: { slug }, select: { id: true } }),
  ]);
  return !!p || (!!c && c.id !== exceptCategoryId);
}

export async function saveCategory(id, formData) {
  await requireAdmin();
  const name = str(formData.get("name"), 100);
  const slug = slugify(formData.get("slug") || name);
  const back = id ? `${LIST}/${id}` : `${LIST}/new`;
  if (!name || !slug) redirect(flash(back, "err", "Name and slug are required."));
  if (await slugTaken(slug, id)) redirect(flash(back, "err", "That slug is reserved or already used by a product/category."));
  const data = { name, slug, description: optStr(formData.get("description"), 1000), sortOrder: int(formData.get("sortOrder") || 0, { min: 0, max: 9999 }) ?? 0, published: bool(formData.get("published")) };
  const file = formData.get("image");
  let oldImage;
  try {
    if (file && typeof file !== "string" && file.size > 0) {
      if (id) {
        const category = await prisma.category.findUnique({ where: { id }, select: { image: true } });
        oldImage = category?.image;
      }
      const path = await saveImage(file, "categories");
      data.image = path;
    }
  } catch (e) { redirect(flash(back, "err", e.message)); }
  if (id) await prisma.category.update({ where: { id }, data }); else await prisma.category.create({ data });
  if (oldImage) await deleteImage(oldImage);
  revalidatePath("/", "layout");
  redirect(flash(LIST, "ok", "Category saved."));
}

export async function deleteCategory(id) {
  await requireAdmin();
  const n = await prisma.product.count({ where: { categoryId: id } });
  if (n > 0) redirect(flash(LIST, "err", `Cannot delete: ${n} product(s) still use this category. Reassign them first.`));
  const c = await prisma.category.delete({ where: { id } });
  await deleteImage(c.image);
  revalidatePath("/", "layout");
  redirect(flash(LIST, "ok", "Category deleted."));
}
