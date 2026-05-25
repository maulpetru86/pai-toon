import { MOCK_COMICS, MOCK_CHAPTERS } from "@/lib/mock-data";
import ReaderPage from "./client-page";

export function generateStaticParams() {
  const params: { comicSlug: string; chapterNumber: string }[] = [];
  for (const comic of MOCK_COMICS) {
    const chapters = MOCK_CHAPTERS[comic.slug] || [];
    for (const ch of chapters) {
      if (ch.isPublished) {
        params.push({
          comicSlug: comic.slug,
          chapterNumber: String(ch.chapterNumber),
        });
      }
    }
  }
  return params;
}

export default function Page() {
  return <ReaderPage />;
}
