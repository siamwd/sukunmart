import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatBDT } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui";

export default async function Overview() {
  await requireAdmin();
  const [byStatus, sales, recent, best] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true } }),
    prisma.orderItem.groupBy({ by: ["productName"], where: { order: { status: { not: "CANCELLED" } } }, _sum: { quantity: true, lineTotal: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
  ]);
  const count = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all]));
  const total = byStatus.reduce((s, r) => s + r._count._all, 0);
  const cards = [["Total orders", total], ...ORDER_STATUSES.map((s) => [ORDER_STATUS_LABELS[s], count[s] || 0]), ["Total sales (excl. cancelled)", formatBDT(sales._sum.total || 0)]];
  return (
    <>
      <PageHeader title="Overview" />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">{cards.map(([l, v]) => <li key={l} className="card p-4"><p className="text-sm text-muted">{l}</p><p className="text-2xl font-bold">{v}</p></li>)}</ul>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card p-4"><h2 className="mb-3 font-semibold">Recent orders</h2>
          {recent.length === 0 ? <p className="text-sm text-muted">No orders yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{recent.map((o) => (
              <tr key={o.id} className="border-t border-line"><td className="py-2"><Link href={`/admin-dashboard/orders/${o.id}`} className="text-brand underline">{o.orderNumber}</Link></td>
                <td>{o.customerName}</td><td>{formatBDT(o.total)}</td><td>{ORDER_STATUS_LABELS[o.status]}</td></tr>))}</tbody></table></div>)}
        </section>
        <section className="card p-4"><h2 className="mb-3 font-semibold">Best-selling products</h2>
          {best.length === 0 ? <p className="text-sm text-muted">No sales yet.</p> : (
            <table className="w-full text-left text-sm"><thead><tr><th className="py-1">Product</th><th>Units</th><th>Sales</th></tr></thead><tbody>{best.map((b) => (
              <tr key={b.productName} className="border-t border-line"><td className="py-2">{b.productName}</td><td>{b._sum.quantity}</td><td>{formatBDT(b._sum.lineTotal)}</td></tr>))}</tbody></table>)}
        </section>
      </div>
    </>
  );
}
