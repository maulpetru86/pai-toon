import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Sparkles,
  Search,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOCK_COMICS, MOCK_CATEGORIES, getCategoryById } from "@/lib/mock-data";

export default function HomePage() {
  // Komik featured (rating tertinggi)
  const featuredComic = MOCK_COMICS.reduce((a, b) =>
    a.totalReaders > b.totalReaders ? a : b
  );

  // Komik terbaru (ambil 6)
  const latestComics = MOCK_COMICS.slice(0, 6);

  return (
    <>
      {/* ════════ HERO BANNER ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Decorative blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/12 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-sm">
                <Sparkles className="h-4 w-4 text-saffron" />
                <span className="text-accent-foreground font-medium">
                  Komik Update Terbaru! 🔥
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Belajar{" "}
                <span className="text-gradient-navy">Agama Islam</span>
                <br />
                Lewat{" "}
                <span className="text-gradient-saffron">Komik Seru!</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                PAI-Toon mengubah materi PAI SMA menjadi komik vertikal yang
                mudah dipahami, menarik, dan bikin ketagihan belajar.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/komik">
                  <Button size="lg" className="gap-2 px-8 w-full sm:w-auto">
                    <BookOpen className="h-5 w-5" />
                    Mulai Baca
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/komik/${featuredComic.slug}`}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 px-8 w-full sm:w-auto"
                  >
                    <TrendingUp className="h-5 w-5" />
                    Komik Populer
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Featured Comic Card */}
            <div className="hidden md:flex justify-center">
              <Link
                href={`/komik/${featuredComic.slug}`}
                className="group relative"
              >
                <div className="relative w-64 lg:w-72 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-border/40 transition-transform duration-500 group-hover:scale-[1.03] group-hover:shadow-primary/30">
                  <Image
                    src={featuredComic.coverUrl}
                    alt={featuredComic.title}
                    width={400}
                    height={600}
                    className="w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                    <Badge className="bg-saffron text-black text-[10px] font-semibold">
                      🔥 Terpopuler
                    </Badge>
                    <h3 className="text-white font-bold text-sm leading-snug">
                      {featuredComic.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <Star className="h-3 w-3 fill-saffron text-saffron" />
                      <span>{featuredComic.rating}</span>
                      <span>•</span>
                      <span>
                        {featuredComic.totalReaders.toLocaleString()} pembaca
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ SEARCH BAR ════════ */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Link href="/cari" className="block">
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-card border border-border/60 shadow-lg shadow-black/5 hover:border-primary/40 hover:shadow-primary/10 transition-all cursor-pointer group">
              <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-muted-foreground text-sm">
                Cari materi, judul komik, atau kategori...
              </span>
              <kbd className="hidden sm:inline ml-auto text-xs text-muted-foreground/60 bg-muted px-2 py-0.5 rounded">
                Ctrl+K
              </kbd>
            </div>
          </Link>
        </div>
      </section>

      {/* ════════ KATEGORI FILTER ════════ */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Kategori Materi
          </h2>
          <p className="text-muted-foreground text-sm">
            Pilih materi PAI yang ingin kamu pelajari
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto">
          {MOCK_CATEGORIES.map((kat) => (
            <Link key={kat.id} href={`/komik?kategori=${kat.slug}`}>
              <div className="group flex flex-col items-center gap-3 p-5 md:p-6 rounded-xl border border-border/40 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                  {kat.iconEmoji}
                </span>
                <span className="text-xs md:text-sm font-medium text-center">
                  {kat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════ DAFTAR KOMIK (GRID) ════════ */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              Komik Terbaru
            </h2>
            <p className="text-muted-foreground text-sm">
              Koleksi komik PAI terbaru untuk kamu
            </p>
          </div>
          <Link href="/komik">
            <Button variant="outline" size="sm" className="gap-1.5">
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-5">
          {latestComics.map((comic) => {
            const category = getCategoryById(comic.categoryId);
            return (
              <Link key={comic.id} href={`/komik/${comic.slug}`}>
                <Card className="group overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5">
                  {/* Cover */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <Image
                      src={comic.coverUrl}
                      alt={comic.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {category && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 text-[10px] bg-background/80 backdrop-blur-sm"
                      >
                        {category.iconEmoji} {category.name}
                      </Badge>
                    )}
                  </div>

                  {/* Info */}
                  <CardContent className="p-3 space-y-1.5">
                    <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {comic.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {comic.totalChapters} Ch.
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-saffron text-saffron" />
                        {comic.rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ════════ KENAPA PAI-TOON ════════ */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Kenapa PAI-Toon?
            </h2>
            <p className="text-muted-foreground text-sm">
              Cara baru belajar PAI yang disukai Gen Z
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "📱",
                title: "Baca Kapan Saja",
                desc: "Akses gratis tanpa login. Langsung scroll dan baca komik PAI di HP-mu.",
              },
              {
                icon: "🎨",
                title: "Visual & Menarik",
                desc: "Materi PAI disajikan dalam bentuk komik vertikal bergaya Webtoon yang keren.",
              },
              {
                icon: "🏆",
                title: "Gamifikasi Seru",
                desc: "Kumpulkan XP, naikkan level, dan pertahankan streak baca harianmu!",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform origin-left">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
