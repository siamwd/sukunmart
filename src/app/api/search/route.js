import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchWhere } from "@/lib/queries";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Public, read-only: published product name/slug/price/image only.
export async function GET(request) {
  if (!rateLimit(`search:${clientIp(request.headers)}`, { limit: 60, windowMs: 60_000 }).ok)
    return NextResponse.json({ results: [] }, { status: 429 });
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = await prisma.product.findMany({
    where: searchWhere(q), orderBy: { sortOrder: "asc" }, take: 6,
    select: { slug: true, name: true, price: true, featuredImage: true },
  });
  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
