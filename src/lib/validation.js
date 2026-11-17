import { FIELD_TYPES } from "./constants";

export function str(v, max = 500) {
  if (typeof v !== "string") return "";
  // strip control chars; React escapes output, this is defence in depth
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}
export const optStr = (v, max) => { const s = str(v, max); return s === "" ? null : s; };
export function int(v, { min = -Infinity, max = Infinity } = {}) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}
export const optInt = (v, opts) => (v === "" || v === null || v === undefined ? null : int(v, opts));
export const bool = (v) => v === true || v === "on" || v === "true" || v === "1";

/** Normalise Bangladeshi mobile numbers to 01XXXXXXXXX; returns null if invalid. */
export function normalizeBdPhone(raw) {
  let d = String(raw || "").replace(/[\s\-()]/g, "");
  const bn = "০১২৩৪৫৬৭৮৯";
  d = d.replace(/[০-৯]/g, (c) => String(bn.indexOf(c)));
  if (d.startsWith("+880")) d = "0" + d.slice(4);
  else if (d.startsWith("880")) d = "0" + d.slice(3);
  return /^01[3-9]\d{8}$/.test(d) ? d : null;
}

export function isEmail(v) {
  return typeof v === "string" && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function validateFieldDef(f) {
  const errors = [];
  if (!/^[a-zA-Z][a-zA-Z0-9_]{0,40}$/.test(f.key || "")) errors.push("Field key must be letters/digits/underscore.");
  if (!str(f.label, 100)) errors.push("Field label is required.");
  if (!FIELD_TYPES.includes(f.type)) errors.push("Invalid field type.");
  return errors;
}
