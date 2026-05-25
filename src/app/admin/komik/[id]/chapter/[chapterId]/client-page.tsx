"use client";

import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  ImagePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MOCK_COMICS, getChaptersByComicSlug } from "@/lib/mock-data";
import { uploadFile } from "@/lib/firebase/storage";

interface PageFile {
  id: string;
  file?: File;
  preview: string;
  status: "existing" | "pending" | "uploading" | "done" | "error";
  url?: string;
}

export default function AdminEditChapterPage() {
  const params = useParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const comic = MOCK_COMICS.find((c) => c.id === params.id);
  const chapters = comic ? getChaptersByComicSlug(comic.slug) : [];
  const chapter = chapters.find((c) => c.id === params.chapterId);

  const [title, setTitle] = useState(chapter?.title || "");
  const [isPublished, setIsPublished] = useState(chapter?.isPublished || false);
  const [saving, setSaving] = useState(false);

  // Existing pages
  const existingPages: PageFile[] = (chapter?.pages || []).map((url, i) => ({
    id: `existing-${i}`,
    preview: url,
    url,
    status: "existing" as const,
  }));

  const [pageFiles, setPageFiles] = useState<PageFile[]>(existingPages);

  const handleFilesSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((f) =>
        f.type.startsWith("image/")
      );
      files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      const newPages: PageFile[] = files.map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }));

      setPageFiles((prev) => [...prev, ...newPages]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const removePage = (id: string) => {
    setPageFiles((prev) => prev.filter((p) => p.id !== id));
  };

  const movePage = (index: number, direction: "up" | "down") => {
    setPageFiles((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload new files
      for (const page of pageFiles) {
        if (page.status === "pending" && page.file) {
          setPageFiles((prev) =>
            prev.map((p) =>
              p.id === page.id ? { ...p, status: "uploading" as const } : p
            )
          );
          const ext = page.file.name.split(".").pop() || "jpg";
          const path = `comics/${comic?.slug}/ch${chapter?.chapterNumber}/page_${Date.now()}.${ext}`;
          const result = await uploadFile(path, page.file);
          setPageFiles((prev) =>
            prev.map((p) =>
              p.id === page.id
                ? { ...p, status: "done" as const, url: result.url }
                : p
            )
          );
        }
      }

      // TODO: Update Firestore document
      await new Promise((r) => setTimeout(r, 500));
      router.push(`/admin/komik/${params.id}/chapter`);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (!comic || !chapter) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium">Chapter tidak ditemukan</p>
        <Link href="/admin/komik">
          <Button variant="outline" className="mt-4">Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/komik/${params.id}/chapter`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Chapter {chapter.chapterNumber}
          </h1>
          <p className="text-sm text-muted-foreground">{comic.title}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Chapter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Chapter</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Terbitkan</p>
                <p className="text-xs text-muted-foreground">
                  {isPublished ? "Terlihat oleh pembaca" : "Draft"}
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Halaman
              <Badge variant="secondary" className="ml-2 text-xs">
                {pageFiles.length}
              </Badge>
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Tambah
            </Button>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelect}
            />

            <div className="space-y-2">
              {pageFiles.map((page, index) => (
                <div
                  key={page.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border ${
                    page.status === "existing"
                      ? "border-border/40"
                      : page.status === "done"
                      ? "border-green-500/30 bg-green-500/5"
                      : page.status === "uploading"
                      ? "border-primary/30 bg-primary/5"
                      : "border-yellow-500/30 bg-yellow-500/5"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button type="button" onClick={() => movePage(index, "up")} disabled={index === 0} className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30">Γû▓</button>
                    <button type="button" onClick={() => movePage(index, "down")} disabled={index === pageFiles.length - 1} className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30">Γû╝</button>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>

                  <div className="relative h-12 w-9 rounded overflow-hidden bg-muted flex-shrink-0">
                    <Image src={page.preview} alt={`Page ${index + 1}`} fill className="object-cover" sizes="36px" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {page.file?.name || `Halaman ${index + 1}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {page.status === "existing" ? "Tersimpan" : page.file ? `${(page.file.size / 1024).toFixed(0)} KB` : ""}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {page.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {page.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {page.status === "pending" && <Badge variant="outline" className="text-[10px]">Baru</Badge>}
                  </div>

                  {!saving && (
                    <button type="button" onClick={() => removePage(page.id)} className="flex-shrink-0 h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Link href={`/admin/komik/${params.id}/chapter`}>
            <Button type="button" variant="outline">Batal</Button>
          </Link>
          <Button type="submit" disabled={saving} className="gap-2 min-w-[120px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
