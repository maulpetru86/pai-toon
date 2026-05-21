"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface VerticalReaderProps {
  /** Array URL halaman komik (urutan = nomor halaman) */
  pages: string[];
  chapterTitle: string;
}

export function VerticalReader({ pages, chapterTitle }: VerticalReaderProps) {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());

  const handlePageLoad = (index: number) => {
    setLoadedPages((prev) => new Set(prev).add(index));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-sm border-b border-border/40 px-4 py-2 mb-2">
        <p className="text-xs text-muted-foreground text-center">
          {chapterTitle} — {pages.length} halaman
        </p>
      </div>

      {/* Pages */}
      <div className="space-y-0">
        {pages.map((pageUrl, index) => (
          <div key={index} className="relative w-full">
            {!loadedPages.has(index) && (
              <Skeleton className="absolute inset-0 aspect-[3/4]" />
            )}
            <Image
              src={pageUrl}
              alt={`${chapterTitle} - Halaman ${index + 1}`}
              width={800}
              height={1200}
              className="w-full h-auto"
              onLoad={() => handlePageLoad(index)}
              loading={index <= 2 ? "eager" : "lazy"}
              quality={85}
            />
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
