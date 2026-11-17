import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveFaq, deleteFaq } from "@/app/actions/admin-content";
import { PageHeader, Notice, Field, TextArea, Check } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";

function FaqForm({ faq, products }) {
  const linked = new Set((faq?.products || []).map((p) => p.id));
  return (
    <form action={saveFaq.bind(null, faq?.id ?? null)} className="space-y-3">
      <Field label="Question" name="question" defaultValue={faq?.question} required /><TextArea label="Answer" name="answer" defaultValue={faq?.answer} rows={3} />
      <fieldset><legend className="label">Show on product pages</legend><div className="flex flex-wrap gap-x-4 gap-y-1">{products.map((p) => <label key={p.id} className="flex items-center gap-1 text-sm"><input type="checkbox" name="products" value={p.id} defaultChecked={linked.has(p.id)} />{p.name}</label>)}</div></fieldset>
      <div className="flex flex-wrap items-end gap-4"><Check label="Show on homepage" name="isGlobal" defaultChecked={faq?.isGlobal} /><Check label="Published" name="published" defaultChecked={faq ? faq.published : true} /><Field label="Order" name="sortOrder" type="number" min="0" defaultValue={faq?.sortOrder ?? 0} className="input w-24" /><button className="btn-primary px-4 py-2">{faq ? "Save" : "Add FAQ"}</button></div>
    </form>
  );
}
export default async function Faqs({ searchParams }) {
  await requireAdmin();
  const [faqs, products] = await Promise.all([prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" }, include: { products: { select: { id: true } } } }), prisma.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } })]);
  return (
    <>
      <PageHeader title="FAQs" /><Notice searchParams={await searchParams} />
      <section className="card mb-6 p-4"><h2 className="mb-3 font-semibold">New FAQ</h2><FaqForm products={products} /></section>
      <div className="space-y-4">{faqs.length === 0 && <p className="text-muted">No FAQs yet.</p>}
        {faqs.map((f) => (<details key={f.id} className="card p-4"><summary className="cursor-pointer font-medium">{f.question} {!f.published && <span className="text-xs text-muted">(hidden)</span>}</summary>
          <div className="mt-3"><FaqForm faq={f} products={products} /><form action={deleteFaq.bind(null, f.id)} className="mt-2"><ConfirmButton message="Delete this FAQ?">Delete</ConfirmButton></form></div></details>))}</div>
    </>
  );
}
