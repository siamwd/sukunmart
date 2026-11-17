# Website research — https://sukunmart.com/

Research date: 2026-11-14. Method: `web_fetch` on the live site + web search. **Coverage is partial** — see "Blocked" below.

## Verified (read directly from the live pages)
**Homepage (`/`)** and **`/barakah`** were fetched successfully.
- Brand: SUKUN — "For Easy Living", Chattogram, Bangladesh. Language: Bangla. `theme-color` meta: `#2E7D32`. Currency BDT (৳, Bangla digits).
- Routes linked from the homepage: `/zikr-rings`, `/barakah`, `/essential`, `/smart`, `/rahma`, `/lamsa`, `/hidayah`, `/fan`, `/privacy-policy`, `/terms`.
- Products, prices, colors/sizes, badges and homepage bullets: encoded in `prisma/seed-data.js` (single source of truth for seeded facts).
- `/barakah`: model SXH5136, 6 gallery images, spec table, 6 benefits, 7 FAQs, important-info notice (battery not replaceable; no warranty; imported from China), delivery charge not included in ৳430 and confirmed after ordering, bulk-order copy. All seeded verbatim.
- Homepage FAQs (ring basics, size, COD, delivery time, fan safety, fan battery), "how it works" 3 steps, Clip Fan reviews (3, attributed), contact block, footer tagline. Seeded.

## Blocked / not inspected
The fetch tool refused every other URL ("not in any prior search or fetch result"), including `/essential`, `/smart`, `/rahma`, `/lamsa`, `/hidayah`, `/fan`, `/zikr-rings`, `/terms`, `/privacy-policy`. Searches did not return those pages.
- **Per-product detail** for Essential, Smart, Rahma, Lamsa, Hidayah, Fan: only homepage-level facts known. Descriptions, specs, galleries, FAQs, reviews are **unverified/empty** — fill in via the admin dashboard.
- **`/zikr-rings` comparison table**, **`/terms`** and **`/privacy-policy`** text: not read. The app ships clearly-marked editable placeholders, not invented policy text.
- **Order form**: field list and payment rules for each product were **not visible** in fetched text. Barakah copy says staff confirm color, delivery charge and address after the order, and checkout is cash on delivery. Seeded forms (name, phone, address required; color/size/notes optional) are **assumed defaults**, editable per product in admin.
- **Visual design** (fonts, spacing, shadows, animation, breakpoints): not observable via text fetch. Only the green theme color is verified. Tokens in `globals.css` are provisional and must be compared against the live site in a browser.
- **Images**: not downloaded (sandbox has no network; reuse permission unknown). Upload your own via admin. No hotlinking.

## Conflicting data
A search-engine cached copy of the homepage showed an older catalogue (a "Noor" ring at ৳1,450, Clip Fan at ৳1,099, four models). The live fetch showed seven models and Fan at ৳899 (was ৳1,199). The live fetch is used; recheck prices before launch.

## Ambiguous, not seeded
Two ring-section reviews on the homepage (Facebook screenshot + text) could not be attributed reliably; omitted. Seeded Clip Fan reviews are `PENDING` — approve only if you have the right to reuse them.
