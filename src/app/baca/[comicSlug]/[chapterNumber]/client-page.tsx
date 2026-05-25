"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Home,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReaderCTA } from "@/components/komik/reader-cta";
import {
  getComicBySlug,
  getChapterByNumber,
  getChaptersByComicSlug,
} from "@/lib/mock-data";

export default function ReaderPage() {
  const params = useParams<{ comicSlug: string; chapterNumber: string }>();

  const comicSlug = params.comicSlug;
  const chapterNum = parseInt(params.chapterNumber, 10);

  const comic = getComicBySlug(comicSlug);
  const chapter = getChapterByNumber(comicSlug, chapterNum);
  const allChapters = getChaptersByComicSlug(comicSlug);

  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [showTopBar, setShowTopBar] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setShowTopBar(currentY < 100 || currentY < lastScrollY);
    setShowScrollTop(currentY > 800);
    setLastScrollY(currentY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  const publishedChapters = allChapters.filter((ch) => ch.isPublished);
  const currentIndex = publishedChapters.findIndex(
    (ch) => ch.chapterNumber === chapterNum
  );
  const prevChapter = currentIndex > 0 ? publishedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < publishedChapters.length - 1
      ? publishedChapters[currentIndex + 1]
      : null;

  if (!comic || !chapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold">Komik tidak ditemukan</p>
          <Link href="/komik">
            <Button variant="outline" className="gap-2 border-white/20 !bg-transparent !text-white hover:!bg-white/10">
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ════════ TOP BAR (auto-hide on scroll) ════════ */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showTopBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 flex items-center justify-between h-12">
            <Link
              href={`/komik/${comic.slug}`}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline truncate max-w-[200px]">
                {comic.title}
              </span>
            </Link>

            <div className="text-center">
              <p className="text-white text-xs font-medium">
                Ch. {chapter.chapterNumber} — {chapter.title}
              </p>
              <p className="text-white/40 text-[10px]">
                {chapter.pages.length} halaman
              </p>
            </div>

            <Link
              href={`/komik/${comic.slug}`}
              className="text-white/70 hover:text-white transition-colors"
            >
              <List className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ════════ VERTICAL READER (NO-GAP) ════════ */}
      <main className="pt-12">
        <div className="w-full max-w-3xl mx-auto">
          {chapter.pages.map((pageUrl, index) => (
            <div key={index} className="relative w-full">
              {!loadedImages.has(index) && (
                <div className="w-full aspect-[2/3] bg-zinc-900 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Skeleton className="h-8 w-8 rounded-full mx-auto bg-zinc-800" />
                    <p className="text-zinc-600 text-xs">
                      Memuat halaman {index + 1}...
                    </p>
                  </div>
                </div>
              )}
              <Image
                src={pageUrl}
                alt={`${chapter.title} - Halaman ${index + 1}`}
                width={800}
                height={1200}
                className="w-full h-auto block"
                style={{ margin: 0, padding: 0, display: "block" }}
                onLoad={() => handleImageLoad(index)}
                loading={index <= 2 ? "eager" : "lazy"}
                quality={90}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </main>

      {/* ════════ NAVIGASI CHAPTER (BOTTOM) ════════ */}
      <div className="bg-zinc-950 border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="h-px flex-1 bg-white/10" />
              <p className="text-white/40 text-xs whitespace-nowrap">
                Selesai — Ch. {chapter.chapterNumber}
              </p>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex items-center gap-3">
              {prevChapter ? (
                <Link
                  href={`/baca/${comic.slug}/${prevChapter.chapterNumber}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-white/20 !bg-transparent !text-white hover:!bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Ch. {prevChapter.chapterNumber}
                  </Button>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              <Link href={`/komik/${comic.slug}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/20 !bg-transparent !text-white hover:!bg-white/10"
                >
                  <List className="h-4 w-4" />
                </Button>
              </Link>

              {nextChapter ? (
                <Link
                  href={`/baca/${comic.slug}/${nextChapter.chapterNumber}`}
                  className="flex-1"
                >
                  <Button className="w-full gap-2 bg-saffron text-black hover:bg-saffron/90 font-semibold">
                    Ch. {nextChapter.chapterNumber}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex-1">
                  <Link href={`/komik/${comic.slug}`}>
                    <Button className="w-full gap-2">
                      Kembali ke Daftar
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════ CTA SOFT-REGISTRATION ════════ */}
      <ReaderCTA />

      {/* ════════ SCROLL TO TOP FAB ════════ */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
