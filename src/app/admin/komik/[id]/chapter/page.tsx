import { MOCK_COMICS } from "@/lib/mock-data";
import AdminChapterPage from "./client-page";

export function generateStaticParams() {
  return MOCK_COMICS.map((comic) => ({
    id: comic.id,
  }));
}

export default function Page() {
  return <AdminChapterPage />;
}
