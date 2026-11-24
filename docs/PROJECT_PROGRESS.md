# Project progress

## Stage 1 — Foundations (DONE, UNTESTED)
- [x] package.json, .env.example, .gitignore, Next/Tailwind/PostCSS/jsconfig config
- [x] prisma/schema.prisma (all models), prisma/seed.js + seed-data.js (verified-only)
- [x] src/lib: prisma, constants, utils, validation, rate-limit, auth, settings, uploads, order
- [x] scripts/create-admin.js
- [x] docs: WEBSITE_RESEARCH.md, DATABASE_DESIGN.md

## Stage 2 — Public site (DONE, UNTESTED)
- [x] globals.css tokens, root layout, header + desktop dropdown + mobile nav, footer
- [x] homepage (HomeSection-driven), `[slug]` route (product or category incl. /zikr-rings, /fan), gallery, order form + server action, order confirmation (masked phone, no address)
- [x] /terms, /privacy-policy (text from Settings; placeholder until entered), 404, sitemap, robots
- Not done: variant-specific gallery images, payment-screenshot upload field on public form, client-side field-level focus on error.

## Stage 3 — Admin (DONE, UNTESTED)
- [x] /admin-login, session auth, layout+nav, shared UI helpers, Overview (real DB stats)
- [x] Orders: list (search/filter/date/pagination), detail, status+history, payment, delivery charge, internal note
- [x] Categories CRUD (+image upload, blocks delete while products exist)
- [x] Products CRUD: details, images (upload/featured/delete), variants, specs, benefits, per-product order-form builder, stock modes
- [x] FAQs (m2m to products, homepage flag), Reviews (approve/reject/CRUD, screenshot), Homepage sections + banners, Settings (incl. terms/privacy text, logo)

## Stage 4 — Docs/handoff (DONE)
- [x] README.md, .env.example, .eslintrc.json, create-admin script

## Stage 5 — Electronics conversion (DONE, UNTESTED)
- [x] Seed switched to electronics categories (no products); ring/fan-specific code and links removed
- [x] Hero background image editable from admin; hero reads first published HOME_HERO banner
- [x] `categories` home section above products; categories dropdown in navbar/footer
- [x] Navbar search (center) + /search page + /api/search (rate-limited, public fields only)
- Search uses Prisma `contains` with case-insensitive matching on PostgreSQL.

## Stage 6 — Hero redesign, Trending, ordering, design polish (DONE, UNTESTED)
- [x] Split hero + auto-rotating multi-image card (HeroSlider), admin multi-image manager (HOME_HERO banners)
- [x] Trust strip with icon circles (items from config)
- [x] Trending Products section + Product.isTrending/trendingOrder; admin "Order & trending" page + fields on product form
- [x] Design tokens/cards/buttons/footer/product card refreshed; section headings with accent bar
- Schema changed: new migration needed (see README).

## Verification actually performed
- TypeScript parser syntax pass over every src/*.js(x) file: no syntax errors.
- seed-data.js loads in Node.
- NOT performed: npm install, prisma validate/migrate/generate, next build, lint, any runtime or browser test, responsive check at 375/390/768/1024/1440.

## Remaining / next steps
1. Run the README setup; fix whatever `npm install`/`prisma validate`/`next build` report (dependency versions are from memory).
2. Commit `prisma/migrations/` after `npx prisma migrate dev --name init`.
3. Render non-hero banners on the homepage; per-variant gallery images; payment-screenshot upload on the public order form (schema has `paymentScreenshot`); focus first invalid field on error.
4. Fill unverified content in admin: other products' descriptions/specs/FAQs, /zikr-rings comparison, Terms/Privacy text, images (with permission), order-form fields to match the real shop.
5. Compare visuals with the live site in a browser; adjust tokens in `src/app/globals.css`, fonts in `src/app/layout.js`.
6. Manual test checklist: public routes, order success/invalid/duplicate, stock decrement, admin auth + CRUD, uploads, `curl` an admin URL while logged out.

## Known issues / limitations
- Nothing has been executed (see above). Possible issues to watch: Prisma client accessor for model FAQ is `prisma.fAQ`; `has-[:checked]` needs Tailwind >= 3.4; `next/image` for admin-uploaded files needs the dev server/`next start` (not static export).
- Migrations not generated; images not shipped; original order form/legal pages/most product pages not inspectable (docs/WEBSITE_RESEARCH.md).
- In-memory rate limiting; local-disk uploads.
- No `/api/uploads` route handler (uploads use Server Actions).
- Quality-gate items for build, tests, mobile verification are NOT satisfied yet.
