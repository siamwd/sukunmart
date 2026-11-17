import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveCategory } from "@/app/actions/admin-categories";
import { PageHeader, Notice, Field, TextArea, Check } from "@/components/admin/ui";

export default async function CategoryForm({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const c = isNew ? null : await prisma.category.findUnique({ where: { id } });
  if (!isNew && !c) notFound();
  return (
    <>
      <PageHeader title={isNew ? "New category" : `Edit ${c.name}`} />
      <Notice searchParams={await searchParams} />
      <form action={saveCategory.bind(null, isNew ? null : id)} className="card max-w-2xl space-y-4 p-5">
        <Field label="Name" name="name" defaultValue={c?.name} required maxLength={100} />
        <Field label="Slug (URL)" name="slug" defaultValue={c?.slug} hint="Becomes /<slug>. Leave empty to generate from the name." />
        <TextArea label="Description" name="description" defaultValue={c?.description} />
        <Field label="Banner image (JPEG/PNG/WebP, max 3 MB)" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
        {c?.image && <p className="text-xs text-muted">Current: {c.image}</p>}
        <Field label="Sort order" name="sortOrder" type="number" min="0" defaultValue={c?.sortOrder ?? 0} />
        <Check label="Published" name="published" defaultChecked={c ? c.published : true} />
        <button className="btn-primary">Save category</button>
      </form>
    </>
  );
}
