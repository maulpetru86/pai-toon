/**
 * Firestore service layer — menggantikan mock-data.ts
 * Semua fungsi fetch data dari Firestore.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { Comic, Chapter, Category } from "@/types";

// ─── CATEGORIES ─────────────────────────────────────

/** Ambil semua kategori, urut berdasarkan 'order'. */
export async function fetchCategories(): Promise<Category[]> {
  const q = query(collection(db, "categories"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

/** Ambil kategori berdasarkan ID. */
export async function fetchCategoryById(
  id: string
): Promise<Category | null> {
  const snap = await getDoc(doc(db, "categories", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Category;
}

// ─── COMICS ─────────────────────────────────────────

/** Ambil semua komik (untuk admin). */
export async function fetchComics(): Promise<Comic[]> {
  const q = query(collection(db, "comics"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comic);
}

/** Ambil komik yang sudah published (untuk publik). */
export async function fetchPublishedComics(): Promise<Comic[]> {
  const q = query(
    collection(db, "comics"),
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comic);
}

/** Ambil komik berdasarkan slug. */
export async function fetchComicBySlug(
  slug: string
): Promise<Comic | null> {
  const q = query(
    collection(db, "comics"),
    where("slug", "==", slug),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Comic;
}

/** Ambil komik berdasarkan ID. */
export async function fetchComicById(
  id: string
): Promise<Comic | null> {
  const snap = await getDoc(doc(db, "comics", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Comic;
}

// ─── CHAPTERS ───────────────────────────────────────

/** Ambil semua chapter untuk sebuah komik (by comicId). */
export async function fetchChaptersByComicId(
  comicId: string
): Promise<Chapter[]> {
  const q = query(
    collection(db, "comics", comicId, "chapters"),
    orderBy("chapterNumber", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chapter);
}

/** Ambil chapter berdasarkan nomor chapter. */
export async function fetchChapterByNumber(
  comicId: string,
  chapterNumber: number
): Promise<Chapter | null> {
  const q = query(
    collection(db, "comics", comicId, "chapters"),
    where("chapterNumber", "==", chapterNumber),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Chapter;
}

/** Ambil chapter published saja. */
export async function fetchPublishedChapters(
  comicId: string
): Promise<Chapter[]> {
  const q = query(
    collection(db, "comics", comicId, "chapters"),
    where("isPublished", "==", true),
    orderBy("chapterNumber", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Chapter);
}
