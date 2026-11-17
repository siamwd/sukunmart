import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import MobileNav from "./MobileNav";
import NavLinks from "./NavLinks";
import SearchBox from "./SearchBox";

export default async function Header() {
  const [s, cats] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);
  const links = [{ href: "/", label: "হোম" }, { href: "/search", label: "সব পণ্য" },
  ...cats.map((c) => ({ href: `/${c.slug}`, label: c.name, sub: true }))];
  const [firstWord, ...otherWords] = String(s.siteName || "").trim().split(/\s+/);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 shadow-sm backdrop-blur-md">
      {s.announcement ? <p className="bg-brand px-4 py-1.5 text-center text-sm text-white">{s.announcement}</p> : null}
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 md:flex-nowrap md:py-0 md:h-16">
        <Link href="/" className="flex shrink-0 items-center  text-xl font-bold tracking-wide text-brand">
          {s.logo ? <img src={s.logo} alt="" className="h-14 w-auto max-w-[9rem] object-contain" /> : null}
          <span className="flex flex-col text-lg font-semibold font-serif uppercase  leading-none tracking-wide">
            <span className="text-black">{firstWord}</span>
            {otherWords.length > 0 && <span className="text-orange-500">{otherWords.join(" ")}</span>}
          </span>
        </Link>
        {/* Search sits in the middle on md+, and on its own full-width row on phones */}
        <div className="order-last w-full md:order-none md:mx-auto md:max-w-xl md:flex-1"><SearchBox /></div>
        <div className="flex shrink-0 items-center">
          <NavLinks links={links} />
          <MobileNav links={links} siteName={s.siteName} />
        </div>
      </div>
    </header>
  );
}
