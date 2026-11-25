import "./globals.css";
import { Hind_Siliguri } from "next/font/google";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";

const font = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

export async function generateMetadata() {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seoTitle || s.siteName, template: `%s | ${s.siteName}` },
    description: s.seoDescription || undefined,
    icons: s.logo ? { icon: s.logo, shortcut: s.logo, apple: s.logo } : undefined,
    openGraph: { siteName: s.siteName, locale: "bn_BD", type: "website" },
  };
}
export const viewport = { themeColor: "#2E7D32", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}
