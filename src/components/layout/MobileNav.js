"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function MobileNav({ links, siteName }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);
  return (
    <div className="md:hidden">
      <button type="button" aria-label="মেনু খুলুন" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)} className="rounded p-2">
        <Menu aria-hidden />
      </button>
      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="মেনু" className="fixed inset-0 z-50 bg-white">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <span className="text-xl font-bold text-brand">{siteName}</span>
            <button type="button" aria-label="মেনু বন্ধ করুন" onClick={() => setOpen(false)} className="rounded p-2"><X aria-hidden /></button>
          </div>
          <ul className="overflow-y-auto p-4" style={{ maxHeight: "calc(100dvh - 4rem)" }}>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`block rounded-btn px-3 py-3 text-lg ${path === l.href ? "bg-brand-soft font-semibold text-brand" : ""} ${l.sub ? "pl-7 text-base" : ""}`}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
