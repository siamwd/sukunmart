export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
export const ORDER_STATUS_LABELS = {
  PENDING: "Pending", CONFIRMED: "Confirmed", PROCESSING: "Processing",
  SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled",
};
export const PAYMENT_STATUSES = ["UNPAID", "PARTIAL", "PAID", "REFUNDED"];
export const STOCK_MODES = ["UNLIMITED", "TRACKED", "PREORDER", "OUT_OF_STOCK"];
export const STOCK_MODE_LABELS = {
  UNLIMITED: "In stock", TRACKED: "In stock (tracked)", PREORDER: "Pre-order", OUT_OF_STOCK: "Out of stock",
};
export const FIELD_TYPES = ["text", "textarea", "tel", "number", "select", "variant_color", "variant_size", "checkbox"];
export const VARIANT_TYPES = ["color", "size"];
export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"];
export const BANNER_PLACEMENTS = ["HOME_HERO", "HOME_PROMO", "CATEGORY"];
export const HOME_SECTION_TYPES = ["hero", "trust", "categories", "trending", "products", "featured_product", "how_it_works", "reviews", "faq", "cta"];
// Columns on Order that are filled from specific field keys.
export const CORE_FIELD_KEYS = {
  customerName: "customerName", customerPhone: "customerPhone", customerAddress: "customerAddress",
  district: "district", area: "area", notes: "customerNote",
};
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
