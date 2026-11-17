import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatBDT } from "@/lib/utils";

export const metadata = { title: "অর্ডার নিশ্চিত", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const mask = (p) => (p ? p.slice(0, 3) + "••••" + p.slice(-2) : "");

export default async function Confirmation({ params }) {
  const { orderNumber } = await params;
  if (!/^SK-\d{6}-[A-Z2-9]{5}$/.test(orderNumber)) notFound();
  const [order, s] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      select: { orderNumber: true, customerName: true, customerPhone: true, subtotal: true, deliveryCharge: true, total: true, paymentMethod: true, status: true, createdAt: true,
        items: { select: { productName: true, variantSummary: true, quantity: true, unitPrice: true, lineTotal: true } } },
    }),
    getSettings(),
  ]);
  if (!order) notFound();
  // Deliberately omits address, notes, internal ids and admin fields.
  return (
    <div className="container-page section max-w-2xl">
      <h1 className="text-3xl font-bold text-brand">ধন্যবাদ, {order.customerName}!</h1>
      <p className="mt-2">আপনার অর্ডার গ্রহণ করা হয়েছে। অর্ডার নম্বর সংরক্ষণ করুন:</p>
      <p className="mt-2 inline-block rounded-btn bg-brand-soft px-4 py-2 text-2xl font-bold tracking-wider">{order.orderNumber}</p>
      <section className="card mt-6 p-5">
        <h2 className="mb-3 font-semibold">অর্ডারের বিবরণ</h2>
        <ul className="divide-y divide-line">{order.items.map((i, n) => (
          <li key={n} className="flex justify-between gap-3 py-2"><span>{i.productName}{i.variantSummary ? ` (${i.variantSummary})` : ""} × {i.quantity}</span><b>{formatBDT(i.lineTotal)}</b></li>))}</ul>
        <p className="mt-3 flex justify-between"><span>ডেলিভারি চার্জ</span><span>{order.deliveryCharge != null ? formatBDT(order.deliveryCharge) : "আমরা যোগাযোগ করে জানাব"}</span></p>
        <p className="mt-1 flex justify-between text-lg font-bold"><span>মোট</span><span>{formatBDT(order.total)}{order.deliveryCharge == null && " + ডেলিভারি"}</span></p>
        <p className="mt-3 text-sm text-muted">পেমেন্ট: ক্যাশ অন ডেলিভারি · যোগাযোগ নম্বর: {mask(order.customerPhone)}</p>
      </section>
      <section className="mt-6"><h2 className="mb-2 font-semibold">পরবর্তী ধাপ</h2>
        <p>আমরা আপনার মোবাইল নম্বরে যোগাযোগ করে অর্ডার নিশ্চিত করব।{s.contactPhone ? ` প্রয়োজনে কল করুন: ${s.contactPhone}` : ""}</p></section>
      <Link href="/" className="btn-outline mt-8">হোমে ফিরে যান</Link>
    </div>
  );
}
