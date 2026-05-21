"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  BookOpen,
  Award,
  Flame,
  Star,
  Zap,
  Bookmark,
  Trophy,
  Target,
  Clock,
  LogOut,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useBookmark } from "@/hooks/use-bookmark";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

// ─── Badge definitions ───
const BADGE_DEFINITIONS = [
  {
    id: "pembaca-aktif",
    name: "Pembaca Aktif",
    description: "Telah membaca 5 komik",
    icon: "📖",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    id: "streak-3",
    name: "Streak 3 Hari",
    description: "Baca komik 3 hari berturut-turut",
    icon: "🔥",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  {
    id: "penjelajah",
    name: "Penjelajah",
    description: "Membaca dari 3 kategori berbeda",
    icon: "🧭",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  {
    id: "kolektor",
    name: "Kolektor",
    description: "Menyimpan 10 bookmark",
    icon: "⭐",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  {
    id: "master-pai",
    name: "Master PAI",
    description: "Menyelesaikan semua chapter dari 1 komik",
    icon: "🏆",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
];

export default function ProfilPage() {
  const { firebaseUser, userProfile, loading, isAuthenticated } = useAuth();
  const { removeBookmark, loading: bookmarkLoading } = useBookmark();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <UserIcon className="h-16 w-16 mx-auto text-muted-foreground/40" />
        <h2 className="text-xl font-bold">Login untuk melihat profil</h2>
        <p className="text-muted-foreground text-sm">
          Buat akun gratis untuk menyimpan progres, bookmark, dan kumpulkan badge!
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/login">
            <Button>Masuk</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Daftar</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Determine which badges the user has earned (simplified logic)
  const earnedBadgeIds = userProfile.badges.map((b) => b.id);
  const totalRead = userProfile.totalComicsRead;
  const streak = userProfile.readingStreak;
  const bookmarkCount = userProfile.bookmarks.length;

  // Auto-check basic achievements
  const achievedIds = new Set(earnedBadgeIds);
  if (totalRead >= 5) achievedIds.add("pembaca-aktif");
  if (streak >= 3) achievedIds.add("streak-3");
  if (bookmarkCount >= 10) achievedIds.add("kolektor");

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      {/* ═══ Profile Header ═══ */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        <CardContent className="p-6 -mt-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {userProfile.photoURL ? (
                <Image
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">
                {userProfile.displayName}
              </h1>
              <p className="text-sm text-muted-foreground">{userProfile.email}</p>
              <Badge variant="secondary" className="mt-1 text-[10px] capitalize">
                {userProfile.role}
              </Badge>
            </div>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ═══ Stats Grid ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Zap className="h-5 w-5 mx-auto text-saffron" />
            <p className="text-2xl font-bold">{userProfile.xp}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Target className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold">{userProfile.level}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Level</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Flame className="h-5 w-5 mx-auto text-orange-500" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <BookOpen className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-2xl font-bold">{totalRead}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Dibaca</p>
          </CardContent>
        </Card>
      </div>

      {/* ═══ Lencana / Badges ═══ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-saffron" />
            Lencana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BADGE_DEFINITIONS.map((badge) => {
              const earned = achievedIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    earned
                      ? badge.color
                      : "bg-muted/30 text-muted-foreground/50 border-border/30"
                  }`}
                >
                  <span className={`text-2xl ${earned ? "" : "grayscale opacity-40"}`}>
                    {badge.icon}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${earned ? "" : "text-muted-foreground/50"}`}>
                      {badge.name}
                    </p>
                    <p className="text-[10px] opacity-70 leading-tight">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══ Bookmark / Bacaan Tersimpan ═══ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Bacaan Tersimpan
            {bookmarkCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {bookmarkCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookmarkCount === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Belum ada bacaan tersimpan
              </p>
              <Link href="/komik">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Jelajahi Komik
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {userProfile.bookmarks.map((bm, idx) => (
                <div
                  key={`${bm.comicId}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {bm.comicId}
                      </p>
                      {bm.lastPage > 0 && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          Halaman {bm.lastPage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link href={`/komik/${bm.comicId}`}>
                      <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                        Lanjut
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeBookmark(bm.comicId)}
                      disabled={bookmarkLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
