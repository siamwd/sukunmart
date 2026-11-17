import HomeSections from "@/components/home/HomeSections";
import { siteUrl } from "@/lib/utils";

export const metadata = { alternates: { canonical: siteUrl() } };
export const dynamic = "force-dynamic"; // content is admin-editable; always read fresh from SQLite

export default function Home() {
  return <HomeSections />;
}
