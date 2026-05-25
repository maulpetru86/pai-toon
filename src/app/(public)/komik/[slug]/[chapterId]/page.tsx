import { MOCK_COMICS, MOCK_CHAPTERS } from "@/lib/mock-data";
import KomikChapterRedirect from "./client-page";

export function generateStaticParams() {
  const params: { slug: string; chapterId: string }[] = [];
  for (const comic of MOCK_COMICS) {
    const chapters = MOCK_CHAPTERS[comic.slug] || [];
    for (const ch of chapters) {
      if (ch.isPublished) {
        params.push({
          slug: comic.slug,
          chapterId: String(ch.chapterNumber),
        });
      }
    }
  }
  return params;
}

export default function Page() {
  return <KomikChapterRedirect />;
}
