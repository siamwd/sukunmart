"use server";
import { headers } from "next/headers";
import { createOrder, OrderError } from "@/lib/order";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function placeOrder(_prev, formData) {
  const ip = clientIp(await headers());
  const rl = rateLimit(`order:${ip}`, { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) return { ok: false, error: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" };

  const answers = {};
  for (const [k, v] of formData.entries()) if (k.startsWith("f_")) answers[k.slice(2)] = typeof v === "string" ? v : "";
  try {
    const r = await createOrder({
      slug: formData.get("slug"), quantity: formData.get("quantity"),
      idempotencyKey: formData.get("idempotencyKey"), answers,
    });
    return { ok: true, orderNumber: r.orderNumber };
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message, fields: e.fields };
    return { ok: false, error: "অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।" };
  }
}
