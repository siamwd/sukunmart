import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProductBySlug, listProducts } from "@/lib/queries";
import { formatBDT, siteUrl } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import ProductGallery from "@/components/products/ProductGallery";
import OrderForm from "@/components/orders/OrderForm";

const getCategory = (slug) => prisma.category.findFirst({ where: { slug, published: true } });

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (p) {
    const title = p.seoTitle || `${p.name} — ${formatBDT(p.price)}`;
    const description = p.seoDescription || p.shortDescription || p.tagline || undefined;
    return { title, description, alternates: { canonical: `${siteUrl()}/${p.slug}` },
      openGraph: { title, description, images: p.featuredImage ? [p.featuredImage] : undefined } };
  }
  const c = await getCategory(slug);
  if (!c) return {};
  return { title: c.name, description: c.description || undefined, alternates: { canonical: `${siteUrl()}/${c.slug}` } };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (product) return <ProductPage product={product} />;
  const category = await getCategory(slug);
  if (category) return <CategoryPage category={category} />;
  notFound();
}

async function CategoryPage({ category }) {
  const products = await listProducts({ categoryId: category.id });
  return (
    <div className="container-page section">
      <header className="mb-8 rounded-card bg-gradient-to-b from-surface to-white p-6 sm:p-8">
        {category.image && <div className="relative mb-4 aspect-[3/1] overflow-hidden rounded-card"><Image src={category.image} alt="" fill sizes="1120px" className="object-cover" /></div>}
        <h1 className="section-title">{category.name}</h1>
        {category.description && <p className="mt-2 max-w-2xl text-muted">{category.description}</p>}
      </header>
      {products.length === 0 ? <p className="card p-6 text-muted">এই বিভাগে এখনো কোনো পণ্য নেই।</p> : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
        </ul>
      )}
    </div>
  );
}

function ProductPage({ product }) {
  const images = [...(product.featuredImage ? [{ path: product.featuredImage, alt: product.name }] : []),
    ...product.images.filter((i) => i.path !== product.featuredImage)];
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.shortDescription || product.tagline || undefined,
    image: images.map((i) => /^https?:\/\//.test(i.path) ? i.path : siteUrl() + i.path),
    offers: { "@type": "Offer", priceCurrency: "BDT", price: product.price, url: `${siteUrl()}/${product.slug}`,
      availability: product.stockMode === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : product.stockMode === "PREORDER" ? "https://schema.org/PreOrder" : "https://schema.org/InStock" },
  };
  return (
    <div className="container-page section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={images} name={product.name} />
        <div>
          {product.badge && <p className="mb-2 inline-block rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">{product.badge}</p>}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.tagline && <p className="mt-1 text-muted">{product.tagline}</p>}
          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand">{formatBDT(product.price)}</span>
            {product.compareAtPrice ? <s className="text-lg text-muted">{formatBDT(product.compareAtPrice)}</s> : null}
          </p>
          {product.priceNote && <p className="text-sm text-muted">{product.priceNote}</p>}
          {product.deliveryNote && <p className="mt-2 text-sm">{product.deliveryNote}</p>}
          {product.shortDescription && <p className="mt-4">{product.shortDescription}</p>}
          <div className="mt-6" id="order"><OrderForm
            product={{ slug: product.slug, name: product.name, price: product.price, minQty: product.minQty, maxQty: product.maxQty, stockMode: product.stockMode, deliveryCharge: product.deliveryCharge, orderInstructions: product.orderInstructions }}
            fields={product.orderFields.map((f) => ({ key: f.key, label: f.label, type: f.type, required: f.required, options: f.options, placeholder: f.placeholder, helpText: f.helpText }))}
            variants={product.variants.map((v) => ({ id: v.id, type: v.type, label: v.label, priceDelta: v.priceDelta, available: v.available }))} /></div>
        </div>
      </div>

      {product.description && <section className="mt-12"><h2 className="section-title mb-5">বিবরণ</h2><p className="max-w-3xl whitespace-pre-line">{product.description}</p></section>}
      {product.benefits.length > 0 && (
        <section className="mt-12"><h2 className="section-title mb-5">সুবিধাসমূহ</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{product.benefits.map((b) => (
            <li key={b.id} className="card p-4"><h3 className="font-semibold">{b.title}</h3>{b.text && <p className="mt-1 text-sm text-muted">{b.text}</p>}</li>))}</ul></section>)}
      {product.specs.length > 0 && (
        <section className="mt-12"><h2 className="section-title mb-5">স্পেসিফিকেশন</h2>
          <div className="overflow-x-auto"><table className="w-full max-w-2xl border border-line text-left"><tbody>{product.specs.map((s) => (
            <tr key={s.id} className="border-b border-line"><th scope="row" className="w-1/3 bg-surface p-3 font-medium">{s.label}</th><td className="p-3">{s.value}</td></tr>))}</tbody></table></div></section>)}
      {product.importantNotes && (
        <section className="mt-12 rounded-card border border-amber-300 bg-amber-50 p-5"><h2 className="mb-2 text-lg font-bold">গুরুত্বপূর্ণ তথ্য</h2>
          <ul className="list-disc space-y-1 pl-5">{product.importantNotes.split("\n").filter(Boolean).map((l) => <li key={l}>{l}</li>)}</ul></section>)}
      {product.faqs.length > 0 && (
        <section className="mt-12"><h2 className="section-title mb-5">সাধারণ প্রশ্নোত্তর</h2>
          <div className="max-w-3xl space-y-2">{product.faqs.map((f) => (
            <details key={f.id} className="card p-4"><summary className="cursor-pointer font-semibold">{f.question}</summary><p className="mt-2 text-muted">{f.answer}</p></details>))}</div></section>)}
      {product.reviews.length > 0 && (
        <section className="mt-12"><h2 className="section-title mb-5">গ্রাহকদের মতামত</h2>
          <ul className="grid gap-4 md:grid-cols-3">{product.reviews.map((r) => (
            <li key={r.id} className="card p-4">{r.rating ? <p aria-label={`${r.rating}/5`} className="text-amber-500">{"★".repeat(r.rating)}</p> : null}
              {r.body && <p className="text-sm">{r.body}</p>}<p className="mt-2 text-sm font-semibold">{r.name}</p>{r.source && <p className="text-xs text-muted">{r.source}</p>}</li>))}</ul></section>)}
      <p className="mt-10"><Link href="/" className="text-brand underline">← হোমে ফিরে যান</Link></p>
    </div>
  );
}
