import { siteUrl } from "@/lib/utils";
export default function robots() {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin-dashboard", "/admin-login", "/api/", "/order-confirmation/"] }], sitemap: `${siteUrl()}/sitemap.xml` };
}
