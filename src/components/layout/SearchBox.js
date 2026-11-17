"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { formatBDT } from "@/lib/utils";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const d = await r.json();
        setResults(d.results || []);
        setOpen(true);
      } catch (e) { if (e.name !== "AbortError") setResults([]); }
      finally { setLoading(false); }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  useEffect(() => {
    const away = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const showList = open && q.trim().length >= 2;
  return (
    <div ref={box} className="relative w-full" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      {/* Plain GET form: works without JavaScript too */}
      <form action="/search" method="GET" role="search" className="flex">
        <label htmlFor="site-search" className="sr-only">পণ্য খুঁজুন</label>
        <input id="site-search" name="q" type="search" value={q} autoComplete="off" maxLength={100}
          onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} placeholder="পণ্য খুঁজুন…"
          aria-expanded={showList} aria-controls="search-results"
          className="w-full rounded-l-btn border border-r-0 border-line bg-white px-3 py-2 text-sm focus:border-brand" />
        <button type="submit" aria-label="সার্চ করুন" className="rounded-r-btn bg-brand px-3 text-white hover:bg-brand-dark"><Search size={18} aria-hidden /></button>
      </form>
      {showList && (
        <div id="search-results" className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-card border border-line bg-white shadow-lg">
          {loading && results.length === 0 ? <p className="p-3 text-sm text-muted">খোঁজা হচ্ছে…</p>
            : results.length === 0 ? <p className="p-3 text-sm text-muted">কিছু পাওয়া যায়নি</p>
            : (<ul>{results.map((r) => (
              <li key={r.slug}><Link href={`/${r.slug}`} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-brand-soft">
                <span className="flex min-w-0 items-center gap-2">
                  {r.featuredImage ? <img src={r.featuredImage} alt="" className="h-9 w-9 shrink-0 rounded object-cover" /> : <span className="h-9 w-9 shrink-0 rounded bg-surface" />}
                  <span className="truncate">{r.name}</span></span>
                <b className="shrink-0 text-brand">{formatBDT(r.price)}</b></Link></li>))}
              <li className="border-t border-line"><Link href={`/search?q=${encodeURIComponent(q.trim())}`} onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-brand">সব ফলাফল দেখুন →</Link></li></ul>)}
        </div>
      )}
    </div>
  );
}
