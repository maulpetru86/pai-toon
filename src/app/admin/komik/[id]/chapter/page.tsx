import { COMIC_IDS } from "@/lib/static-params";
import AdminChapterPage from "./client-page";

export function generateStaticParams() {
  return COMIC_IDS.map((id) => ({ id }));
}

export default function Page() {
  return <AdminChapterPage />;
}
