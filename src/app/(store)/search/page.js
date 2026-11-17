import { prisma } from "@/lib/prisma";
import { productCardSelect, searchWhere } from "@/lib/queries";
import ProductCard from "@/components/products/ProductCard";
import { Pager } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  return { title: q ? `"${String(q).slice(0, 60)}" — সার্চ` : "সব পণ্য", robots: { index: false, follow: true } };
}

const PER = 12;
export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp.q || "").trim().slice(0, 100);
  const page = Math.max(1, parseInt(sp.page) || 1);
  const where = searchWhere(q);
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], skip: (page - 1) * PER, take: PER, select: productCardSelect }),
  ]);
  return (
    <div className="container-page section">
      <h1 className="text-2xl font-bold sm:text-3xl">{q ? `"${q}" এর ফলাফল` : "সব পণ্য"}</h1>
      <p className="mt-1 text-muted" aria-live="polite">{total} টি পণ্য পাওয়া গেছে</p>
      {products.length === 0 ? (
        <p className="card mt-6 p-6 text-muted">কোনো পণ্য পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন অথবা ক্যাটাগরি মেনু থেকে খুঁজুন।</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}</ul>
      )}
      <Pager base="/search" page={page} pages={Math.ceil(total / PER)} params={q ? { q } : {}} />
    </div>
  );
}
