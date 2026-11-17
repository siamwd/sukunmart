"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function NavLinks({ links }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const main = links.filter((l) => !l.sub);
  const subs = links.filter((l) => l.sub);
  const cls = (h) => `rounded px-3 py-2 text-sm font-medium hover:text-brand ${path === h ? "text-brand" : "text-ink"}`;
  return (
    <nav aria-label="প্রধান মেনু" className="hidden items-center gap-1 md:flex">
      {main.map((l) => <Link key={l.href} href={l.href} className={cls(l.href)} aria-current={path === l.href ? "page" : undefined}>{l.label}</Link>)}
      <div className="relative" onMouseLeave={() => setOpen(false)}>
        <button type="button" className={`${cls("")} inline-flex items-center gap-1`} aria-expanded={open} aria-haspopup="true"
          onClick={() => setOpen((o) => !o)} onMouseEnter={() => setOpen(true)} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
          ক্যাটাগরি <ChevronDown size={16} aria-hidden />
        </button>
        {open && subs.length > 0 && (
          <ul className="absolute right-0 top-full z-50 w-52 rounded-card border border-line bg-white p-2 shadow-lg">
            {subs.map((l) => (
              <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className={`block rounded px-3 py-2 text-sm hover:bg-brand-soft ${path === l.href ? "font-semibold text-brand" : ""}`}>{l.label}</Link></li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
