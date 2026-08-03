"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface VerticalReaderProps {
  /** Array URL halaman komik (urutan = nomor halaman) */
  pages: string[];
  chapterTitle: string;
}

export function VerticalReader({ pages, chapterTitle }: VerticalReaderProps) {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefetched = useRef<Record<number, boolean>>({});

  const handlePageLoad = (index: number) => {
    setLoadedPages((prev) => new Set(prev).add(index));
  };

  useEffect(() => {
    const root = null;
    const options: IntersectionObserverInit = {
      root,
      rootMargin: "400px 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    const observer = new IntersectionObserver((entries) => {
      let maxRatio = 0;
      let maxIndex = currentIndex;
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        const idx = Number(el.dataset.pageIndex);
        if (entry.isIntersecting) {
          setVisiblePages((prev) => new Set(prev).add(idx));

          // Prefetch next page image
          const nextIdx = idx + 1;
          if (nextIdx < pages.length && !prefetched.current[nextIdx]) {
            const img = new window.Image();
            img.src = pages[nextIdx];
            prefetched.current[nextIdx] = true;
          }
        }

        // determine most visible page for progress
        if (entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          maxIndex = idx;
        }
      });
      setCurrentIndex(maxIndex);
    }, options);

    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll('[data-page-index]')) as HTMLElement[];
    items.forEach((it) => observer.observe(it));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header + progress */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-sm border-b border-border/40 px-4 py-2 mb-2">
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground text-center">
            {chapterTitle} — {pages.length} halaman
          </p>
          <div className="h-1 bg-border rounded mt-2 w-full">
            <div
              className="h-1 bg-primary rounded"
              style={{ width: `${Math.round(((currentIndex + 1) / pages.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pages */}
      <div className="space-y-0" ref={containerRef}>
        {pages.map((pageUrl, index) => (
          <div key={index} data-page-index={index} className="relative w-full">
            {!loadedPages.has(index) && <Skeleton className="absolute inset-0 aspect-[3/4]" />}

            {visiblePages.has(index) || loadedPages.has(index) ? (
              <Image
                src={pageUrl}
                alt={`${chapterTitle} - Halaman ${index + 1}`}
                width={800}
                height={1200}
                className="w-full h-auto"
                onLoad={() => handlePageLoad(index)}
                loading={index <= 1 ? "eager" : "lazy"}
                quality={85}
              />
            ) : (
              // lightweight placeholder until the page is near viewport
              <div style={{ paddingTop: "133.33%" }} />
            )}
          </div>
        ))}
      </div>

      {/* End marker */}
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <div className="h-px w-16 bg-border" />
        <p className="text-sm">Selesai — {chapterTitle}</p>
        <div className="h-px w-16 bg-border" />
      </div>
    </div>
  );
}
