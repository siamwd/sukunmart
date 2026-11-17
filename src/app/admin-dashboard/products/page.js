import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { STOCK_MODE_LABELS } from "@/lib/constants";
import { PageHeader, Notice, Pager } from "@/components/admin/ui";

const PAGE = 20;
export default async function Products({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page) || 1);
  const [total, products] = await Promise.all([prisma.product.count(), prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], skip: (page - 1) * PAGE, take: PAGE, include: { category: { select: { name: true } } } })]);
  return (
    <>
      <PageHeader title="Products"><Link href="/admin-dashboard/products/order" className="btn-outline px-4 py-2 text-sm">Order & trending</Link><Link href="/admin-dashboard/products/new" className="btn-primary px-4 py-2 text-sm">New product</Link></PageHeader>
      <Notice searchParams={sp} />
      <div className="card overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-surface"><tr><th className="p-3">Name</th><th>URL</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
        <tbody>{products.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted">No products yet.</td></tr>}
          {products.map((p) => (<tr key={p.id} className="border-t border-line"><td className="p-3"><Link href={`/admin-dashboard/products/${p.id}`} className="font-medium text-brand underline">{p.name}</Link></td><td>/{p.slug}</td><td>{p.category?.name || "—"}</td><td>{formatBDT(p.price)}</td><td>{STOCK_MODE_LABELS[p.stockMode]}{p.stockMode === "TRACKED" ? ` (${p.stockQty})` : ""}</td><td>{p.published ? "Published" : "Draft"}</td></tr>))}</tbody></table></div>
      <Pager base="/admin-dashboard/products" page={page} pages={Math.ceil(total / PAGE)} />
    </>
  );
}
