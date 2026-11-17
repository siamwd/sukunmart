import Link from "next/link";
import Image from "next/image";
import { Flame } from "lucide-react";
import { formatBDT, toBn } from "@/lib/utils";
import { STOCK_MODE_LABELS } from "@/lib/constants";

export default function ProductCard({ product, trending = false, rank }) {
  const soldOut = product.stockMode === "OUT_OF_STOCK";
  const off = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      <Link href={`/${product.slug}`} className="relative block aspect-square overflow-hidden bg-surface">
        {product.featuredImage ? (
          <Image src={product.featuredImage} alt={product.name} fill sizes="(max-width:640px) 70vw, (max-width:1024px) 33vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <span className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">{product.name}</span>
        )}
        {trending ? (
          <span className="pill absolute left-3 top-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow"><Flame size={14} aria-hidden />{rank ? `#${toBn(rank)} ` : ""}Trending</span>
        ) : product.badge ? (
          <span className="pill absolute left-3 top-3 bg-brand text-white shadow">{product.badge}</span>
        ) : null}
        {off > 0 && <span className="pill absolute right-3 top-3 bg-white text-danger shadow">-{toBn(off)}%</span>}
        {soldOut && <span className="absolute inset-0 flex items-center justify-center bg-white/70 font-semibold">স্টক শেষ</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug"><Link href={`/${product.slug}`}>{product.name}</Link></h3>
        {product.tagline && <p className="line-clamp-2 text-sm text-muted">{product.tagline}</p>}
        <p className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-xl font-bold text-brand">{formatBDT(product.price)}</span>
          {off > 0 && <s className="text-sm text-muted">{formatBDT(product.compareAtPrice)}</s>}
        </p>
        {product.priceNote && <p className="text-xs text-muted">{product.priceNote}</p>}
        <p className={`text-xs font-medium ${soldOut ? "text-danger" : "text-brand"}`}>{STOCK_MODE_LABELS[product.stockMode]}</p>
        <Link href={`/${product.slug}`} className="btn-primary mt-2 py-2.5 text-sm">{product.stockMode === "PREORDER" ? "প্রি-অর্ডার করুন" : "অর্ডার করুন"}</Link>
      </div>
    </article>
  );
}
