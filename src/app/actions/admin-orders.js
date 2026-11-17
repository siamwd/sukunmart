"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { str, optStr, optInt } from "@/lib/validation";
import { flash } from "@/components/admin/ui";

export async function updateOrderStatus(id, formData) {
  await requireAdmin();
  const to = String(formData.get("status"));
  const note = optStr(formData.get("note"), 300);
  const path = `/admin-dashboard/orders/${id}`;
  if (!ORDER_STATUSES.includes(to)) redirect(flash(path, "err", "Invalid status."));
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) redirect(flash("/admin-dashboard/orders", "err", "Order not found."));
  if (order.status !== to) {
    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: to } }),
      prisma.orderStatusHistory.create({ data: { orderId: id, fromStatus: order.status, toStatus: to, note } }),
    ]);
  }
  revalidatePath(path);
  redirect(flash(path, "ok", `Status set to ${to}.`));
}

export async function updateOrderPayment(id, formData) {
  await requireAdmin();
  const path = `/admin-dashboard/orders/${id}`;
  const order = await prisma.order.findUnique({ where: { id }, select: { total: true } });
  if (!order) redirect(flash("/admin-dashboard/orders", "err", "Order not found."));
  const paymentStatus = String(formData.get("paymentStatus"));
  if (!PAYMENT_STATUSES.includes(paymentStatus)) redirect(flash(path, "err", "Invalid payment status."));
  const advance = optInt(formData.get("advanceAmount") || 0, { min: 0, max: order.total }) ;
  if (advance === null) redirect(flash(path, "err", `Advance must be between 0 and ${order.total}.`));
  await prisma.order.update({ where: { id }, data: {
    paymentStatus, paymentMethod: str(formData.get("paymentMethod"), 40) || "COD",
    advanceAmount: advance, remainingAmount: order.total - advance,
    transactionId: optStr(formData.get("transactionId"), 100), paymentReference: optStr(formData.get("paymentReference"), 100),
  } });
  redirect(flash(path, "ok", "Payment details saved."));
}

export async function updateOrderNote(id, formData) {
  await requireAdmin();
  await prisma.order.update({ where: { id }, data: { adminNote: optStr(formData.get("adminNote"), 2000) } });
  redirect(flash(`/admin-dashboard/orders/${id}`, "ok", "Note saved."));
}

export async function updateOrderDelivery(id, formData) {
  await requireAdmin();
  const path = `/admin-dashboard/orders/${id}`;
  const order = await prisma.order.findUnique({ where: { id }, select: { subtotal: true, advanceAmount: true } });
  if (!order) redirect(flash("/admin-dashboard/orders", "err", "Order not found."));
  const charge = optInt(formData.get("deliveryCharge"), { min: 0, max: 100000 });
  const total = order.subtotal + (charge ?? 0);
  await prisma.order.update({ where: { id }, data: { deliveryCharge: charge, total, remainingAmount: Math.max(total - order.advanceAmount, 0) } });
  redirect(flash(path, "ok", "Delivery charge updated."));
}
