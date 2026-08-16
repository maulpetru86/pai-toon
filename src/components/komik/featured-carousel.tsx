"use client";

import { useEffect, useRef } from "react";
import { Comic } from "@/types";
import { ComicCard } from "./komik-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedCarouselProps {
  comics: Comic[];
}

export function FeaturedCarousel({ comics }: FeaturedCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoRef = useRef<number | null>(null);

  useEffect(() => {
    // autoplay: scroll every 5s
    const container = containerRef.current;
    if (!container) return;
    autoRef.current = window.setInterval(() => {
      container.scrollBy({ left: container.clientWidth / 2, behavior: "smooth" });
    }, 5000);

    return () => {
      if (autoRef.current) window.clearInterval(autoRef.current);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const amount = container.clientWidth / 2;
    container.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!comics || comics.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Featured</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {comics.map((c) => (
          <div key={c.id} className="min-w-[150px] w-[150px] sm:min-w-[180px] sm:w-[180px] md:w-[220px]">
            <ComicCard comic={c} />
          </div>
        ))}
      </div>
    </section>
  );
}
