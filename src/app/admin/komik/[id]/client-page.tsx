"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Layers,
  ImagePlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchComicById, fetchCategories } from "@/lib/firebase/firestore";
import { uploadFileWithProgress, getFileURL } from "@/lib/firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Comic, ComicStatus, Category } from "@/types";

const STATUS_OPTIONS: { value: ComicStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Terbit" },
  { value: "archived", label: "Arsip" },
];

export default function AdminEditKomikPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── All hooks MUST be declared before any early return ──
  const [comic, setComic] = useState<Comic | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<ComicStatus>("draft");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Cover upload state — harus di-deklarasi di sini, BUKAN setelah early return
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadCoverProgress, setUploadCoverProgress] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [comicData, catsData] = await Promise.all([
          fetchComicById(params.id),
          fetchCategories(),
        ]);
        setComic(comicData);
        setCategories(catsData);
        if (comicData) {
          setTitle(comicData.title || "");
          setDescription(comicData.description || "");
          setCategoryId(comicData.categoryId || "");
          setStatus(comicData.status || "draft");
          setTagsInput(comicData.tags?.join(", ") || "");
        }
      } catch (error) {
        console.error("Failed to load:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  // ── Event handlers ──

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return alert("Hanya file gambar yang diperbolehkan.");
    if (f.size > 5 * 1024 * 1024) return alert("Ukuran file maksimal 5MB.");
    setNewCoverFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setNewCoverPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const removeCoverPreview = () => {
    setNewCoverFile(null);
    setNewCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadCover = async () => {
    if (!newCoverFile || !comic) return alert("Pilih file terlebih dahulu.");
    setUploadingCover(true);
    try {
      const slug = comic.slug || comic.id;
      const ext = newCoverFile.name.split(".").pop() || "webp";
      const fileName = `comics/${slug}/cover_${Date.now()}.${ext}`;
      const task = uploadFileWithProgress(fileName, newCoverFile);

      // Track progress
      task.on("state_changed", (snap) => {
        const pct = Math.round((snap.bytesTransferred / (snap.totalBytes || 1)) * 100);
        setUploadCoverProgress(pct);
      });

      // Wait for upload completion
      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          () => {},
          (err) => reject(err),
          () => resolve()
        );
      });

      const url = await getFileURL(fileName);

      // Update Firestore
      await setDoc(doc(db, "comics", comic.id), { coverUrl: url, updatedAt: serverTimestamp() }, { merge: true });

      // Update local state so UI reflects changes immediately
      setComic({ ...comic, coverUrl: url });
      removeCoverPreview();
      setUploadCoverProgress(0);
    } catch (err) {
      console.error("Cover upload failed", err);
      alert("Gagal mengupload cover. Periksa koneksi dan hak akses admin, lalu coba lagi.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comic) return;
    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await setDoc(
        doc(db, "comics", params.id),
        {
          title: title.trim(),
          description: description.trim(),
          categoryId,
          status,
          tags,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      router.push("/admin/komik");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render: Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Render: Not found ──
  if (!comic) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-lg font-medium">Komik tidak ditemukan</p>
        <Link href="/admin/komik">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>
    );
  }

  // ── Render: Main ──
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/komik">
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Edit Komik</h1>
            <p className="text-sm text-muted-foreground truncate">{comic.slug}</p>
          </div>
        </div>
        <Link href={`/admin/komik/${comic.id}/chapter`} className="block sm:inline-block">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Layers className="h-4 w-4" />
            Kelola Chapter
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ═══ Detail Komik ═══ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Komik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Sinopsis</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.iconEmoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus((v as ComicStatus) ?? "draft")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="pisahkan dengan koma" />
              {tagsInput && (
                <div className="flex flex-wrap gap-1.5">
                  {tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">#{tag.toLowerCase()}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ═══ Cover Komik ═══ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover Komik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cover saat ini */}
            {comic.coverUrl && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Cover Saat Ini</p>
                <div className="relative w-32 h-48 rounded-lg overflow-hidden border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comic.coverUrl}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Upload cover baru */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {comic.coverUrl ? "Ganti Cover" : "Upload Cover"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverSelect}
              />

              {newCoverPreview ? (
                <div className="flex items-start gap-4">
                  <div className="relative w-28 h-40 rounded-lg overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={newCoverPreview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{newCoverFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {newCoverFile && (newCoverFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex gap-2">
                      {uploadingCover ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading: {uploadCoverProgress}%
                        </div>
                      ) : (
                        <>
                          <Button type="button" size="sm" className="gap-1.5" onClick={handleUploadCover}>
                            <Save className="h-3 w-3" />
                            Upload & Simpan
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={removeCoverPreview}>
                            <X className="h-3 w-3" />
                            Batal
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border/60 hover:border-primary/40 rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">Klik untuk pilih gambar cover</p>
                  <p className="text-xs">JPG, PNG atau WEBP. Maks 5MB</p>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* ═══ Action buttons ═══ */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Link href="/admin/komik" className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full sm:w-auto">Batal</Button>
          </Link>
          <Button type="submit" disabled={saving} className="gap-2 min-w-[120px] w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
