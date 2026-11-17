// In-memory sliding window. Fine for a single Node process; use a shared store
// (Redis/DB) if you run multiple instances. Documented in README.
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    buckets.set(key, arr);
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - arr[0])) / 1000) };
  }
  arr.push(now);
  buckets.set(key, arr);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
  return { ok: true };
}

export function clientIp(headers) {
  const fwd = headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : headers.get("x-real-ip")) || "unknown";
}
