import { COMIC_SLUGS, PUBLISHED_CHAPTERS } from "@/lib/static-params";
import KomikChapterRedirect from "./client-page";

export function generateStaticParams() {
  const params: { slug: string; chapterId: string }[] = [];
  for (const slug of COMIC_SLUGS) {
    const chapters = PUBLISHED_CHAPTERS[slug] || [];
    for (const chNum of chapters) {
      params.push({ slug, chapterId: String(chNum) });
    }
  }
  return params;
}

export default function Page() {
  return <KomikChapterRedirect />;
}
