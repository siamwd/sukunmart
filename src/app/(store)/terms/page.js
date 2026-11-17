import { getSettings } from "@/lib/settings";

export const metadata = { title: "শর্তাবলী" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await getSettings();
  const text = s.termsContent;
  return (
    <div className="container-page section max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">শর্তাবলী</h1>
      {text ? <div className="whitespace-pre-line leading-relaxed">{text}</div> : (
        <p className="card p-5 text-muted">এই পৃষ্ঠার লেখা এখনো যোগ করা হয়নি। মূল সাইটের লেখা যাচাই করা যায়নি, তাই কিছু বানানো হয়নি। অ্যাডমিন ড্যাশবোর্ডের Settings থেকে লেখা যোগ করুন।</p>
      )}
    </div>
  );
}
