import { Timestamp } from "firebase/firestore";

// ============================================
// USER
// ============================================

/** Peran pengguna dalam sistem */
export type UserRole = "admin" | "student";

/** Badge gamifikasi yang bisa didapatkan siswa */
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Timestamp;
}

/** Bookmark untuk melanjutkan bacaan */
export interface Bookmark {
  comicId: string;
  chapterId: string;
  lastPage: number;
  updatedAt: Timestamp;
}

/**
 * Profil pengguna di Firestore (koleksi: `users`).
 * Dokumen ID = Firebase Auth UID.
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;

  // Gamifikasi (khusus student, admin bisa abaikan)
  bookmarks: Bookmark[];
  readingStreak: number;
  badges: Badge[];
  lastReadAt?: Timestamp;
  totalComicsRead: number;
  xp: number;
  level: number;
  readChapters?: string[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Data minimal untuk membuat user baru di Firestore */
export type UserInput = Pick<User, "uid" | "email" | "displayName" | "role"> &
  Partial<Pick<User, "photoURL">>;

// ============================================
// CATEGORY
// ============================================

/**
 * Kategori materi PAI (koleksi: `categories`).
 * Dikelola oleh admin, dipakai untuk filter komik.
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconEmoji?: string; // Emoji untuk UI (misal: 🕌)
  order: number; // Urutan tampil di halaman
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;

// ============================================
// COMIC
// ============================================

/** Status publikasi komik */
export type ComicStatus = "draft" | "published" | "archived";

/**
 * Data komik utama (koleksi: `comics`).
 * Chapter disimpan sebagai sub-collection: `comics/{comicId}/chapters`.
 */
export interface Comic {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  coverUrl: string;
  status: ComicStatus;
  tags: string[];
  authorId: string; // UID admin yang membuat
  authorName: string;

  // Statistik (auto-increment via Cloud Functions / client)
  totalChapters: number;
  totalReaders: number;
  rating: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Data untuk membuat komik baru */
export type ComicInput = Omit<
  Comic,
  "id" | "totalChapters" | "totalReaders" | "rating" | "createdAt" | "updatedAt"
>;

// ============================================
// CHAPTER
// ============================================

/**
 * Chapter komik (sub-collection: `comics/{comicId}/chapters`).
 * Field `pages` berisi array URL gambar (urut dari halaman 1 dst).
 */
export interface Chapter {
  id: string;
  comicId: string;
  chapterNumber: number;
  title: string;
  thumbnailUrl?: string;
  pages: string[]; // Array URL gambar halaman (urutan = nomor halaman)
  isPublished: boolean;
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Data untuk membuat chapter baru */
export type ChapterInput = Omit<
  Chapter,
  "id" | "createdAt" | "updatedAt"
>;
