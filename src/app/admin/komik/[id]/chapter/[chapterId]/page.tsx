import { MOCK_COMICS, MOCK_CHAPTERS } from "@/lib/mock-data";
import AdminEditChapterPage from "./client-page";

export function generateStaticParams() {
  const params: { id: string; chapterId: string }[] = [];
  for (const comic of MOCK_COMICS) {
    const chapters = MOCK_CHAPTERS[comic.slug] || [];
    for (const ch of chapters) {
      params.push({
        id: comic.id,
        chapterId: ch.id,
      });
    }
  }
  return params;
}

export default function Page() {
  return <AdminEditChapterPage />;
}
