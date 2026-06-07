import { COMIC_SLUGS, PUBLISHED_CHAPTERS } from "@/lib/static-params";
import ReaderPage from "./client-page";

export function generateStaticParams() {
  const params: { comicSlug: string; chapterNumber: string }[] = [];
  for (const slug of COMIC_SLUGS) {
    const chapters = PUBLISHED_CHAPTERS[slug] || [];
    for (const chNum of chapters) {
      params.push({ comicSlug: slug, chapterNumber: String(chNum) });
    }
  }
  return params;
}

export default function Page() {
  return <ReaderPage />;
}
