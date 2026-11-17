import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STOCK_MODES, STOCK_MODE_LABELS, FIELD_TYPES, VARIANT_TYPES } from "@/lib/constants";
import * as A from "@/app/actions/admin-products";
import { PageHeader, Notice, Field, TextArea, Check } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";

export default async function ProductEditor({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const [p, cats] = await Promise.all([
    isNew ? null : prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: [{ type: "asc" }, { sortOrder: "asc" }] }, specs: { orderBy: { sortOrder: "asc" } }, benefits: { orderBy: { sortOrder: "asc" } }, orderFields: { orderBy: { sortOrder: "asc" } } } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!isNew && !p) notFound();
  const sp = await searchParams;
  const sel = (name, val, opts, label) => <Field label={label} name={name}><select id={name} name={name} defaultValue={val} className="input">{opts}</select></Field>;
  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader title={isNew ? "New product" : p.name}>
        {!isNew && p.published && <Link href={`/${p.slug}`} target="_blank" className="btn-outline px-3 py-1.5 text-sm">View live</Link>}
        {!isNew && <form action={A.deleteProduct.bind(null, id)}><ConfirmButton message={`Delete "${p.name}"? Past orders keep their saved details.`}>Delete</ConfirmButton></form>}
      </PageHeader>
      <Notice searchParams={sp} />

      <form action={A.saveProduct.bind(null, isNew ? null : id)} className="card grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Details</h2>
        <Field label="Name" name="name" defaultValue={p?.name} required /><Field label="Slug (URL: /slug)" name="slug" defaultValue={p?.slug} hint="Empty = from name" />
        <Field label="Price (BDT)" name="price" type="number" min="0" defaultValue={p?.price} required /><Field label="Original price (struck through)" name="compareAtPrice" type="number" min="0" defaultValue={p?.compareAtPrice} hint="Leave empty if none" />
        <Field label="Price note" name="priceNote" defaultValue={p?.priceNote} /><Field label="Badge" name="badge" defaultValue={p?.badge} />
        <Field label="Model code" name="modelCode" defaultValue={p?.modelCode} /><Field label="Tagline" name="tagline" defaultValue={p?.tagline} />
        {sel("categoryId", p?.categoryId ?? "", <><option value="">— none —</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</>, "Category")}
        <Field label="Position in All products (1 = first)" name="sortOrder" type="number" min="0" defaultValue={p?.sortOrder ?? 0} hint="Also used on category pages and search. Same number: newer first." />
        <Check label="Show in Trending Products" name="isTrending" defaultChecked={p?.isTrending} /><Field label="Trending position (1 = first)" name="trendingOrder" type="number" min="0" defaultValue={p?.trendingOrder ?? 0} />
        <div className="sm:col-span-2"><TextArea label="Short description" name="shortDescription" defaultValue={p?.shortDescription} rows={2} /></div>
        <div className="sm:col-span-2"><TextArea label="Description" name="description" defaultValue={p?.description} rows={5} /></div>
        <div className="sm:col-span-2"><TextArea label="Important notes (one per line)" name="importantNotes" defaultValue={p?.importantNotes} rows={3} /></div>
        {sel("stockMode", p?.stockMode ?? "UNLIMITED", STOCK_MODES.map((m) => <option key={m} value={m}>{STOCK_MODE_LABELS[m]}</option>), "Availability")}
        <Field label="Stock quantity (tracked only)" name="stockQty" type="number" min="0" defaultValue={p?.stockQty} />
        <Field label="Min quantity" name="minQty" type="number" min="1" defaultValue={p?.minQty ?? 1} /><Field label="Max quantity" name="maxQty" type="number" min="1" defaultValue={p?.maxQty ?? 10} />
        <Field label="Delivery charge (BDT)" name="deliveryCharge" type="number" min="0" defaultValue={p?.deliveryCharge} hint="Empty = confirmed with customer after ordering" /><Field label="Delivery note" name="deliveryNote" defaultValue={p?.deliveryNote} />
        <div className="sm:col-span-2"><TextArea label="Order form instructions" name="orderInstructions" defaultValue={p?.orderInstructions} rows={2} /></div>
        <Check label="Advance payment required" name="advanceRequired" defaultChecked={p?.advanceRequired} /><Field label="Advance amount (BDT)" name="advanceAmount" type="number" min="0" defaultValue={p?.advanceAmount} />
        <Field label="SEO title" name="seoTitle" defaultValue={p?.seoTitle} /><Field label="SEO description" name="seoDescription" defaultValue={p?.seoDescription} />
        <div className="sm:col-span-2 flex items-center gap-6"><Check label="Published" name="published" defaultChecked={p?.published} /><button className="btn-primary">{isNew ? "Create product" : "Save details"}</button></div>
      </form>

      {!isNew && (<>
        <section className="card space-y-4 p-5"><h2 className="font-semibold">Images</h2>
          {p.images.length === 0 ? <p className="text-sm text-muted">No images yet.</p> : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">{p.images.map((im) => (
              <li key={im.id} className="space-y-2"><div className="relative aspect-square overflow-hidden rounded-btn bg-surface"><Image src={im.path} alt={im.alt || p.name} fill sizes="200px" className="object-cover" /></div>
                {p.featuredImage === im.path ? <p className="text-xs font-semibold text-brand">Featured</p> : <form action={A.setFeaturedImage.bind(null, id, im.id)}><button className="text-xs underline">Set featured</button></form>}
                <form action={A.deleteImageAction.bind(null, id, im.id)}><ConfirmButton message="Delete this image?" className="text-xs text-danger underline">Delete</ConfirmButton></form></li>))}</ul>)}
          <form action={A.uploadImages.bind(null, id)} className="flex flex-wrap items-end gap-3"><Field label="Add images (JPEG/PNG/WebP, max 3 MB each)" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple /><Field label="Alt text" name="alt" /><button className="btn-outline">Upload</button></form></section>

        <section className="card space-y-3 p-5"><h2 className="font-semibold">Variants (colors / sizes)</h2>
          {p.variants.map((v) => (<div key={v.id} className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
            <form action={A.updateVariant.bind(null, id, v.id)} className="flex flex-wrap items-end gap-2"><p className="w-40 text-sm"><b>{v.label}</b> <span className="text-muted">({v.type})</span></p>
              <Field label="Price +/-" name="priceDelta" type="number" defaultValue={v.priceDelta} className="input w-24" /><Field label="Stock" name="stockQty" type="number" min="0" defaultValue={v.stockQty} className="input w-24" /><Field label="Order" name="sortOrder" type="number" defaultValue={v.sortOrder} className="input w-20" />
              <Check label="Available" name="available" defaultChecked={v.available} /><button className="btn-outline px-3 py-1.5 text-sm">Save</button></form>
            <form action={A.deleteVariant.bind(null, id, v.id)}><ConfirmButton message={`Delete variant ${v.label}?`}>Delete</ConfirmButton></form></div>))}
          <form action={A.addVariant.bind(null, id)} className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
            {sel("type", "color", VARIANT_TYPES.map((t) => <option key={t}>{t}</option>), "Type")}<Field label="Label" name="label" required /><Field label="Price +/-" name="priceDelta" type="number" defaultValue="0" className="input w-24" /><Field label="Stock" name="stockQty" type="number" min="0" className="input w-24" /><button className="btn-primary">Add variant</button></form></section>

        <form action={A.saveBenefits.bind(null, id)} className="card space-y-3 p-5"><h2 className="font-semibold">Benefits</h2><TextArea label='One per line: "Title | optional text"' name="benefits" rows={6} defaultValue={p.benefits.map((b) => (b.text ? `${b.title} | ${b.text}` : b.title)).join("\n")} /><button className="btn-outline">Save benefits</button></form>
        <form action={A.saveSpecs.bind(null, id)} className="card space-y-3 p-5"><h2 className="font-semibold">Specifications</h2><TextArea label='One per line: "Label | Value"' name="specs" rows={6} defaultValue={p.specs.map((s) => `${s.label} | ${s.value}`).join("\n")} /><button className="btn-outline">Save specifications</button></form>

        <section className="card space-y-3 p-5"><h2 className="font-semibold">Order form fields</h2><p className="text-sm text-muted">Customers fill these on the product page. Keep customerName and customerPhone so staff can reach the customer. Keys cannot be changed after creation.</p>
          {p.orderFields.map((f) => (<div key={f.id} className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
            <form action={A.updateOrderField.bind(null, id, f.id)} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="type" value={f.type} /><p className="w-32 text-xs text-muted">{f.key}<br />{f.type}</p>
              <Field label="Label" name="label" defaultValue={f.label} required /><Field label="Order" name="sortOrder" type="number" defaultValue={f.sortOrder} className="input w-20" />
              {f.type === "select" && <Field label="Options (comma separated)" name="options" defaultValue={JSON.parse(f.options || "[]").join(", ")} />}
              <Check label="Required" name="required" defaultChecked={f.required} /><Check label="Enabled" name="enabled" defaultChecked={f.enabled} /><button className="btn-outline px-3 py-1.5 text-sm">Save</button></form>
            <form action={A.deleteOrderField.bind(null, id, f.id)}><ConfirmButton message={`Delete field ${f.label}?`}>Delete</ConfirmButton></form></div>))}
          <form action={A.addOrderField.bind(null, id)} className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
            <Field label="Key" name="key" required placeholder="district" /><Field label="Label" name="label" required />{sel("type", "text", FIELD_TYPES.map((t) => <option key={t}>{t}</option>), "Type")}
            <Field label="Options (select only, comma separated)" name="options" /><Check label="Required" name="required" /><Check label="Enabled" name="enabled" defaultChecked /><button className="btn-primary">Add field</button></form></section>
      </>)}
    </div>
  );
}
