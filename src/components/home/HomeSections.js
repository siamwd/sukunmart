import Link from "next/link";
import Image from "next/image";
import { Flame, CreditCard, Truck, Headphones, ShieldCheck, Repeat, BadgeCheck, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { listProducts, listTrending } from "@/lib/queries";
import { parseJSON, toBn } from "@/lib/utils";
import ProductCard from "@/components/products/ProductCard";
import HeroSlider from "./HeroSlider";

const ICONS = { card: CreditCard, truck: Truck, support: Headphones, shield: ShieldCheck, repeat: Repeat, check: BadgeCheck };
const CYCLE = [BadgeCheck, ShieldCheck, Repeat, Truck];
function iconFor(item, i) {
  if (typeof item === "object" && ICONS[item.icon]) return ICONS[item.icon];
  const t = typeof item === "string" ? item : item.text || "";
  if (/ক্যাশ|cash|পেমেন্ট/i.test(t)) return CreditCard;
  if (/ডেলিভারি|delivery/i.test(t)) return Truck;
  if (/সাপোর্ট|support|যোগাযোগ|whatsapp/i.test(t)) return Headphones;
  if (/রিপ্লেস|রিটার্ন|replace/i.test(t)) return Repeat;
  return CYCLE[i % CYCLE.length];
}

export default async function HomeSections() {
  const sections = await prisma.homeSection.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } });
  return <>{await Promise.all(sections.map((s) => <Section key={s.id} s={s} />))}</>;
}

