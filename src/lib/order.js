import "server-only";
import crypto from "node:crypto";
import { prisma } from "./prisma";
import { str, int, bool, normalizeBdPhone } from "./validation";
import { parseJSON } from "./utils";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
function orderNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  let r = "";
  for (const b of crypto.randomBytes(5)) r += ALPHABET[b % ALPHABET.length];
  return `SK-${ymd}-${r}`;
}

class OrderError extends Error {
  constructor(message, fields) { super(message); this.fields = fields || {}; }
}

/**
 * Builds and persists an order. The client only supplies: product slug, quantity,
 * answers keyed by field key, and an idempotency key. Prices, stock, variants and
 * required fields are all taken from the database.
 */
export async function createOrder(input) {
  const slug = str(input.slug, 100);
  const idemKey = str(input.idempotencyKey, 80);
  if (!/^[A-Za-z0-9-]{16,80}$/.test(idemKey)) throw new OrderError("Invalid request. Please reload the page and try again.");

  // Duplicate submission (double click / retry): return the order already created.
  const existing = await prisma.order.findUnique({ where: { idempotencyKey: idemKey }, select: { orderNumber: true } });
  if (existing) return { orderNumber: existing.orderNumber, duplicate: true };

  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: { variants: { orderBy: { sortOrder: "asc" } }, orderFields: { where: { enabled: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!product) throw new OrderError("This product is not available.");
  if (product.stockMode === "OUT_OF_STOCK") throw new OrderError("This product is currently out of stock.");

  const qty = int(input.quantity ?? 1, { min: product.minQty, max: product.maxQty });
  if (qty === null) throw new OrderError(`Quantity must be between ${product.minQty} and ${product.maxQty}.`, { quantity: "Invalid quantity." });

  const answers = input.answers && typeof input.answers === "object" ? input.answers : {};
  const errors = {};
  const stored = {}; // key -> { label, value }
  const chosenVariants = [];
  const core = { customerName: null, customerPhone: null, customerAddress: null, district: null, area: null, customerNote: null };

  for (const f of product.orderFields) {
    const raw = answers[f.key];
    const empty = raw === undefined || raw === null || String(raw).trim() === "" || raw === false;
    if (empty) {
      if (f.required) errors[f.key] = `${f.label} is required.`;
      continue;
    }
    let value;
    switch (f.type) {
      case "tel": {
        value = normalizeBdPhone(raw);
        if (!value) errors[f.key] = "Enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX).";
        break;
      }
      case "number": {
        value = int(raw, { min: 0, max: 1_000_000 });
        if (value === null) errors[f.key] = `${f.label} must be a whole number.`;
        break;
      }
      case "checkbox": value = bool(raw) ? "Yes" : null; break;
      case "select": {
        const opts = parseJSON(f.options, []);
        value = str(raw, 200);
        if (!opts.includes(value)) errors[f.key] = `Choose a valid ${f.label}.`;
        break;
      }
      case "variant_color":
      case "variant_size": {
        const type = f.type === "variant_color" ? "color" : "size";
        const v = product.variants.find((x) => x.type === type && x.label === str(raw, 100) && x.available);
        if (!v) errors[f.key] = `Choose an available ${f.label}.`;
        else { chosenVariants.push(v); value = v.label; }
        break;
      }
      case "textarea": value = str(raw, 1000); break;
      default: value = str(raw, 300);
    }
    if (errors[f.key]) continue;
    stored[f.key] = { label: f.label, value };
    if (f.key in core) core[f.key] = value;
    if (f.key === "notes") core.customerNote = value;
  }
  if (Object.keys(errors).length) throw new OrderError("Please fix the highlighted fields.", errors);
  if (!core.customerName || !core.customerPhone) {
    // The form must always collect at least a name and phone so staff can confirm.
    throw new OrderError("This product's order form must include customer name and phone. Contact the shop.");
  }

  const unitPrice = product.price + chosenVariants.reduce((s, v) => s + v.priceDelta, 0);
  const lineTotal = unitPrice * qty;
  const deliveryCharge = product.deliveryCharge ?? null;
  const total = lineTotal + (deliveryCharge ?? 0);
  const advance = product.advanceRequired ? Math.min(product.advanceAmount ?? 0, total) : 0;
  const variantSummary = chosenVariants.length ? chosenVariants.map((v) => `${v.type === "color" ? "Color" : "Size"}: ${v.label}`).join(", ") : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const number = orderNumber();
    try {
      await prisma.$transaction(async (tx) => {
        // Stock is decremented conditionally inside the transaction (no oversell).
        if (product.stockMode === "TRACKED") {
          const r = await tx.product.updateMany({ where: { id: product.id, stockQty: { gte: qty } }, data: { stockQty: { decrement: qty } } });
          if (r.count !== 1) throw new OrderError("Not enough stock available.");
        }
        for (const v of chosenVariants) {
          if (v.stockQty !== null) {
            const r = await tx.productVariant.updateMany({ where: { id: v.id, stockQty: { gte: qty } }, data: { stockQty: { decrement: qty } } });
            if (r.count !== 1) throw new OrderError(`${v.label} is out of stock.`);
          }
        }
        const order = await tx.order.create({
          data: {
            orderNumber: number, idempotencyKey: idemKey, status: "PENDING",
            customerName: core.customerName, customerPhone: core.customerPhone,
            customerAddress: core.customerAddress, district: core.district, area: core.area, customerNote: core.customerNote,
            fieldValues: JSON.stringify(stored),
            subtotal: lineTotal, deliveryCharge, total,
            paymentMethod: "COD", paymentStatus: "UNPAID",
            advanceAmount: 0, remainingAmount: total,
            items: { create: [{
              productId: product.id, productName: product.name, productSlug: product.slug,
              variantSummary, unitPrice, quantity: qty, lineTotal,
            }] },
            history: { create: [{ fromStatus: null, toStatus: "PENDING", note: "Order placed" }] },
          },
        });
        return order;
      });
      return { orderNumber: number, duplicate: false, advanceRequired: advance > 0 };
    } catch (e) {
      if (e instanceof OrderError) throw e;
      if (e?.code === "P2002") {
        const target = String(e.meta?.target || "");
        if (target.includes("idempotencyKey")) {
          const o = await prisma.order.findUnique({ where: { idempotencyKey: idemKey }, select: { orderNumber: true } });
          if (o) return { orderNumber: o.orderNumber, duplicate: true };
        }
        continue; // order-number collision: retry with a new number
      }
      console.error("createOrder failed:", e?.code || e?.name); // no customer data in logs
      throw new OrderError("Could not place the order. Please try again.");
    }
  }
  throw new OrderError("Could not place the order. Please try again.");
}

export { OrderError };
