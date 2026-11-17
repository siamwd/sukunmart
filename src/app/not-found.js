import Link from "next/link";
export const metadata = { title: "পৃষ্ঠাটি পাওয়া যায়নি" };
export default function NotFound() {
  return (
    <div className="container-page section text-center">
      <h1 className="text-3xl font-bold">পৃষ্ঠাটি পাওয়া যায়নি</h1>
      <p className="mt-2 text-muted">লিংকটি ভুল হতে পারে অথবা পণ্যটি আর নেই।</p>
      <Link href="/" className="btn-primary mt-6">হোমে ফিরে যান</Link>
    </div>
  );
}
