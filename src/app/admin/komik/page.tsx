"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  BookOpen,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchComics, fetchCategories } from "@/lib/firebase/firestore";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Comic, ComicStatus, Category } from "@/types";

const STATUS_MAP: Record<ComicStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Terbit", variant: "default" },
  draft: { label: "Draft", variant: "secondary" },
  archived: { label: "Arsip", variant: "outline" },
};

export default function AdminKomikPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [comics, setComics] = useState<Comic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchComics(), fetchCategories()])
      .then(([comicsData, catsData]) => {
        setComics(comicsData);
        setCategories(catsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const filteredComics = comics.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus komik ini?")) {
      try {
        await deleteDoc(doc(db, "comics", id));
        setComics((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error("Failed to delete:", error);
        alert("Gagal menghapus komik.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPublished = comics.filter((c) => c.status === "published").length;
  const totalDraft = comics.filter((c) => c.status === "draft").length;
  const totalReaders = comics.reduce((sum, c) => sum + c.totalReaders, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Komik</h1>
          <p className="text-sm text-muted-foreground">Buat, edit, dan kelola semua komik PAI</p>
        </div>
        <Link href="/admin/komik/baru">
          <Button className="gap-2"><Plus className="h-4 w-4" />Buat Komik Baru</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPublished}</p>
              <p className="text-xs text-muted-foreground">Terbit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Pencil className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDraft}</p>
              <p className="text-xs text-muted-foreground">Draft</p>
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
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari judul atau tag..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Komik</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Kategori</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Status</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Chapter</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Pembaca</th>
                <th className="text-right p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredComics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {search ? "Tidak ada komik yang cocok." : "Belum ada komik."}
                  </td>
                </tr>
              ) : (
                filteredComics.map((comic) => {
                  const category = getCategoryById(comic.categoryId);
                  const status = STATUS_MAP[comic.status];
                  return (
                    <tr key={comic.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-9 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {comic.coverUrl ? (
                              <Image src={comic.coverUrl} alt={comic.title} fill className="object-cover" sizes="36px" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px] lg:max-w-[300px]">{comic.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{comic.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {category?.iconEmoji} {category?.name || "-"}
                        </Badge>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Layers className="h-3.5 w-3.5" />{comic.totalChapters}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">
                        {comic.totalReaders.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem className="gap-2" onClick={() => router.push(`/admin/komik/${comic.id}`)}>
                              <Pencil className="h-3.5 w-3.5" />Edit Komik
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => router.push(`/admin/komik/${comic.id}/chapter`)}>
                              <Layers className="h-3.5 w-3.5" />Kelola Chapter
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => window.open(`/komik/${comic.slug}`, "_blank")}>
                              <Eye className="h-3.5 w-3.5" />Lihat Publik
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(comic.id)}>
                              <Trash2 className="h-3.5 w-3.5" />Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
