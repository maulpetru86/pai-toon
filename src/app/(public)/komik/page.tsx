"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star, Layers, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_COMICS, MOCK_CATEGORIES, getCategoryById } from "@/lib/mock-data";

export default function KatalogKomikPage() {
  const [activeCategory, setActiveCategory] = useState("semua");

  const filteredComics = useMemo(() => {
    if (activeCategory === "semua") return MOCK_COMICS;
    const cat = MOCK_CATEGORIES.find((c) => c.slug === activeCategory);
    if (!cat) return MOCK_COMICS;
    return MOCK_COMICS.filter((c) => c.categoryId === cat.id);
  }, [activeCategory]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jelajahi Komik</h1>
        <p className="text-muted-foreground mt-1">
          Temukan komik PAI yang sesuai minatmu
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === "semua" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("semua")}
          className="gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" />
          Semua
        </Button>
        {MOCK_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.slug ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.iconEmoji} {cat.name}
          </Button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Menampilkan {filteredComics.length} komik
        {activeCategory !== "semua" && (
          <> dalam kategori <strong>{MOCK_CATEGORIES.find((c) => c.slug === activeCategory)?.name}</strong></>
        )}
      </p>

      {/* Comic Grid */}
      {filteredComics.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Belum ada komik di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredComics.map((comic) => {
            const category = getCategoryById(comic.categoryId);
            return (
              <Link key={comic.id} href={`/komik/${comic.slug}`} className="group">
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  {/* Cover */}
                  <div className="relative aspect-[2/3] bg-muted overflow-hidden">
                    {comic.coverUrl ? (
                      <Image
                        src={comic.coverUrl}
                        alt={comic.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}

                    {/* Category badge */}
                    {category && (
                      <div className="absolute top-2 left-2">
                        <Badge className="text-[10px] bg-background/80 backdrop-blur-sm text-foreground border-0">
                          {category.iconEmoji} {category.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <CardContent className="p-3 space-y-1">
                    <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {comic.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-saffron text-saffron" />
                        {comic.rating}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Layers className="h-3 w-3" />
                        {comic.totalChapters}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
