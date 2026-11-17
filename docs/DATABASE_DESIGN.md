# Database design (SQLite + Prisma)

Schema: `prisma/schema.prisma`. SQLite lacks native enums/JSON in this setup, so enum-like columns are strings validated in `src/lib/constants.js`; JSON blobs are stored as text.

| Model | Purpose |
|---|---|
| Admin, AdminSession | Admin login. Session cookie holds a random token; only its SHA-256 is stored. |
| Category | `zikr-rings` etc. Products may belong to one (nullable; deleting a category un-assigns, but the admin UI blocks deletion while products exist). |
| Product | Slug = original top-level URL (`/barakah`). BDT integers. `compareAtPrice` for struck-through price, `deliveryCharge` null = confirmed after order, `stockMode` UNLIMITED/TRACKED/PREORDER/OUT_OF_STOCK, qty limits, advance-payment toggle. |
| ProductImage / ProductVariant / ProductSpec / ProductBenefit | Gallery, color/size options (with optional price delta and stock), spec table, benefits. Cascade on product delete. |
| OrderFormField | **Per-product configurable order form**: key, label, type, required, enabled, options, order. Types: text, textarea, tel, number, select, variant_color, variant_size, checkbox. |
| FAQ (m2m Product) | `isGlobal` shows on the homepage; linked products show it on their page. |
| Review | PENDING/APPROVED/REJECTED; only APPROVED shows publicly. No auto-generated reviews. |
| Order / OrderItem / OrderStatusHistory | Order stores customer data, answers snapshot (`fieldValues`), totals, payment fields, admin note. OrderItem snapshots name/slug/variant/price (product FK is SetNull so history survives deletion). |
| SiteSetting | key/value site settings. |
| Banner, HomeSection | Admin-ordered, toggleable homepage content. |

## Order creation (src/lib/order.js)
Server loads the product and its form, validates every answer against the field definitions, validates variants, computes price from DB values, conditionally decrements stock inside one transaction, creates Order+OrderItem+history, and enforces idempotency with a unique `idempotencyKey` (client UUID per form mount).

## Indexes
Orders: (status, createdAt), phone, name, paymentStatus, createdAt. Products: (categoryId, published, sortOrder). Reviews: (status, productId).

## Migrations
Not generated yet because the authoring sandbox cannot run Prisma. Run `npx prisma migrate dev --name init` once; commit `prisma/migrations/`.
