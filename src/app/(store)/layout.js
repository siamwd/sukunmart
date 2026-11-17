import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function StoreLayout({ children }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">মূল অংশে যান</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
