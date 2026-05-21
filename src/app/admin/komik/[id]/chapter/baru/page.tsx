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
  GripVertical,
  ImagePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MOCK_COMICS } from "@/lib/mock-data";
import { uploadFile } from "@/lib/firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface PageFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  url?: string;
  error?: string;
}

export default function AdminChapterBaruPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const comicId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const comic = MOCK_COMICS.find((c) => c.id === comicId);

  const [title, setTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [pageFiles, setPageFiles] = useState<PageFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Handle file selection (multiple)
  const handleFilesSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      // Filter gambar saja
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length !== files.length) {
        alert("Beberapa file bukan gambar dan dilewati.");
      }

      // Sortir by nama file (page_001, page_002, dst.)
      imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      const newPages: PageFile[] = imageFiles.map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
        progress: 0,
      }));

      setPageFiles((prev) => [...prev, ...newPages]);

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  // Remove page
  const removePage = (id: string) => {
    setPageFiles((prev) => {
      const page = prev.find((p) => p.id === id);
      if (page) URL.revokeObjectURL(page.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  // Reorder — move page up/down
  const movePage = (index: number, direction: "up" | "down") => {
    setPageFiles((prev) => {
      const newArr = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newArr.length) return prev;
      [newArr[index], newArr[targetIdx]] = [newArr[targetIdx], newArr[index]];
      return newArr;
    });
  };

  // Handle drop zone
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );

    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const newPages: PageFile[] = files.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
      progress: 0,
    }));

    setPageFiles((prev) => [...prev, ...newPages]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Upload all pages dan simpan chapter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return alert("Judul chapter wajib diisi.");
    if (pageFiles.length === 0) return alert("Minimal 1 halaman diperlukan.");

    setSaving(true);
    setOverallProgress(0);

    try {
      const comicSlug = comic?.slug || comicId;
      const totalFiles = pageFiles.length;
      let uploaded = 0;

      // Upload semua halaman secara paralel (max 3 concurrent)
      const pageUrls: string[] = new Array(totalFiles).fill("");

      const uploadQueue = pageFiles.map((page, index) => async () => {
        try {
          // Update status
          setPageFiles((prev) =>
            prev.map((p) =>
              p.id === page.id ? { ...p, status: "uploading" as const, progress: 30 } : p
            )
          );

          const ext = page.file.name.split(".").pop() || "jpg";
          const path = `comics/${comicSlug}/ch${chapterNumber}/page_${String(index + 1).padStart(3, "0")}_${Date.now()}.${ext}`;

          const result = await uploadFile(path, page.file);
          pageUrls[index] = result.url;

          uploaded++;
          setOverallProgress(Math.round((uploaded / totalFiles) * 80));

          // Update status
          setPageFiles((prev) =>
            prev.map((p) =>
              p.id === page.id
                ? { ...p, status: "done" as const, progress: 100, url: result.url }
                : p
            )
          );
        } catch (err) {
          setPageFiles((prev) =>
            prev.map((p) =>
              p.id === page.id
                ? { ...p, status: "error" as const, error: "Upload gagal" }
                : p
            )
          );
          throw err;
        }
      });

      // Batched parallel upload (3 at a time)
      const batchSize = 3;
      for (let i = 0; i < uploadQueue.length; i += batchSize) {
        const batch = uploadQueue.slice(i, i + batchSize);
        await Promise.all(batch.map((fn) => fn()));
      }

      setOverallProgress(90);

      // Simpan ke Firestore
      await addDoc(collection(db, "comics", comicId, "chapters"), {
        comicId,
        chapterNumber,
        title: title.trim(),
        pages: pageUrls.filter(Boolean),
        isPublished,
        publishedAt: isPublished ? serverTimestamp() : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setOverallProgress(100);

      // Redirect ke daftar chapter
      router.push(`/admin/komik/${comicId}/chapter`);
    } catch (error) {
      console.error("Gagal menyimpan chapter:", error);
      alert("Gagal menyimpan chapter. Periksa halaman yang gagal upload lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (!comic) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium">Komik tidak ditemukan</p>
        <Link href="/admin/komik">
          <Button variant="outline" className="mt-4">Kembali</Button>
        </Link>
      </div>
    );
  }

  const doneCount = pageFiles.filter((p) => p.status === "done").length;
  const errorCount = pageFiles.filter((p) => p.status === "error").length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/komik/${comicId}/chapter`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Chapter</h1>
          <p className="text-sm text-muted-foreground truncate">
            {comic.title}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ═══ Detail Chapter ═══ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Chapter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nomor */}
              <div className="space-y-2">
                <Label htmlFor="chapterNumber">Nomor Chapter *</Label>
                <Input
                  id="chapterNumber"
                  type="number"
                  min={1}
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              {/* Judul */}
              <div className="space-y-2">
                <Label htmlFor="chapterTitle">Judul Chapter *</Label>
                <Input
                  id="chapterTitle"
                  placeholder="contoh: Awal Mula Pertanyaan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Publish toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Terbitkan langsung</p>
                <p className="text-xs text-muted-foreground">
                  {isPublished
                    ? "Chapter akan langsung terlihat oleh pembaca"
                    : "Chapter disimpan sebagai draft"}
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </CardContent>
        </Card>

        {/* ═══ Upload Halaman ═══ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Halaman Komik
              {pageFiles.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {pageFiles.length} file
                </Badge>
              )}
            </CardTitle>
            {pageFiles.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Tambah Lagi
              </Button>
            )}
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

            {pageFiles.length === 0 ? (
              /* Drop zone kosong */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="w-full border-2 border-dashed border-border/60 hover:border-primary/40 rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drag & drop atau klik untuk upload
                  </p>
                  <p className="text-xs mt-1">
                    Upload beberapa gambar sekaligus. Urutkan otomatis by nama file.
                  </p>
                  <p className="text-xs mt-0.5">JPG, PNG, WEBP. Maks 5MB per file.</p>
                </div>
              </button>
            ) : (
              /* Preview list */
              <div
                className="space-y-2"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {pageFiles.map((page, index) => (
                  <div
                    key={page.id}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                      page.status === "done"
                        ? "border-green-500/30 bg-green-500/5"
                        : page.status === "error"
                        ? "border-destructive/30 bg-destructive/5"
                        : page.status === "uploading"
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/40"
                    }`}
                  >
                    {/* Reorder controls */}
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => movePage(index, "up")}
                        disabled={index === 0 || saving}
                        className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => movePage(index, "down")}
                        disabled={index === pageFiles.length - 1 || saving}
                        className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Page number */}
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative h-12 w-9 rounded overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={page.preview}
                        alt={`Page ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {page.file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {(page.file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      {page.status === "pending" && (
                        <Badge variant="outline" className="text-[10px]">
                          Menunggu
                        </Badge>
                      )}
                      {page.status === "uploading" && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {page.status === "done" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {page.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>

                    {/* Remove */}
                    {!saving && (
                      <button
                        type="button"
                        onClick={() => removePage(page.id)}
                        className="flex-shrink-0 h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Drop more zone */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-border/60 hover:border-primary/40 rounded-lg p-3 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Tambah halaman lagi
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* ═══ Submit ═══ */}
        <div className="flex items-center justify-between">
          <div>
            {saving && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>
                    Mengupload... {doneCount}/{pageFiles.length} halaman
                  </span>
                </div>
                <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Link href={`/admin/komik/${comicId}/chapter`}>
              <Button type="button" variant="outline" disabled={saving}>
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={saving || pageFiles.length === 0} className="gap-2 min-w-[140px]">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {overallProgress}%
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Chapter
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
