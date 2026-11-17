# SUKUN — Next.js electronics store (started from the sukunmart.com clone)

Single Next.js (App Router, **JavaScript**) project: React, Tailwind CSS, Lucide, Prisma + **SQLite**. No cart, wishlist or customer accounts — customers order directly from each product page. Private admin at `/admin-dashboard/`.

> **Status: written but never executed.** The authoring environment had no network, so `npm install`, `prisma migrate`, `npm run build`, lint and tests have **not** been run. Files were only syntax-parsed. Expect to fix small issues on first run, and treat nothing here as "tested".

## Prerequisites
Node.js 20+ (22 recommended) and npm.

## Setup
```bash
npm install
cp .env.example .env          # edit values
npx prisma migrate dev --name init   # creates prisma/migrations + dev.db
npm run db:seed               # electronics categories + home sections + settings (no products)
npm run admin:create          # uses ADMIN_EMAIL / ADMIN_PASSWORD from .env (min 12 chars)
npm run dev                   # http://localhost:3000, admin at /admin-login
```
After creating the admin, remove `ADMIN_PASSWORD` from `.env`. Re-running `admin:create` for the same email resets the password and signs out its sessions.

## Commands
`npm run dev` · `npm run build` (runs `prisma generate` first) · `npm run start` · `npm run lint` · `npx prisma validate` · `npm run db:deploy` (apply migrations in production).

## Environment
| Var | Purpose |
|---|---|
| DATABASE_URL | `file:./dev.db` (relative to `prisma/`) |
| ADMIN_EMAIL / ADMIN_PASSWORD | only for `admin:create` |
| NEXT_PUBLIC_SITE_URL | canonical URLs, sitemap, OG |
| ADMIN_SESSION_HOURS | session lifetime (default 8) |

## What exists
- **Public:** `/` (admin-managed sections: hero with dynamic background image, category tiles, products…), `/search?q=` (navbar search + live suggestions via `/api/search`), `/<category-slug>`, `/<product-slug>`, `/terms`, `/privacy-policy`, `/order-confirmation/<orderNumber>`, 404, `sitemap.xml`, `robots.txt`.
- **Ordering:** per-product configurable form (admin → product → *Order form fields*). The server re-validates product, publish state, variants, quantity, stock, computes totals from DB prices, creates the order in a transaction with a unique order number and an idempotency key (double-submit returns the same order). Order lines snapshot name/variant/price.
- **Admin:** overview (live DB stats), orders (search, status/payment/date filters, pagination, status history, payment fields, delivery charge, notes), products (CRUD, image upload/gallery/featured, variants, specs, benefits, order-form builder, stock modes), categories (blocked delete while products exist), FAQs (assign to products/homepage), reviews (approve/reject), homepage sections + banners, website settings (incl. Terms/Privacy text, logo).
- **Security:** bcrypt (cost 12) hashes; random session token in an HTTP-only, SameSite=Lax cookie (Secure in production), only its SHA-256 stored; every admin page and Server Action calls `requireAdmin()`; Server Actions use Next's built-in Origin check; login rate limit (per IP and per email); order rate limit; uploads validated by magic bytes, size-capped (3 MB), server-generated filenames; React escapes output; confirmation page hides address/notes/IDs.

## Image uploads & backups
Uploads go to `public/uploads/<folder>/`; only paths are stored in SQLite. Back up **both** `prisma/*.db` and `public/uploads/`. Local-disk uploads and SQLite need a persistent disk: they will not survive on serverless/ephemeral hosts (use a VPS or a host with a persistent volume, or move uploads to object storage). Uploads are done through Server Actions, not an `/api/uploads` route.

## Deployment notes
Run `npm run build`, `npm run db:deploy`, `npm run start` behind HTTPS. Rate limiting is in-memory (single process). Run one instance, or swap `src/lib/rate-limit.js` for a shared store.

## Folder structure
`src/app/(store)` public routes · `src/app/admin-login` · `src/app/admin-dashboard` · `src/app/actions` Server Actions · `src/components` · `src/lib` (prisma, auth, order, validation, uploads, settings) · `prisma/` schema + seed · `scripts/create-admin.js` · `docs/`.

## Known limitations
See `docs/PROJECT_PROGRESS.md` and `docs/WEBSITE_RESEARCH.md`. Key ones: no images shipped; only the homepage and `/barakah` could be read from the original; order-form fields, legal text, most product detail and visual design are unverified placeholders to complete in admin; banners are managed but not yet rendered on the homepage; no payment-screenshot upload on the public form; no Prisma migration files until you run the first migrate.

## Electronics conversion
- Seed creates 6 starter categories (edit/rename/delete in admin) and **no products** — add real products, prices and images in `/admin-dashboard/products`.
- **Hero background:** Admin → Homepage → *Hero background image* (upload / remove). Stored as the first `HOME_HERO` banner.
- **Category section** (`categories` home section) sits above `products`. On an already-seeded database add it via Admin → Homepage → *Add section* (type `categories`, order lower than the products section), or reset with `npx prisma migrate reset` (**deletes all data**), then `npm run db:seed` and `npm run admin:create`.
- **Search:** centered in the navbar (own row on phones). Matches name, tagline, descriptions, model code and category name; empty query at `/search` lists all products.

## Hero, Trending and product order (latest changes)
- **Hero:** split layout (text left, rounded image card right). Add several images in Admin → Homepage → *Hero images*; they fade through automatically (interval via hero section config, default 5 s; pauses on hover; respects reduced-motion). Buttons come from the hero section config (`primaryLabel/primaryHref`, optional `secondaryLabel/secondaryHref`).
- **Trust strip** under the hero (COD, delivery, …): edit items in the `trust` section config; items can be plain text or `{"icon":"truck","text":"…"}`.
- **Trending Products** sits above *All products*. A product appears there when flagged *Trending*; the section hides itself if none are.
- **Positions (backend-controlled):** Admin → Products → *Order & trending* lets you set each product's **Position** (All products / category / search order) and **Trending position**; lower number first. Both are also on each product's edit page.
- **Schema changed** (`isTrending`, `trendingOrder` on Product). First setup: run `npx prisma migrate dev --name init`. If you already migrated: `npx prisma migrate dev --name trending`. For an already-seeded DB, add a `trending` section in Admin → Homepage (above *products*), or reset (`npx prisma migrate reset`, deletes data) and re-run seed + admin:create.
