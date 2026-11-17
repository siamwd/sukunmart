"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/app/actions/order";
import { formatBDT } from "@/lib/utils";

export default function OrderForm({ product, fields, variants }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(placeOrder, null);
  const [key, setKey] = useState("");
  const [qty, setQty] = useState(product.minQty);
  const [picked, setPicked] = useState({});
  useEffect(() => setKey(crypto.randomUUID()), []);
  useEffect(() => { if (state?.ok) router.push(`/order-confirmation/${state.orderNumber}`); }, [state, router]);

  const delta = Object.values(picked).reduce((s, v) => s + (v?.priceDelta || 0), 0);
  const unit = product.price + delta;
  const err = (k) => state?.fields?.[k];
  const soldOut = product.stockMode === "OUT_OF_STOCK";

  return (
    <form action={action} className="card space-y-4 p-5" aria-labelledby="order-heading" noValidate>
      <h2 id="order-heading" className="text-xl font-bold">{product.stockMode === "PREORDER" ? "প্রি-অর্ডার করুন" : "অর্ডার করুন"}</h2>
      {product.orderInstructions && <p className="rounded-btn bg-brand-soft p-3 text-sm">{product.orderInstructions}</p>}
      <input type="hidden" name="slug" value={product.slug} />
      <input type="hidden" name="idempotencyKey" value={key} />

      {fields.map((f) => {
        const id = `f_${f.key}`;
        const common = { id, name: id, "aria-invalid": !!err(f.key), "aria-describedby": err(f.key) ? `${id}-e` : undefined };
        return (
          <div key={f.key}>
            {f.type !== "checkbox" && <label htmlFor={id} className="label">{f.label}{f.required && <span className="text-danger"> *</span>}</label>}
            {f.type === "textarea" && <textarea {...common} rows={3} className="input" placeholder={f.placeholder || ""} maxLength={1000} />}
            {(f.type === "text" || f.type === "number") && <input {...common} type="text" inputMode={f.type === "number" ? "numeric" : undefined} className="input" placeholder={f.placeholder || ""} maxLength={300} />}
            {f.type === "tel" && <input {...common} type="tel" inputMode="tel" autoComplete="tel" className="input" placeholder={f.placeholder || ""} maxLength={20} />}
            {f.type === "select" && (
              <select {...common} className="input" defaultValue="">
                <option value="">বেছে নিন</option>
                {JSON.parse(f.options || "[]").map((o) => <option key={o}>{o}</option>)}
              </select>
            )}
            {f.type === "checkbox" && <label className="flex items-center gap-2"><input {...common} type="checkbox" /> {f.label}</label>}
            {(f.type === "variant_color" || f.type === "variant_size") && (
              <div role="radiogroup" aria-label={f.label} className="flex flex-wrap gap-2">
                {variants.filter((v) => v.type === (f.type === "variant_color" ? "color" : "size")).map((v) => (
                  <label key={v.id} className={`cursor-pointer rounded-btn border px-3 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:font-semibold ${v.available ? "" : "opacity-40"}`}>
                    <input type="radio" name={id} value={v.label} disabled={!v.available} className="sr-only"
                      onChange={() => setPicked((p) => ({ ...p, [f.key]: v }))} />
                    {v.label}{v.priceDelta ? ` (+${formatBDT(v.priceDelta)})` : ""}
                  </label>
                ))}
              </div>
            )}
            {f.helpText && <p className="mt-1 text-xs text-muted">{f.helpText}</p>}
            {err(f.key) && <p id={`${id}-e`} role="alert" className="mt-1 text-sm text-danger">{err(f.key)}</p>}
          </div>
        );
      })}

      {product.maxQty > product.minQty && (
        <div>
          <label htmlFor="quantity" className="label">পরিমাণ</label>
          <input id="quantity" name="quantity" type="number" min={product.minQty} max={product.maxQty} value={qty}
            onChange={(e) => setQty(Number(e.target.value) || product.minQty)} className="input w-28" />
        </div>
      )}
      {product.maxQty <= product.minQty && <input type="hidden" name="quantity" value={product.minQty} />}

      <div className="rounded-btn bg-surface p-3 text-sm" aria-live="polite">
        <p className="flex justify-between"><span>পণ্যের মূল্য ({qty} পিস)</span><b>{formatBDT(unit * qty)}</b></p>
        <p className="flex justify-between text-muted"><span>ডেলিভারি চার্জ</span><span>{product.deliveryCharge != null ? formatBDT(product.deliveryCharge) : "অর্ডারের পর জানানো হবে"}</span></p>
        <p className="mt-1 text-xs text-muted">চূড়ান্ত মূল্য সার্ভার নিশ্চিত করে।</p>
      </div>

      {state && !state.ok && <p role="alert" className="rounded-btn bg-red-50 p-3 text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending || !key || soldOut || state?.ok} className="btn-primary w-full text-lg">
        {soldOut ? "স্টক শেষ" : pending ? "অর্ডার হচ্ছে…" : "অর্ডার নিশ্চিত করুন"}
      </button>
      <p className="text-center text-xs text-muted">ক্যাশ অন ডেলিভারি</p>
    </form>
  );
}
