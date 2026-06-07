"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MOCK_COMICS, MOCK_CHAPTERS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface MigrationLog {
  type: "info" | "success" | "error";
  message: string;
}

export default function AdminMigrasiPage() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [progress, setProgress] = useState(0);

  const addLog = (type: MigrationLog["type"], message: string) => {
    setLogs((prev) => [...prev, { type, message }]);
  };

  const handleMigrate = async () => {
    if (!confirm("Migrasi akan menimpa data Firestore yang sudah ada. Lanjutkan?")) return;

    setRunning(true);
    setLogs([]);
    setProgress(0);

    try {
      // ═══ STEP 1: Migrasi Kategori ═══
      addLog("info", "📂 Memulai migrasi kategori...");
      for (const cat of MOCK_CATEGORIES) {
        await setDoc(doc(db, "categories", cat.id), {
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
          iconEmoji: cat.iconEmoji || "",
          order: cat.order,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        addLog("success", `  ✅ Kategori: ${cat.name}`);
      }
      setProgress(20);

      // ═══ STEP 2: Migrasi Komik ═══
      addLog("info", "📚 Memulai migrasi komik...");
      for (let i = 0; i < MOCK_COMICS.length; i++) {
        const comic = MOCK_COMICS[i];
        await setDoc(doc(db, "comics", comic.id), {
          title: comic.title,
          slug: comic.slug,
          description: comic.description,
          categoryId: comic.categoryId,
          coverUrl: comic.coverUrl,
          status: comic.status,
          tags: comic.tags,
          authorId: comic.authorId,
          authorName: comic.authorName,
          totalChapters: comic.totalChapters,
          totalReaders: comic.totalReaders,
          rating: comic.rating,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        addLog("success", `  ✅ Komik: ${comic.title}`);
        setProgress(20 + Math.round(((i + 1) / MOCK_COMICS.length) * 30));
      }

      // ═══ STEP 3: Migrasi Chapter ═══
      addLog("info", "📖 Memulai migrasi chapter...");
      const allSlugs = Object.keys(MOCK_CHAPTERS);
      let chaptersDone = 0;
      const totalChapters = Object.values(MOCK_CHAPTERS).reduce(
        (sum, chs) => sum + chs.length,
        0
      );

      for (const slug of allSlugs) {
        const chapters = MOCK_CHAPTERS[slug];
        // Find comic ID by slug
        const comic = MOCK_COMICS.find((c) => c.slug === slug);
        if (!comic) {
          addLog("error", `  ❌ Komik dengan slug "${slug}" tidak ditemukan, skip chapter.`);
          continue;
        }

        for (const ch of chapters) {
          await setDoc(doc(db, "comics", comic.id, "chapters", ch.id), {
            comicId: comic.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            thumbnailUrl: ch.thumbnailUrl || "",
            pages: ch.pages,
            isPublished: ch.isPublished,
            publishedAt: ch.isPublished ? serverTimestamp() : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          chaptersDone++;
          addLog("success", `  ✅ Ch.${ch.chapterNumber}: ${ch.title} (${comic.title})`);
          setProgress(50 + Math.round((chaptersDone / totalChapters) * 45));
        }
      }

      setProgress(100);
      setDone(true);
      addLog("info", `🎉 Migrasi selesai! ${MOCK_CATEGORIES.length} kategori, ${MOCK_COMICS.length} komik, ${totalChapters} chapter berhasil dimigrasikan.`);
    } catch (error) {
      console.error("Migration error:", error);
      addLog("error", `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setRunning(false);
    }
  };

  // Count existing Firestore data
  const totalMockCategories = MOCK_CATEGORIES.length;
  const totalMockComics = MOCK_COMICS.length;
  const totalMockChapters = Object.values(MOCK_CHAPTERS).reduce(
    (sum, chs) => sum + chs.length,
    0
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Migrasi Data</h1>
          <p className="text-sm text-muted-foreground">
            Pindahkan data mock ke Firestore
          </p>
        </div>
      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data yang Akan Dimigrasikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{totalMockCategories}</p>
              <p className="text-xs text-muted-foreground">Kategori</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{totalMockComics}</p>
              <p className="text-xs text-muted-foreground">Komik</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{totalMockChapters}</p>
              <p className="text-xs text-muted-foreground">Chapter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      <Card>
        <CardContent className="p-6">
          {!done ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mulai Migrasi</p>
                  <p className="text-xs text-muted-foreground">
                    Data mock akan di-push ke Firestore. Proses ini aman untuk dijalankan berulang kali.
                  </p>
                </div>
                <Button
                  onClick={handleMigrate}
                  disabled={running}
                  className="gap-2"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {progress}%
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Jalankan Migrasi
                    </>
                  )}
                </Button>
              </div>

              {running && (
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium">Migrasi Selesai!</p>
                <p className="text-xs text-muted-foreground">
                  Semua data berhasil dipindahkan ke Firestore.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log Migrasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-1 text-xs font-mono">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`px-2 py-1 rounded ${
                    log.type === "error"
                      ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                      : log.type === "success"
                      ? "text-green-700 dark:text-green-400"
                      : "text-muted-foreground font-semibold"
                  }`}
                >
                  {log.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
