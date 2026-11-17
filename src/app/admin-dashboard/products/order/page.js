import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { saveProductOrder } from "@/app/actions/admin-products";
import { PageHeader, Notice } from "@/components/admin/ui";

// Static segment: takes precedence over products/[id].
export default async function ProductOrder({ searchParams }) {
  await requireAdmin();
  const products = await prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], include: { category: { select: { name: true } } } });
  return (
    <>
      <PageHeader title="Product order & trending"><Link href="/admin-dashboard/products" className="btn-outline px-3 py-1.5 text-sm">Back to products</Link></PageHeader>
      <Notice searchParams={await searchParams} />
      <p className="mb-4 max-w-3xl text-sm text-muted"><b>Position</b> decides where a product appears in “All products”, category pages and search. <b>Trending</b> products appear in the Trending Products section, ordered by <b>Trending position</b>. Lower number = shown first (1 is the first). Equal numbers: the newer product comes first.</p>
      <form action={saveProductOrder}>
        <div className="card overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface"><tr><th className="p-3">Product</th><th>Price</th><th>Status</th><th>Position</th><th>Trending</th><th>Trending position</th></tr></thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted">No products yet.</td></tr>}
            {products.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="p-3"><Link href={`/admin-dashboard/products/${p.id}`} className="font-medium text-brand underline">{p.name}</Link><br /><span className="text-xs text-muted">{p.category?.name || "No category"}</span></td>
                <td>{formatBDT(p.price)}</td><td>{p.published ? "Published" : "Draft"}</td>
                <td><input name={`pos_${p.id}`} type="number" min="0" max="9999" defaultValue={p.sortOrder} aria-label={`Position of ${p.name}`} className="input w-24" /></td>
                <td><input name={`tr_${p.id}`} type="checkbox" defaultChecked={p.isTrending} aria-label={`${p.name} is trending`} /></td>
                <td><input name={`tp_${p.id}`} type="number" min="0" max="9999" defaultValue={p.trendingOrder} aria-label={`Trending position of ${p.name}`} className="input w-24" /></td>
              </tr>))}
          </tbody></table></div>
        <button className="btn-primary mt-4">Save positions</button>
      </form>
    </>
  );
}
