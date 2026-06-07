import { COMIC_IDS } from "@/lib/static-params";
import AdminEditKomikPage from "./client-page";

export function generateStaticParams() {
  return COMIC_IDS.map((id) => ({ id }));
}

export default function Page() {
  return <AdminEditKomikPage />;
}
