"use client";

import Link from "next/link";
import {
  BookOpen,
  Users,
  Eye,
  Layers,
  TrendingUp,
  ArrowRight,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_COMICS, MOCK_CATEGORIES } from "@/lib/mock-data";

export default function AdminOverviewPage() {
  const totalComics = MOCK_COMICS.length;
  const totalChapters = MOCK_COMICS.reduce((sum, c) => sum + c.totalChapters, 0);
  const totalReaders = MOCK_COMICS.reduce((sum, c) => sum + c.totalReaders, 0);
  const avgRating = (
    MOCK_COMICS.reduce((sum, c) => sum + c.rating, 0) / totalComics
  ).toFixed(1);
  const published = MOCK_COMICS.filter((c) => c.status === "published").length;

  // Top komik by pembaca
  const topComics = [...MOCK_COMICS]
    .sort((a, b) => b.totalReaders - a.totalReaders)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Selamat datang kembali, Admin! Berikut ringkasan platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalComics}</p>
              <p className="text-xs text-muted-foreground">Total Komik</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalChapters}</p>
              <p className="text-xs text-muted-foreground">Total Chapter</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalReaders.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Pembaca</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-saffron/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-xs text-muted-foreground">Rata-rata Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Komik */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Komik Terpopuler</CardTitle>
            <Link href="/admin/komik">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {topComics.map((comic, i) => (
              <div
                key={comic.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{comic.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {comic.totalReaders.toLocaleString()} pembaca
                  </p>
                </div>
                <div className="flex items-center gap-0.5 text-xs">
                  <Star className="h-3 w-3 fill-saffron text-saffron" />
                  {comic.rating}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Kategori */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Kategori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_CATEGORIES.map((cat) => {
              const count = MOCK_COMICS.filter(
                (c) => c.categoryId === cat.id
              ).length;
              const percentage =
                totalComics > 0 ? Math.round((count / totalComics) * 100) : 0;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {cat.iconEmoji} {cat.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {count} komik ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/komik/baru">
            <Button className="gap-2">
              <BookOpen className="h-4 w-4" />
              Buat Komik Baru
            </Button>
          </Link>
          <Link href="/admin/komik">
            <Button variant="outline" className="gap-2">
              <Layers className="h-4 w-4" />
              Kelola Komik
            </Button>
          </Link>
          <Link href="/admin/pengguna">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Kelola Pengguna
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
