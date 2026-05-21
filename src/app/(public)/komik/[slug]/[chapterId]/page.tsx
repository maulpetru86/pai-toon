"use client";

import { useParams } from "next/navigation";
import { redirect } from "next/navigation";

/**
 * Route alternatif: /komik/[slug]/[chapterId]
 * Redirect ke reader utama: /baca/[slug]/[chapterNumber]
 */
export default function KomikChapterRedirect() {
  const params = useParams<{ slug: string; chapterId: string }>();

  // Redirect ke reader utama
  redirect(`/baca/${params.slug}/${params.chapterId}`);
}
