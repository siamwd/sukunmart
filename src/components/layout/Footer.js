import Link from "next/link";
import { Phone, MapPin, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const [s, cats] = await Promise.all([getSettings(), prisma.category.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, take: 6, select: { slug: true, name: true } })]);
  const social = [["Facebook", s.facebookUrl], ["WhatsApp", s.whatsappUrl], ["Messenger", s.messengerUrl]].filter(([, u]) => u);
  const a = "hover:text-white hover:underline";
  return (
    <footer className="mt-16 bg-[#10291a] text-white/75">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="text-2xl font-bold tracking-wide text-white">{s.siteName}</p>
          {s.tagline ? <p className="text-sm text-white/60">{s.tagline}</p> : null}
          {s.footerText ? <p className="mt-4 max-w-xs text-sm">{s.footerText}</p> : null}
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">যোগাযোগ</p>
          <ul className="space-y-2.5 text-sm">
            {s.contactPhone && <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" aria-hidden /><a className={a} href={`tel:${s.contactPhone.replace(/\s/g, "")}`}>{s.contactPhone}</a></li>}
            {s.contactEmail && <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" aria-hidden /><a className={a} href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></li>}
            {s.address && <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />{s.address}</li>}
          </ul>
          {social.length > 0 && <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">{social.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer" className={`${a} underline`}>{n}</a>)}</p>}
        </div>
        <div>
          <p className="mb-3 font-semibold text-white">লিংক</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link className={a} href="/search">সব পণ্য</Link></li>
            {cats.map((c) => <li key={c.slug}><Link className={a} href={`/${c.slug}`}>{c.name}</Link></li>)}
            <li><Link className={a} href="/privacy-policy">গোপনীয়তা নীতি</Link></li>
            <li><Link className={a} href="/terms">শর্তাবলী</Link></li>
          </ul>
          {s.deliveryInfo ? <p className="mt-4 text-sm text-white/60">{s.deliveryInfo}</p> : null}
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} {s.siteName}</p>
    </footer>
  );
}
