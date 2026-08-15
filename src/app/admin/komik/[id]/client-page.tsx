"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Layers,
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

  const [comic, setComic] = useState<Comic | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<ComicStatus>("draft");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  // cover upload state
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadCoverProgress, setUploadCoverProgress] = useState(0);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return alert('Hanya file gambar yang diperbolehkan.');
    if (f.size > 5 * 1024 * 1024) return alert('Ukuran file maksimal 5MB.');
    setNewCoverFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setNewCoverPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleUploadCover = async () => {
    if (!newCoverFile) return alert('Pilih file terlebih dahulu.');
    setUploadingCover(true);
    try {
      const fileName = `comics/${comic.slug}/cover_${Date.now()}.${newCoverFile.name.split('.').pop()}`;
      const task = uploadFileWithProgress(fileName, newCoverFile);
      task.on('state_changed', (snap) => {
        const pct = Math.round((snap.bytesTransferred / (snap.totalBytes || 1)) * 100);
        setUploadCoverProgress(pct);
      });
      await new Promise<void>((resolve, reject) => task.on('state_changed', () => {}, (err) => reject(err), () => resolve()));
      const url = await getFileURL(fileName);
      await setDoc(doc(db, 'comics', comic.id), { coverUrl: url }, { merge: true });
      // update local state so UI shows it immediately
      setComic({ ...comic, coverUrl: url });
      setNewCoverFile(null);
      setNewCoverPreview(null);
      setUploadCoverProgress(0);
    } catch (err) {
      console.error('Cover upload failed', err);
      alert('Gagal mengupload cover. Periksa koneksi dan coba lagi.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      await setDoc(doc(db, "comics", params.id), {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        status,
        tags,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      router.push("/admin/komik");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Gagal menyimpan. Coba lagi.");
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Komik</h1>
          <p className="text-sm text-muted-foreground">{comic.slug}</p>
        </div>
        <Link href={`/admin/komik/${comic.id}/chapter`}>
          <Button variant="outline" className="gap-2">
            <Layers className="h-4 w-4" />
            Kelola Chapter
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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

        {comic.coverUrl && (
          <Card>
            <CardHeader><CardTitle className="text-base">Cover Saat Ini</CardTitle></CardHeader>
            <CardContent>
              <div className="relative w-32 h-48 rounded-lg overflow-hidden border bg-muted">
                <Image src={comic.coverUrl} alt={comic.title} fill className="object-cover" />
              </div>
            </CardContent>
          </Card>
        )}

                <Card>
                  <CardHeader><CardTitle className="text-base">Ganti Cover</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <input type="file" accept="image/*" onChange={handleCoverSelect} />
                    {newCoverPreview && (
                      <div className="w-28 h-40 relative rounded overflow-hidden border">
                        <img src={newCoverPreview} alt="preview" className="object-cover w-full h-full" />
                      </div>
                    )}
                    {uploadingCover ? (
                      <div>
                        <p>Uploading: {uploadCoverProgress}%</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleUploadCover}>Upload & Simpan</Button>
                        <Button variant="outline" onClick={() => { setNewCoverFile(null); setNewCoverPreview(null); }}>Batal</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Link href="/admin/komik"><Button type="button" variant="outline">Batal</Button></Link>
          <Button type="submit" disabled={saving} className="gap-2 min-w-[120px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
}
