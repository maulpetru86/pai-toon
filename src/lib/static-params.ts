/**
 * Data statis HANYA untuk generateStaticParams (build-time).
 * File ini sangat ringan — hanya berisi slug dan ID yang diperlukan
 * untuk generate semua halaman saat static export.
 *
 * Setelah migrasi ke Firestore selesai dan Anda TIDAK menggunakan
 * output: "export" lagi, file ini bisa dihapus.
 */

export const COMIC_SLUGS = [
  "iman-kepada-allah",
  "shalat-tiang-agama",
  "akhlak-mulia",
  "peradaban-andalusia",
  "mengenal-alquran",
  "zakat-sedekah",
];

export const COMIC_IDS = [
  "comic-1",
  "comic-2",
  "comic-3",
  "comic-4",
  "comic-5",
  "comic-6",
];

/** Map comicSlug → array of published chapter numbers */
export const PUBLISHED_CHAPTERS: Record<string, number[]> = {
  "iman-kepada-allah": [1, 2, 3, 4, 5],
  "shalat-tiang-agama": [1, 2, 3, 4, 5],
  "akhlak-mulia": [1, 2, 3],
  "peradaban-andalusia": [1, 2, 3],
  "mengenal-alquran": [1, 2, 3],
  "zakat-sedekah": [1, 2, 3],
};

/** Map comicId → array of chapter IDs */
export const CHAPTER_IDS: Record<string, string[]> = {
  "comic-1": ["ch-1", "ch-2", "ch-3", "ch-4", "ch-5"],
  "comic-2": ["shalat-ch-1", "shalat-ch-2", "shalat-ch-3", "shalat-ch-4", "shalat-ch-5"],
  "comic-3": ["akhlak-ch-1", "akhlak-ch-2", "akhlak-ch-3", "akhlak-ch-4", "akhlak-ch-5"],
  "comic-4": ["andalusia-ch-1", "andalusia-ch-2", "andalusia-ch-3", "andalusia-ch-4"],
  "comic-5": ["quran-ch-1", "quran-ch-2", "quran-ch-3", "quran-ch-4"],
  "comic-6": ["zakat-ch-1", "zakat-ch-2", "zakat-ch-3"],
};
