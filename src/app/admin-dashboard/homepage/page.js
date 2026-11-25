import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HOME_SECTION_TYPES, BANNER_PLACEMENTS } from "@/lib/constants";
import Image from "next/image";
import { saveSection, deleteSection, saveBanner, deleteBanner, addHeroSlides, updateHeroSlide, deleteHeroSlide } from "@/app/actions/admin-content";
import { PageHeader, Notice, Field, TextArea, Check } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";

const Sel = ({ name, label, value, opts }) => <Field label={label} name={name}><select id={name} name={name} defaultValue={value} className="input">{opts.map((o) => <option key={o}>{o}</option>)}</select></Field>;
function SectionForm({ s }) {
  return (
    <form action={saveSection.bind(null, s?.id ?? null)} className="grid gap-3 sm:grid-cols-2">
      <Sel name="type" label="Type" value={s?.type ?? "hero"} opts={HOME_SECTION_TYPES} /><Field label="Order" name="sortOrder" type="number" min="0" defaultValue={s?.sortOrder ?? 0} />
      <Field label="Title" name="title" defaultValue={s?.title} /><Field label="Subtitle" name="subtitle" defaultValue={s?.subtitle} />
      <div className="sm:col-span-2"><TextArea label="Body" name="body" defaultValue={s?.body} rows={2} /></div>
      <div className="sm:col-span-2"><TextArea label="Config (JSON)" name="config" defaultValue={s?.config} rows={3} hint='hero: {"interval":3,"primaryLabel":"…","primaryHref":"/search","secondaryLabel":"…","secondaryHref":"/…"} · categories: (no config) · trending: {"limit":8} (products flagged Trending) · products: {"category":"slug","limit":8} · featured_product: {"product":"fan"} · reviews: {"group":"clip-fan"} · trust: {"items":["Text", {"icon":"truck","text":"Text"}]} (icons: card, truck, support, shield, repeat, check) · how_it_works: {"steps":[["Title","Text"]]}' /></div>
      <Check label="Visible" name="visible" defaultChecked={s ? s.visible : true} /><button className="btn-primary px-4 py-2">{s ? "Save section" : "Add section"}</button>
    </form>
  );
}

function BannerForm({ b }) {
  return (
    <form action={saveBanner.bind(null, b?.id ?? null)} className="grid gap-3 sm:grid-cols-2">
      <Sel name="placement" label="Placement" value={b?.placement ?? "HOME_HERO"} opts={BANNER_PLACEMENTS} /><Field label="Order" name="sortOrder" type="number" min="0" defaultValue={b?.sortOrder ?? 0} />
      <Field label="Title" name="title" defaultValue={b?.title} /><Field label="Subtitle" name="subtitle" defaultValue={b?.subtitle} />
      <Field label="Button label" name="ctaLabel" defaultValue={b?.ctaLabel} /><Field label="Button link (/path or https://)" name="ctaHref" defaultValue={b?.ctaHref} />
      <Field label="Image" name="image" type="file" accept="image/jpeg,image/png,image/webp" /><Check label="Published" name="published" defaultChecked={b ? b.published : true} />
      <button className="btn-primary px-4 py-2 sm:col-span-2">{b ? "Save banner" : "Add banner"}</button>
    </form>
  );
}

export default async function Homepage({ searchParams }) {
  await requireAdmin();
  const [sections, banners, slides] = await Promise.all([prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } }), prisma.banner.findMany({ where: { placement: { not: "HOME_HERO" } }, orderBy: { sortOrder: "asc" } }), prisma.banner.findMany({ where: { placement: "HOME_HERO" }, orderBy: { sortOrder: "asc" } })]);
  return (
    <>
      <PageHeader title="Homepage" /><Notice searchParams={await searchParams} />
      <section className="card mb-8 p-4"><h2 className="mb-1 text-lg font-semibold">Hero images</h2>
        <p className="mb-4 text-sm text-muted">These appear in the rounded image card beside the hero text and change automatically (interval: hero section config <code>{`{"interval":5}`}</code> seconds). Lower order number shows first. Square images work best (JPEG/PNG/WebP, max 3 MB each, up to 10 images).</p>
        {slides.length === 0 ? <p className="mb-4 text-sm">No hero images yet — a plain green card is shown.</p> : (
          <ul className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{slides.map((b) => (
            <li key={b.id} className="space-y-2 rounded-card border border-line p-3">
              <div className="relative aspect-square overflow-hidden rounded-btn bg-surface">{b.image && <Image src={b.image} alt={b.title || "Hero image"} fill sizes="240px" className="object-cover" />}</div>
              <form action={updateHeroSlide.bind(null, b.id)} className="space-y-2"><Field label="Alt text" name="alt" defaultValue={b.title} /><Field label="Order" name="sortOrder" type="number" min="0" defaultValue={b.sortOrder} className="input w-24" /><Check label="Show on homepage" name="published" defaultChecked={b.published} /><button className="btn-outline w-full px-3 py-1.5 text-sm">Save</button></form>
              <form action={deleteHeroSlide.bind(null, b.id)}><ConfirmButton message="Delete this hero image?">Delete</ConfirmButton></form></li>))}</ul>)}
        <form action={addHeroSlides} className="flex flex-wrap items-end gap-3"><Field label="Add images (select several)" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required /><Field label="Alt text (optional)" name="alt" /><button className="btn-primary">Upload</button></form></section>
      <h2 className="mb-2 text-lg font-semibold">Sections</h2>
      <details className="card mb-3 p-4"><summary className="cursor-pointer font-medium">Add section</summary><div className="mt-3"><SectionForm /></div></details>
      <div className="space-y-3">{sections.map((s) => (<details key={s.id} className="card p-4"><summary className="cursor-pointer"><b>{s.type}</b> · {s.title || "—"} · order {s.sortOrder} {!s.visible && "(hidden)"}</summary><div className="mt-3 space-y-2"><SectionForm s={s} /><form action={deleteSection.bind(null, s.id)}><ConfirmButton message="Delete this section?">Delete</ConfirmButton></form></div></details>))}</div>
      <h2 className="mb-2 mt-8 text-lg font-semibold">Banners</h2><p className="mb-2 text-sm text-muted">Other placements (HOME_PROMO, CATEGORY) are stored but not rendered yet. Hero images are managed above.</p>
      <details className="card mb-3 p-4"><summary className="cursor-pointer font-medium">Add banner</summary><div className="mt-3"><BannerForm /></div></details>
      <div className="space-y-3">{banners.map((b) => (<details key={b.id} className="card p-4"><summary className="cursor-pointer">{b.placement} · {b.title || "—"}</summary><div className="mt-3 space-y-2"><BannerForm b={b} /><form action={deleteBanner.bind(null, b.id)}><ConfirmButton message="Delete this banner?">Delete</ConfirmButton></form></div></details>))}</div>
    </>
  );
}
