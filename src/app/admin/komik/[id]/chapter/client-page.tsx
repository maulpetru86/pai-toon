"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Layers,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchComicById, fetchChaptersByComicId } from "@/lib/firebase/firestore";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Comic, Chapter } from "@/types";

export default function AdminChapterPage() {
  const params = useParams<{ id: string }>();
  const comicId = params.id;

  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [comicData, chaptersData] = await Promise.all([
          fetchComicById(comicId),
          fetchChaptersByComicId(comicId),
        ]);
        setComic(comicData);
        setChapters(chaptersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [comicId]);

  const handleDelete = async (chapter: Chapter) => {
    if (!confirm(`Hapus chapter "${chapter.title}"?`)) return;
    try {
      await deleteDoc(doc(db, "comics", comicId, "chapters", chapter.id));
      setChapters((prev) => prev.filter((c) => c.id !== chapter.id));
    } catch (error) {
      console.error("Failed to delete chapter:", error);
      alert("Gagal menghapus chapter.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat...</span>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="space-y-4 text-center py-20">
        <p className="text-lg font-medium">Komik tidak ditemukan</p>
        <Link href="/admin/komik">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/komik">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            Chapter: {comic.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {chapters.length} chapter total ·{" "}
            {chapters.filter((c) => c.isPublished).length} terbit
          </p>
        </div>
        <Link href={`/admin/komik/${comicId}/chapter/baru`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Chapter
          </Button>
        </Link>
      </div>

      {chapters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground mb-4">
              Belum ada chapter. Mulai buat chapter pertama!
            </p>
            <Link href={`/admin/komik/${comicId}/chapter/baru`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Buat Chapter Pertama
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <Card key={chapter.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab flex-shrink-0" />
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 ${
                    chapter.isPublished
                      ? "bg-green-500/10 text-green-600"
                      : "bg-yellow-500/10 text-yellow-600"
                  }`}
                >
                  {chapter.chapterNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{chapter.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <ImagePlus className="h-3 w-3" />
                      {chapter.pages.length} halaman
                    </span>
                    {chapter.isPublished ? (
                      <Badge variant="default" className="text-[10px] h-4 gap-0.5">
                        <Eye className="h-2.5 w-2.5" />
                        Terbit
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] h-4 gap-0.5">
                        <EyeOff className="h-2.5 w-2.5" />
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/komik/${comicId}/chapter/${chapter.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(chapter)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