function Head({ s, dark, icon, href, hrefLabel = "সব দেখুন" }) {
  if (!s.title && !s.subtitle) return null;
  return (
    <header className={`mb-7 flex flex-wrap items-end gap-3 ${dark ? "justify-center text-center" : "justify-between"}`}>
      <div>
        {s.title && <h2 className="section-title">{icon}{s.title}</h2>}
        {s.subtitle && <p className={`mt-3 ${dark ? "text-white/80" : "text-muted"}`}>{s.subtitle}</p>}
      </div>
      {href && <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">{hrefLabel}<ArrowRight size={16} aria-hidden /></Link>}
    </header>
  );
}

async function Section({ s }) {
  const cfg = parseJSON(s.config, {});
  switch (s.type) {
    case "hero": {
      const slides = await prisma.banner.findMany({ where: { placement: "HOME_HERO", published: true, image: { not: null } }, orderBy: { sortOrder: "asc" }, take: 10 });
      const images = slides.map((b) => ({ src: b.image, alt: b.title || "" }));
      return (
        <section className="bg-gradient-to-b from-surface to-white">
          <div className="container-page grid items-center gap-10 py-12 sm:py-16 md:grid-cols-2 md:gap-14 lg:py-6">
            <div>
              {s.subtitle && <span className="pill mb-5 bg-brand-soft uppercase tracking-wide text-brand">{s.subtitle}</span>}
              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">{s.title}</h1>
              {s.body && <p className="mt-5 max-w-xl text-lg text-muted">{s.body}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={cfg.primaryHref || "/search"} className="btn-primary">{cfg.primaryLabel || "পণ্য দেখুন"}<ArrowRight size={18} aria-hidden /></Link>
                {cfg.secondaryLabel && <Link href={cfg.secondaryHref || "/search"} className="btn-outline">{cfg.secondaryLabel}</Link>}
              </div>
            </div>
            <HeroSlider images={images} interval={cfg.interval || 5} label={s.title?.slice(0, 1)} />
          </div>
        </section>
      );
    }
    case "trust": {
      const items = cfg.items || [];
      if (!items.length) return null;
      return (
        <section className="bg-gradient-to-b from-brand-soft/70 to-white">
          <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-4 py-6 text-center sm:py-10 md:grid-cols-4">
            {items.map((it, i) => { const Icon = iconFor(it, i); const text = typeof it === "string" ? it : it.text; return (
              <li key={text} className="flex flex-col items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand shadow-md ring-1 ring-brand/10"><Icon size={24} aria-hidden /></span>
                <span className="max-w-[11rem] text-sm font-semibold leading-snug">{text}</span>
              </li>); })}
          </ul>
        </section>);
    }
    case "categories": {
      const cats = await prisma.category.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
      if (!cats.length) return null;
      return (
        <section className="container-page section"><Head s={s} />
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{cats.map((c) => (
            <li key={c.id}><Link href={`/${c.slug}`} className="card card-hover group flex h-full flex-col overflow-hidden text-center">
              <span className="relative block aspect-square bg-gradient-to-br from-brand-soft to-white">{c.image ? <Image src={c.image} alt="" fill sizes="(max-width:640px) 50vw, 16vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <span className="flex h-full items-center justify-center text-4xl font-bold text-brand/40" aria-hidden>{c.name.slice(0, 1)}</span>}</span>
              <span className="p-3 text-sm font-semibold group-hover:text-brand">{c.name}</span></Link></li>))}</ul></section>);
    }
    case "trending": {
      const products = await listTrending(Number(cfg.limit) || 8);
      if (!products.length) return null; // nothing flagged as trending in admin → section hidden
      return (
        <section className="bg-gradient-to-b from-orange-50/70 via-white to-white"><div className="container-page section">
          <Head s={s} icon={<Flame className="mr-2 inline-block align-[-4px] text-orange-500" size={28} aria-hidden />} href="/search" />
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4">
            {products.map((p, i) => <li key={p.id} className="w-[68%] shrink-0 snap-start sm:w-[44%] md:w-auto"><ProductCard product={p} trending rank={i < 3 ? i + 1 : undefined} /></li>)}
          </ul></div></section>);
    }
    case "products": {
      const cat = cfg.category ? await prisma.category.findFirst({ where: { slug: cfg.category, published: true } }) : null;
      const products = await listProducts(cat ? { categoryId: cat.id } : {}, Number(cfg.limit) || 8);
      return (
        <section className="container-page section"><Head s={s} href={cat ? `/${cat.slug}` : "/search"} />
          {products.length === 0 ? <p className="card p-6 text-muted">এখনো কোনো পণ্য যোগ করা হয়নি।</p> :
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}</ul>}
        </section>);
    }
    case "featured_product": {
      const [p] = cfg.product ? await listProducts({ slug: cfg.product }) : [];
      return p ? <section className="bg-surface"><div className="container-page section"><Head s={s} /><div className="max-w-xs"><ProductCard product={p} /></div></div></section> : null;
    }
    case "how_it_works":
      return (
        <section className="bg-surface"><div className="container-page section"><Head s={s} />
          <ol className="grid gap-4 md:grid-cols-3">{(cfg.steps || []).map(([t, d], i) => (
            <li key={t} className="card flex gap-4 p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">{toBn(i + 1)}</span>
              <div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div></li>))}</ol></div></section>);
    case "reviews": {
      const reviews = await prisma.review.findMany({ where: { status: "APPROVED", ...(cfg.group ? { group: cfg.group } : {}) }, orderBy: { sortOrder: "asc" }, take: 9 });
      if (!reviews.length) return null; // never show placeholder/fake reviews
      return (
        <section className="bg-surface"><div className="container-page section"><Head s={s} />
          <ul className="grid gap-4 md:grid-cols-3">{reviews.map((r) => (
            <li key={r.id} className="card p-5">{r.rating ? <p aria-label={`${r.rating}/5`} className="text-amber-500">{"★".repeat(r.rating)}</p> : null}
              {r.body && <p className="text-sm">{r.body}</p>}<p className="mt-3 text-sm font-semibold">{r.name}</p>{r.source && <p className="text-xs text-muted">{r.source}</p>}</li>))}</ul></div></section>);
    }
    case "faq": {
      const faqs = await prisma.fAQ.findMany({ where: { published: true, isGlobal: true }, orderBy: { sortOrder: "asc" } });
      return faqs.length ? (
        <section className="container-page section"><Head s={s} />
          <div className="max-w-3xl space-y-3">{faqs.map((f) => <details key={f.id} className="card p-4 open:border-brand/40"><summary className="cursor-pointer font-semibold">{f.question}</summary><p className="mt-2 text-muted">{f.answer}</p></details>)}</div></section>) : null;
    }
    case "cta":
      return (
        <section className="text-white" style={{ backgroundImage: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }}><div className="container-page py-14 text-center">
          <Head s={s} dark />
          <Link href="/search" className="btn bg-white text-brand hover:bg-brand-soft">সব পণ্য দেখুন<ArrowRight size={18} aria-hidden /></Link></div></section>);
    default: return null;
  }
}
