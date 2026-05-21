import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Chapter } from "@/types";

interface ChapterListProps {
  chapters: Chapter[];
  comicSlug: string;
}

export function ChapterList({ chapters, comicSlug }: ChapterListProps) {
  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
        <Link
          key={chapter.id}
          href={`/komik/${comicSlug}/${chapter.id}`}
          className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-accent/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {chapter.chapterNumber}
            </div>
            <div>
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {chapter.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <BookOpen className="h-3 w-3" />
                <span>{chapter.pages.length} halaman</span>
              </div>
            </div>
          </div>

          <Badge
            variant={chapter.isPublished ? "default" : "secondary"}
            className="text-[10px]"
          >
            {chapter.isPublished ? "Baca" : "Segera"}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
