import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUSES } from "@/lib/constants";
import { formatBDT, parseJSON } from "@/lib/utils";
import { updateOrderStatus, updateOrderPayment, updateOrderNote, updateOrderDelivery } from "@/app/actions/admin-orders";
import { PageHeader, Notice, Field, TextArea } from "@/components/admin/ui";

export default async function OrderDetail({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, history: { orderBy: { createdAt: "desc" } } } });
  if (!order) notFound();
  const answers = Object.values(parseJSON(order.fieldValues, {}));
  return (
    <>
      <PageHeader title={`Order ${order.orderNumber}`}><Link href="/admin-dashboard/orders" className="btn-outline px-3 py-1.5 text-sm">All orders</Link></PageHeader>
      <Notice searchParams={await searchParams} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="card p-4"><h2 className="mb-2 font-semibold">Items</h2>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{order.items.map((i) => (
              <tr key={i.id} className="border-t border-line"><td className="py-2">{i.productName}{i.variantSummary ? ` — ${i.variantSummary}` : ""}</td><td>{formatBDT(i.unitPrice)} × {i.quantity}</td><td className="text-right">{formatBDT(i.lineTotal)}</td></tr>))}</tbody></table></div>
            <p className="mt-2 text-right text-sm">Delivery: {order.deliveryCharge != null ? formatBDT(order.deliveryCharge) : "to be confirmed"}</p>
            <p className="text-right text-lg font-bold">Total {formatBDT(order.total)}</p></section>
          <section className="card p-4"><h2 className="mb-2 font-semibold">Customer & submitted answers</h2>
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[160px_1fr]">{answers.map((a) => (<div key={a.label} className="contents"><dt className="text-muted">{a.label}</dt><dd className="whitespace-pre-line">{String(a.value)}</dd></div>))}</dl>
            <form action={updateOrderDelivery.bind(null, id)} className="mt-4 flex items-end gap-2"><Field label="Delivery charge (BDT)" name="deliveryCharge" type="number" min="0" defaultValue={order.deliveryCharge ?? ""} /><button className="btn-outline">Update</button></form></section>
          <section className="card p-4"><h2 className="mb-2 font-semibold">Status history</h2>
            <ul className="space-y-1 text-sm">{order.history.map((h) => <li key={h.id}>{h.createdAt.toLocaleString("en-GB")} — {h.fromStatus ? `${ORDER_STATUS_LABELS[h.fromStatus]} → ` : ""}<b>{ORDER_STATUS_LABELS[h.toStatus]}</b>{h.note ? ` (${h.note})` : ""}</li>)}</ul></section>
        </div>
        <div className="space-y-6">
          <form action={updateOrderStatus.bind(null, id)} className="card space-y-3 p-4"><h2 className="font-semibold">Status</h2>
            <select name="status" defaultValue={order.status} aria-label="Status" className="input">{ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}</select>
            <input name="note" placeholder="Note (optional)" aria-label="Status note" className="input" /><button className="btn-primary w-full">Update status</button></form>
          <form action={updateOrderPayment.bind(null, id)} className="card space-y-3 p-4"><h2 className="font-semibold">Payment</h2>
            <Field label="Method" name="paymentMethod" defaultValue={order.paymentMethod} />
            <Field label="Status" name="paymentStatus"><select id="paymentStatus" name="paymentStatus" defaultValue={order.paymentStatus} className="input">{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Advance received (BDT)" name="advanceAmount" type="number" min="0" defaultValue={order.advanceAmount} hint={`Remaining: ${formatBDT(order.remainingAmount)}`} />
            <Field label="Transaction ID" name="transactionId" defaultValue={order.transactionId} /><Field label="Reference" name="paymentReference" defaultValue={order.paymentReference} />
            <button className="btn-primary w-full">Save payment</button></form>
          <form action={updateOrderNote.bind(null, id)} className="card space-y-3 p-4"><TextArea label="Internal note" name="adminNote" defaultValue={order.adminNote} rows={4} /><button className="btn-outline w-full">Save note</button></form>
        </div>
      </div>
    </>
  );
}
