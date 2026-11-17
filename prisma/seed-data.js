// Electronics-store seed. Structure and neutral copy only — NO products, prices, specs or reviews are invented.
// Add real products in /admin-dashboard/products. Contact details/social links were read from sukunmart.com's footer.

const categories = [
  ["mobile-accessories", "মোবাইল ও অ্যাক্সেসরিজ"],
  ["audio", "অডিও (হেডফোন ও স্পিকার)"],
  ["smart-gadgets", "স্মার্ট গ্যাজেট"],
  ["computer-accessories", "কম্পিউটার ও ল্যাপটপ অ্যাক্সেসরিজ"],
  ["power-charging", "পাওয়ার ও চার্জিং"],
  ["home-electronics", "হোম ইলেকট্রনিক্স"],
];

const faqs = [
  { q: "ক্যাশ অন ডেলিভারি কি পাওয়া যায়?", a: "হ্যাঁ, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি আছে। পণ্য হাতে পাওয়ার পর পেমেন্ট করুন।", global: true },
];

const settings = {
  siteName: "SUKUN", tagline: "Electronics Store",
  footerText: "আপনার পছন্দের ইলেকট্রনিক্স পণ্য, সহজ অর্ডার ও ক্যাশ অন ডেলিভারিতে।",
  contactPhone: "+880 1901 465431",
  address: "Chowdhury House, 623/1019, Poshchimpar Askardighi, Chattogram, Bangladesh 4000",
  facebookUrl: "https://www.facebook.com/Sukunforeasyliving", whatsappUrl: "https://wa.me/8801901465431", messengerUrl: "https://m.me/Sukunforeasyliving",
  deliveryInfo: "ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ডেলিভারি",
  seoTitle: "SUKUN — ইলেকট্রনিক্স পণ্য | বাংলাদেশ",
  seoDescription: "মোবাইল অ্যাক্সেসরিজ, অডিও, স্মার্ট গ্যাজেটসহ ইলেকট্রনিক্স পণ্য। ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে।",
};

const homeSections = [
  { type: "hero", title: "আপনার প্রয়োজনের ইলেকট্রনিক্স, এক জায়গায়", subtitle: "ইলেকট্রনিক্স স্টোর", body: "পছন্দের পণ্য বেছে নিন, ফর্ম পূরণ করে অর্ডার করুন — ক্যাশ অন ডেলিভারি।", config: { interval: 5, primaryLabel: "পণ্য দেখুন", primaryHref: "/search" } },
  { type: "trust", config: { items: ["ক্যাশ অন ডেলিভারি", "সারা বাংলাদেশে ডেলিভারি", "সহজ অনলাইন অর্ডার", "ফোন ও হোয়াটসঅ্যাপে সাপোর্ট"] } },
  { type: "categories", title: "ক্যাটাগরি", subtitle: "পছন্দের ক্যাটাগরি থেকে পণ্য খুঁজুন" },
  { type: "trending", title: "Trending Products", subtitle: "এই মুহূর্তে সবচেয়ে জনপ্রিয় পণ্যগুলো", config: { limit: 8 } },
  { type: "products", title: "সব পণ্য", config: { limit: 8 } },
  { type: "how_it_works", title: "কিভাবে অর্ডার করবেন", config: { steps: [["পণ্য বেছে নিন", "সার্চ করুন অথবা ক্যাটাগরি থেকে পণ্য খুলুন"], ["ফর্ম পূরণ করুন", "নাম, মোবাইল নম্বর ও ঠিকানা দিয়ে অর্ডার নিশ্চিত করুন"], ["ক্যাশ অন ডেলিভারি", "আমরা যোগাযোগ করে নিশ্চিত করব, পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন"]] } },
  { type: "faq", title: "সাধারণ প্রশ্নোত্তর" },
  { type: "cta", title: "আপনার পছন্দের পণ্যটি খুঁজে নিন", subtitle: "ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ডেলিভারি" },
];

module.exports = { categories, faqs, settings, homeSections };
