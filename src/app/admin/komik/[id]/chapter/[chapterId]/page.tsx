import { COMIC_IDS, CHAPTER_IDS } from "@/lib/static-params";
import AdminEditChapterPage from "./client-page";

export function generateStaticParams() {
  const params: { id: string; chapterId: string }[] = [];
  for (const comicId of COMIC_IDS) {
    const chapters = CHAPTER_IDS[comicId] || [];
    for (const chId of chapters) {
      params.push({ id: comicId, chapterId: chId });
    }
  }
  return params;
}

export default function Page() {
  return <AdminEditChapterPage />;
}
