"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Star, Layers, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_COMICS, getCategoryById } from "@/lib/mock-data";

export default function CariPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MOCK_COMICS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.includes(q))
    );
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Search Header */}
      <div className="max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Cari Komik</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Ketik judul, tag, atau kata kunci..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 pr-10 h-12 text-base rounded-xl"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {!query.trim() ? (
        <div className="text-center py-16">
          <Search className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">
            Mulai ketik untuk mencari komik...
          </p>
          {/* Quick suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["akidah", "fikih", "sahabat", "quran", "sejarah"].map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => setQuery(tag)}
                className="text-xs"
              >
                #{tag}
              </Button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            Tidak ditemukan komik untuk &quot;{query}&quot;
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setQuery("")}
          >
            Hapus pencarian
          </Button>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            {results.length} hasil untuk &quot;{query}&quot;
          </p>

          {results.map((comic) => {
            const category = getCategoryById(comic.categoryId);
            return (
              <Link key={comic.id} href={`/komik/${comic.slug}`}>
                <Card className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4 flex gap-4">
                    {/* Cover */}
                    <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {comic.coverUrl ? (
                        <Image
                          src={comic.coverUrl}
                          alt={comic.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {comic.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {comic.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {category && (
                          <Badge variant="outline" className="text-[10px]">
                            {category.iconEmoji} {category.name}
                          </Badge>
                        )}
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-saffron text-saffron" />
                          {comic.rating}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Layers className="h-3 w-3" />
                          {comic.totalChapters} ch
                        </span>
                      </div>
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
