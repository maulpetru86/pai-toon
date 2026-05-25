"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Route alternatif: /komik/[slug]/[chapterId]
 * Redirect ke reader utama: /baca/[slug]/[chapterNumber]
 */
export default function KomikChapterRedirect() {
  const params = useParams<{ slug: string; chapterId: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/baca/${params.slug}/${params.chapterId}`);
  }, [params.slug, params.chapterId, router]);

  return null;
}
