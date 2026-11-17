import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REVIEW_STATUSES } from "@/lib/constants";
import { saveReview, setReviewStatus, deleteReview } from "@/app/actions/admin-content";
import { PageHeader, Notice, Field, TextArea } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";

function ReviewForm({ r, products }) {
  return (
    <form action={saveReview.bind(null, r?.id ?? null)} className="grid gap-3 sm:grid-cols-2">
      <Field label="Customer name" name="name" defaultValue={r?.name} required /><Field label="Source (e.g. Facebook Review)" name="source" defaultValue={r?.source} />
      <Field label="Product" name="productId"><select id="productId" name="productId" defaultValue={r?.productId ?? ""} className="input"><option value="">— none —</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
      <Field label="Homepage group (optional)" name="group" defaultValue={r?.group} hint='e.g. "clip-fan"' />
      <Field label="Rating 1–5 (empty = none)" name="rating" type="number" min="1" max="5" defaultValue={r?.rating} />
      <Field label="Status" name="status"><select id="status" name="status" defaultValue={r?.status ?? "PENDING"} className="input">{REVIEW_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
      <div className="sm:col-span-2"><TextArea label="Review text" name="body" defaultValue={r?.body} rows={3} /></div>
      <Field label="Screenshot (optional)" name="image" type="file" accept="image/jpeg,image/png,image/webp" /><Field label="Order" name="sortOrder" type="number" min="0" defaultValue={r?.sortOrder ?? 0} />
      <button className="btn-primary px-4 py-2 sm:col-span-2">{r ? "Save review" : "Add review"}</button>
    </form>
  );
}
export default async function Reviews({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = REVIEW_STATUSES.includes(sp.status) ? sp.status : undefined;
  const [reviews, products] = await Promise.all([prisma.review.findMany({ where: status ? { status } : {}, orderBy: { createdAt: "desc" }, take: 100, include: { product: { select: { name: true } } } }), prisma.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } })]);
  return (
    <>
      <PageHeader title="Reviews" /><Notice searchParams={sp} />
      <p className="mb-4 flex gap-3 text-sm"><a href="?" className="underline">All</a>{REVIEW_STATUSES.map((s) => <a key={s} href={`?status=${s}`} className="underline">{s}</a>)}</p>
      <section className="card mb-6 p-4"><h2 className="mb-3 font-semibold">Add review</h2><p className="mb-3 text-sm text-muted">Only add reviews that real customers actually wrote and permitted. Only APPROVED reviews appear publicly.</p><ReviewForm products={products} /></section>
      <div className="space-y-3">{reviews.length === 0 && <p className="text-muted">No reviews.</p>}
        {reviews.map((r) => (<details key={r.id} className="card p-4"><summary className="cursor-pointer"><b>{r.name}</b> — {r.status} {r.product ? `· ${r.product.name}` : ""}</summary>
          <div className="mt-3 space-y-3"><div className="flex gap-2"><form action={setReviewStatus.bind(null, r.id, "APPROVED")}><button className="btn-outline px-3 py-1.5 text-sm">Approve</button></form><form action={setReviewStatus.bind(null, r.id, "REJECTED")}><button className="btn-outline px-3 py-1.5 text-sm">Reject</button></form><form action={deleteReview.bind(null, r.id)}><ConfirmButton message="Delete this review?">Delete</ConfirmButton></form></div><ReviewForm r={r} products={products} /></div></details>))}</div>
    </>
  );
}
