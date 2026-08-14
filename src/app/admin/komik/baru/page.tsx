"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  X,
  Save,
  ImagePlus,
  Loader2,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fetchCategories } from "@/lib/firebase/firestore";
import { uploadFile, uploadFileWithProgress } from "@/lib/firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import type { Category } from "@/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminKomikBaruPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const slug = slugify(title);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      return;
    }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Judul wajib diisi.");
    if (!categoryId) return alert("Kategori wajib dipilih.");
    if (!firebaseUser) return alert("Anda harus login.");

    setSaving(true);
    setUploadProgress(0);

    try {
      let coverUrl = "";
      if (coverFile) {
        setUploadProgress(5);
        const fileName = `comics/${slug}/cover_${Date.now()}.${coverFile.name.split(".").pop()}`;
        const task = uploadFileWithProgress(fileName, coverFile);
        task.on("state_changed", (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 100);
          setUploadProgress(Math.round(pct * 0.8)); // map to 0-80
        }, (err) => {
          console.error("Cover upload failed:", err);
        }, async () => {
          const url = await (await import("@/lib/firebase/storage")).getFileURL(fileName);
          coverUrl = url;
          setUploadProgress(90);
        });
        // wait for completion
        await new Promise<void>((resolve, reject) => task.on("state_changed", () => {}, (err) => reject(err), () => resolve()));
      }

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await addDoc(collection(db, "comics"), {
        title: title.trim(),
        slug,
        description: description.trim(),
        categoryId,
        coverUrl,
        status: "draft",
        tags,
        authorId: firebaseUser.uid,
        authorName: firebaseUser.displayName || "Admin",
        totalChapters: 0,
        totalReaders: 0,
        rating: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setUploadProgress(100);
      router.push("/admin/komik");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Gagal menyimpan komik:", error);
      alert(
        `Gagal menyimpan komik. Periksa koneksi, hak akses admin, dan ukuran file.\n${message}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/komik">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buat Komik Baru</h1>
          <p className="text-sm text-muted-foreground">
            Isi detail komik lalu simpan sebagai draft
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Komik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Komik *</Label>
              <Input
                id="title"
                placeholder="contoh: Iman Kepada Allah"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {slug && (
                <p className="text-xs text-muted-foreground">
                  Slug: <code className="bg-muted px-1 rounded">{slug}</code>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Sinopsis / Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Tulis sinopsis komik..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              {loadingCats ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat kategori...
                </div>
              ) : (
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.iconEmoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="contoh: akidah, tauhid, kelas-10 (pisahkan dengan koma)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              {tagsInput && (
                <div className="flex flex-wrap gap-1.5">
                  {tagsInput
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag.toLowerCase()}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover Komik</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverSelect}
            />
            {coverPreview ? (
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-48 rounded-lg overflow-hidden border bg-muted">
                  <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{coverFile?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {coverFile && (coverFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={removeCover} className="gap-1.5">
                    <X className="h-3 w-3" />Ganti
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border/60 hover:border-primary/40 rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Klik untuk upload cover</p>
                  <p className="text-xs">JPG, PNG atau WEBP. Maks 5MB</p>
                </div>
              </button>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Komik akan disimpan sebagai <Badge variant="secondary" className="text-[10px]">Draft</Badge>
          </p>
          <div className="flex gap-3">
            <Link href="/admin/komik">
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button type="submit" disabled={saving} className="gap-2 min-w-[120px]">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadProgress < 100 ? `${uploadProgress}%` : "Menyimpan..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
