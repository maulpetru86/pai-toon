"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchComicById } from "@/lib/firebase/firestore";
import { uploadToDrive } from "@/lib/drive/upload";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Comic } from "@/types";

interface PageFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  url?: string;
  error?: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validatePageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Hanya format JPG, PNG, WEBP yang diperbolehkan.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB.`;
  }
  return null;
}

export default function AdminChapterBaruPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const comicId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [comic, setComic] = useState<Comic | null>(null);
  const [loadingComic, setLoadingComic] = useState(true);

  useEffect(() => {
    fetchComicById(comicId).then((data) => {
      setComic(data);
      setLoadingComic(false);
    }).catch(() => setLoadingComic(false));
  }, [comicId]);

  const [title, setTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [pageFiles, setPageFiles] = useState<PageFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const handleFilesSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const invalidFiles = files.filter((file) => validatePageFile(file) !== null);
      if (invalidFiles.length) {
        alert(
          `Beberapa file tidak valid:\n${invalidFiles
            .map((file) => `- ${file.name}: ${validatePageFile(file)}`)
            .join("\n")}`
        );
      }

      const imageFiles = files.filter((file) => validatePageFile(file) === null);
      if (!imageFiles.length) return;

      imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      const newPages: PageFile[] = imageFiles.map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
        progress: 0,
      }));
      setPageFiles((prev) => [...prev, ...newPages]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const removePage = (id: string) => {
    setPageFiles((prev) => {
      const page = prev.find((p) => p.id === id);
      if (page) URL.revokeObjectURL(page.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const movePage = (index: number, direction: "up" | "down") => {
    setPageFiles((prev) => {
      const newArr = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newArr.length) return prev;
      [newArr[index], newArr[targetIdx]] = [newArr[targetIdx], newArr[index]];
      return newArr;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);

    const invalidFiles = files.filter((file) => validatePageFile(file) !== null);
    if (invalidFiles.length) {
      alert(
        `Beberapa file tidak valid:\n${invalidFiles
          .map((file) => `- ${file.name}: ${validatePageFile(file)}`)
          .join("\n")}`
      );
    }

    const imageFiles = files.filter((file) => validatePageFile(file) === null);
    if (!imageFiles.length) return;

    imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const newPages: PageFile[] = imageFiles.map((file) => ({
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
      const pageUrls: string[] = new Array(totalFiles).fill("");

      const uploadQueue = pageFiles.map((page, index) => async () => {
        try {
          setPageFiles((prev) =>
            prev.map((p) => p.id === page.id ? { ...p, status: "uploading" as const, progress: 30 } : p)
          );
          const ext = page.file.name.split(".").pop() || "jpg";
          const fileName = `page_${String(index + 1).padStart(3, "0")}_${Date.now()}.${ext}`;
          const result = await uploadToDrive(page.file, fileName);
          pageUrls[index] = result.publicUrl;
          uploaded++;
          setOverallProgress(Math.round((uploaded / totalFiles) * 80));
          setPageFiles((prev) =>
            prev.map((p) =>
              p.id === page.id
                ? { ...p, status: "done" as const, progress: 100, url: result.publicUrl }
                : p
            )
          );
        } catch (err) {
          setPageFiles((prev) =>
            prev.map((p) => p.id === page.id ? { ...p, status: "error" as const, error: "Upload gagal" } : p)
          );
          throw err;
        }
      });

      const batchSize = 3;
      for (let i = 0; i < uploadQueue.length; i += batchSize) {
        const batch = uploadQueue.slice(i, i + batchSize);
        await Promise.all(batch.map((fn) => fn()));
      }

      setOverallProgress(90);
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
      router.push(`/admin/komik/${comicId}/chapter`);
    } catch (error) {
      console.error("Gagal menyimpan chapter:", error);
      alert("Gagal menyimpan chapter. Periksa halaman yang gagal upload lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingComic) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat...</span>
      </div>
    );
  }

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/komik/${comicId}/chapter`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Chapter</h1>
          <p className="text-sm text-muted-foreground truncate">{comic.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Detail Chapter</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chapterNumber">Nomor Chapter *</Label>
                <Input id="chapterNumber" type="number" min={1} value={chapterNumber} onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapterTitle">Judul Chapter *</Label>
                <Input id="chapterTitle" placeholder="contoh: Awal Mula Pertanyaan" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Terbitkan langsung</p>
                <p className="text-xs text-muted-foreground">
                  {isPublished ? "Chapter akan langsung terlihat oleh pembaca" : "Chapter disimpan sebagai draft"}
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Halaman Komik
              {pageFiles.length > 0 && (<Badge variant="secondary" className="ml-2 text-xs">{pageFiles.length} file</Badge>)}
            </CardTitle>
            {pageFiles.length > 0 && (
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="h-3.5 w-3.5" />Tambah Lagi
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelect} />
            {pageFiles.length === 0 ? (
              <button type="button" onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={handleDragOver}
                className="w-full border-2 border-dashed border-border/60 hover:border-primary/40 rounded-xl p-10 flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Drag & drop atau klik untuk upload</p>
                  <p className="text-xs mt-1">Upload beberapa gambar sekaligus. Urutkan otomatis by nama file.</p>
                  <p className="text-xs mt-0.5">JPG, PNG, WEBP. Maks 5MB per file.</p>
                </div>
              </button>
            ) : (
              <div className="space-y-2" onDrop={handleDrop} onDragOver={handleDragOver}>
                {pageFiles.map((page, index) => (
                  <div key={page.id} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                    page.status === "done" ? "border-green-500/30 bg-green-500/5"
                      : page.status === "error" ? "border-destructive/30 bg-destructive/5"
                      : page.status === "uploading" ? "border-primary/30 bg-primary/5"
                      : "border-border/40"
                  }`}>
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button type="button" onClick={() => movePage(index, "up")} disabled={index === 0 || saving} className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">▲</button>
                      <button type="button" onClick={() => movePage(index, "down")} disabled={index === pageFiles.length - 1 || saving} className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">▼</button>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-bold flex-shrink-0">{index + 1}</div>
                    <div className="relative h-12 w-9 rounded overflow-hidden bg-muted flex-shrink-0">
                      <Image src={page.preview} alt={`Page ${index + 1}`} fill className="object-cover" sizes="36px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{page.file.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(page.file.size / 1024).toFixed(0)} KB • {page.status === "done" ? "Uploaded" : page.status === "uploading" ? "Uploading" : page.status === "pending" ? "Menunggu" : "Gagal"}
                      </p>
                      {page.url && (
                        <p className="text-[10px] truncate text-blue-600 hover:text-blue-800">
                          <a href={page.url} target="_blank" rel="noreferrer">
                            {page.url}
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <div className="text-[10px] text-muted-foreground">{page.progress}%</div>
                      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${page.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {page.status === "pending" && (<Badge variant="outline" className="text-[10px]">Menunggu</Badge>)}
                      {page.status === "uploading" && (<Loader2 className="h-4 w-4 animate-spin text-primary" />)}
                      {page.status === "done" && (<CheckCircle2 className="h-4 w-4 text-green-600" />)}
                      {page.status === "error" && (<AlertCircle className="h-4 w-4 text-destructive" />)}
                    </div>
                    {!saving && (
                      <button type="button" onClick={() => removePage(page.id)} className="flex-shrink-0 h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border border-dashed border-border/60 hover:border-primary/40 rounded-lg p-3 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <ImagePlus className="h-3.5 w-3.5" />Tambah halaman lagi
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            {saving && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Mengupload... {doneCount}/{pageFiles.length} halaman</span>
                </div>
                <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger render={<Button type="button" variant="outline" className="gap-2" disabled={pageFiles.length === 0} />}>
                <Eye className="h-4 w-4" />
                Preview
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden flex flex-col h-[85vh]">
                <DialogHeader className="p-4 pb-2 border-b">
                  <DialogTitle>Preview Chapter</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto bg-black p-0">
                  <div className="w-full max-w-sm mx-auto flex flex-col">
                    {pageFiles.map((page, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        key={page.id} 
                        src={page.preview} 
                        alt={`Preview page ${i+1}`} 
                        className="w-full h-auto block m-0 p-0" 
                      />
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Link href={`/admin/komik/${comicId}/chapter`}>
              <Button type="button" variant="outline" disabled={saving}>Batal</Button>
            </Link>
            <Button type="submit" disabled={saving || pageFiles.length === 0} className="gap-2 min-w-[140px]">
              {saving ? (<><Loader2 className="h-4 w-4 animate-spin" />{overallProgress}%</>) : (<><Save className="h-4 w-4" />Simpan Chapter</>)}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
