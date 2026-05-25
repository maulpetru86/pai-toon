import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  Star,
  Users,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MOCK_COMICS,
  getComicBySlug,
  getChaptersByComicSlug,
  getCategoryById,
} from "@/lib/mock-data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return MOCK_COMICS.map((comic) => ({
    slug: comic.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comic = getComicBySlug(slug);
  if (!comic) return { title: "Komik Tidak Ditemukan" };
  return {
    title: comic.title,
    description: comic.description,
  };
}

export default async function KomikDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const comic = getComicBySlug(slug);

  if (!comic) notFound();

  const chapters = getChaptersByComicSlug(slug);
  const category = getCategoryById(comic.categoryId);
  const publishedChapters = chapters.filter((ch) => ch.isPublished);

  return (
    <div className="min-h-screen">
      {/* ════════ HEADER / COVER SECTION ════════ */}
      <section className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Cover Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-48 md:w-56 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-border/40">
                <Image
                  src={comic.coverUrl}
                  alt={comic.title}
                  width={400}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              {/* Kategori badge */}
              {category && (
                <Badge
                  variant="secondary"
                  className="text-xs gap-1"
                >
                  {category.iconEmoji} {category.name}
                </Badge>
              )}

              {/* Judul */}
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">
                {comic.title}
              </h1>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-saffron text-saffron" />
                  {comic.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {comic.totalReaders.toLocaleString()} pembaca
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {comic.totalChapters} chapter
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {comic.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] capitalize"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Sinopsis */}
              <div className="pt-2">
                <h3 className="text-sm font-semibold mb-2">Sinopsis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {comic.description}
                </p>
              </div>

              {/* CTA */}
              {publishedChapters.length > 0 && (
                <div className="pt-3">
                  <Link
                    href={`/baca/${comic.slug}/${publishedChapters[0].chapterNumber}`}
                  >
                    <Button size="lg" className="gap-2 px-10">
                      <BookOpen className="h-5 w-5" />
                      Baca Episode 1
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ════════ DAFTAR CHAPTER ════════ */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              Daftar Chapter
            </h2>
            <span className="text-sm text-muted-foreground">
              {publishedChapters.length} / {chapters.length} tersedia
            </span>
          </div>

          <div className="space-y-2">
          {chapters.map((chapter) => {
              const isAvailable = chapter.isPublished;

              const content = (
                <>
                  <div className="flex items-center gap-4">
                    {/* Nomor chapter */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        isAvailable
                          ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {chapter.chapterNumber}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isAvailable
                            ? "group-hover:text-primary transition-colors"
                            : "text-muted-foreground"
                        }`}
                      >
                        {chapter.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isAvailable ? (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {chapter.pages.length} halaman
                          </span>
                        ) : (
                          "Segera hadir"
                        )}
                      </p>
                    </div>
                  </div>

                  {isAvailable ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Segera
                    </Badge>
                  )}
                </>
              );

              const className = `flex items-center justify-between p-4 rounded-xl border transition-all group ${
                isAvailable
                  ? "border-border/40 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md cursor-pointer"
                  : "border-border/20 bg-muted/30 opacity-60 cursor-not-allowed"
              }`;

              return isAvailable ? (
                <Link
                  key={chapter.id}
                  href={`/baca/${comic.slug}/${chapter.chapterNumber}`}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <div key={chapter.id} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
