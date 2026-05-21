import Image from "next/image";
import Link from "next/link";
import { Star, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Comic } from "@/types";

interface ComicCardProps {
  comic: Comic;
  categoryName?: string;
}

export function ComicCard({ comic, categoryName }: ComicCardProps) {
  return (
    <Link href={`/komik/${comic.slug}`}>
      <Card className="group overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
        {/* Sampul */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {comic.coverUrl ? (
            <Image
              src={comic.coverUrl}
              alt={comic.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge kategori */}
          {categoryName && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 text-[10px] bg-background/80 backdrop-blur-sm"
            >
              {categoryName}
            </Badge>
          )}
        </div>

        {/* Info */}
        <CardContent className="p-3 space-y-1.5">
          <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {comic.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{comic.totalChapters} Chapter</span>
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span>{comic.rating.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
