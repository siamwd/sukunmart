import { getSettings } from "@/lib/settings";

export const metadata = { title: "গোপনীয়তা নীতি" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await getSettings();
  const text = s.privacyContent;
  return (
    <div className="container-page section max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">গোপনীয়তা নীতি</h1>
      {text ? <div className="whitespace-pre-line leading-relaxed">{text}</div> : (
        <p className="card p-5 text-muted">এই পৃষ্ঠার লেখা এখনো যোগ করা হয়নি। মূল সাইটের লেখা যাচাই করা যায়নি, তাই কিছু বানানো হয়নি। অ্যাডমিন ড্যাশবোর্ডের Settings থেকে লেখা যোগ করুন।</p>
      )}
    </div>
  );
}
