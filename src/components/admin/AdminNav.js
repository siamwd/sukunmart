"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, Package, Tags, ShoppingBag, HelpCircle, Star, Home, Settings } from "lucide-react";

const ITEMS = [
  ["/admin-dashboard", "Overview", LayoutDashboard], ["/admin-dashboard/orders", "Orders", ShoppingBag],
  ["/admin-dashboard/products", "Products", Package], ["/admin-dashboard/categories", "Categories", Tags],
  ["/admin-dashboard/faqs", "FAQs", HelpCircle], ["/admin-dashboard/reviews", "Reviews", Star],
  ["/admin-dashboard/homepage", "Homepage", Home], ["/admin-dashboard/settings", "Settings", Settings],
];

export default function AdminNav({ logout }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (h) => (h === "/admin-dashboard" ? path === h : path.startsWith(h));
  const list = (
    <ul className="space-y-1 p-3">
      {ITEMS.map(([h, label, Icon]) => (
        <li key={h}><Link href={h} aria-current={active(h) ? "page" : undefined}
          className={`flex items-center gap-2 rounded-btn px-3 py-2 text-sm ${active(h) ? "bg-brand text-white" : "hover:bg-brand-soft"}`}><Icon size={16} aria-hidden />{label}</Link></li>
      ))}
      <li><Link href="/" target="_blank" className="block px-3 py-2 text-sm text-muted underline">View site</Link></li>
      <li>{logout}</li>
    </ul>
  );
  return (
    <>
      <div className="flex items-center justify-between border-b border-line bg-white p-3 lg:hidden">
        <b className="text-brand">Trendora Mart Admin</b>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle menu" className="rounded p-2">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav aria-label="Admin" className="border-b border-line bg-white lg:hidden">{list}</nav>}
      <nav aria-label="Admin" className="hidden w-56 shrink-0 border-r border-line bg-white lg:block"><p className="p-4 text-lg font-bold text-brand">Trendora Mart Admin</p>{list}</nav>
    </>
  );
}
