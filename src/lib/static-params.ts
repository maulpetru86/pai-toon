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
  "indahnya-sedekah",
  "kisah-sahabat-nabi",
  "adab-bermedia-sosial",
  "puasa-ramadhan",
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
  "iman-kepada-allah": [1, 2, 3, 4],
  "shalat-tiang-agama": [1, 2, 3, 4],
  "indahnya-sedekah": [1, 2, 3, 4, 5],
  "kisah-sahabat-nabi": [1, 2, 3, 4, 5],
  "adab-bermedia-sosial": [1, 2, 3],
  "puasa-ramadhan": [1, 2, 3, 4, 5],
};

/** Map comicId → array of chapter IDs */
export const CHAPTER_IDS: Record<string, string[]> = {
  "comic-1": ["ch-1-1", "ch-1-2", "ch-1-3", "ch-1-4", "ch-1-5"],
  "comic-2": ["ch-2-1", "ch-2-2", "ch-2-3", "ch-2-4", "ch-2-5"],
  "comic-3": ["ch-3-1", "ch-3-2", "ch-3-3", "ch-3-4", "ch-3-5"],
  "comic-4": ["ch-4-1", "ch-4-2", "ch-4-3", "ch-4-4", "ch-4-5"],
  "comic-5": ["ch-5-1", "ch-5-2", "ch-5-3", "ch-5-4", "ch-5-5"],
  "comic-6": ["ch-6-1", "ch-6-2", "ch-6-3", "ch-6-4", "ch-6-5"],
};
