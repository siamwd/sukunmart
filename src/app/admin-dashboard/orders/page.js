import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUSES } from "@/lib/constants";
import { formatBDT } from "@/lib/utils";
import { PageHeader, Pager } from "@/components/admin/ui";

const PAGE = 20;
export default async function Orders({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = String(sp.q || "").trim().slice(0, 80);
  const status = ORDER_STATUSES.includes(sp.status) ? sp.status : "";
  const pay = PAYMENT_STATUSES.includes(sp.pay) ? sp.pay : "";
  const from = /^\d{4}-\d{2}-\d{2}$/.test(sp.from || "") ? new Date(sp.from + "T00:00:00") : null;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(sp.to || "") ? new Date(sp.to + "T23:59:59") : null;
  const page = Math.max(1, parseInt(sp.page) || 1);
  const where = {
    ...(status && { status }), ...(pay && { paymentStatus: pay }),
    ...((from || to) && { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }),
    ...(q && { OR: [{ orderNumber: { contains: q } }, { customerName: { contains: q } }, { customerPhone: { contains: q } }] }),
  };
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE,
      select: { id: true, orderNumber: true, customerName: true, customerPhone: true, total: true, status: true, paymentStatus: true, createdAt: true, items: { select: { productName: true, quantity: true } } } }),
  ]);
  const params = { q, status, pay, from: sp.from || "", to: sp.to || "" };
  return (
    <>
      <PageHeader title="Orders" />
      <form className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6" role="search">
        <input name="q" defaultValue={q} placeholder="Order no., name, phone" aria-label="Search orders" className="input lg:col-span-2" />
        <select name="status" defaultValue={status} aria-label="Status" className="input"><option value="">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}</select>
        <select name="pay" defaultValue={pay} aria-label="Payment status" className="input"><option value="">All payments</option>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <input type="date" name="from" defaultValue={sp.from || ""} aria-label="From date" className="input" />
        <input type="date" name="to" defaultValue={sp.to || ""} aria-label="To date" className="input" />
        <button className="btn-primary sm:col-span-2 lg:col-span-1">Filter</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface"><tr>{["Order", "Customer", "Items", "Total", "Status", "Payment", "Placed"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted">No orders match.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="p-3"><Link href={`/admin-dashboard/orders/${o.id}`} className="font-medium text-brand underline">{o.orderNumber}</Link></td>
                <td className="p-3">{o.customerName}<br /><span className="text-muted">{o.customerPhone}</span></td>
                <td className="p-3">{o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}</td>
                <td className="p-3">{formatBDT(o.total)}</td><td className="p-3">{ORDER_STATUS_LABELS[o.status]}</td><td className="p-3">{o.paymentStatus}</td>
                <td className="p-3">{o.createdAt.toLocaleDateString("en-GB")}</td>
              </tr>))}
          </tbody>
        </table>
      </div>
      <Pager base="/admin-dashboard/orders" page={page} pages={Math.ceil(total / PAGE)} params={params} />
    </>
  );
}
