import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadResult,
  type UploadTask,
  type SettableMetadata,
} from "firebase/storage";
import { storage } from "./config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./config";

const DEFAULT_CACHE = "public, max-age=31536000, s-maxage=31536000, immutable";

function ensureStorage() {
  if (!storage) throw new Error("Firebase Storage not initialized. This function must run in the browser client.");
}

/**
 * Upload file ke Firebase Storage.
 * Mengembalikan download URL setelah upload selesai.
 */
export async function uploadFile(
  path: string,
  file: File,
  options?: { cacheControl?: string; contentType?: string }
): Promise<{ url: string; result: UploadResult }> {
  ensureStorage();
  const storageRef = ref(storage as any, path);
  const metadata: SettableMetadata = {
    contentType: options?.contentType || file.type || "application/octet-stream",
    cacheControl: options?.cacheControl || DEFAULT_CACHE,
  };
  const result = await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(result.ref);
  return { url, result };
}

/**
 * Upload file dengan progress tracking (untuk bulk upload halaman komik).
 * Mengembalikan UploadTask yang bisa di-observe.
 */
export function uploadFileWithProgress(
  path: string,
  file: File,
  options?: { cacheControl?: string; contentType?: string }
): UploadTask {
  ensureStorage();
  const storageRef = ref(storage as any, path);
  const metadata: SettableMetadata = {
    contentType: options?.contentType || file.type || "application/octet-stream",
    cacheControl: options?.cacheControl || DEFAULT_CACHE,
  };
  return uploadBytesResumable(storageRef, file, metadata);
}

/**
 * Ambil download URL dari path Storage.
 */
export async function getFileURL(path: string): Promise<string> {
  ensureStorage();
  const storageRef = ref(storage as any, path);
  return getDownloadURL(storageRef);
}

/**
 * Hapus file dari Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  ensureStorage();
  const storageRef = ref(storage as any, path);
  return deleteObject(storageRef);
}

/**
 * List semua file dalam sebuah folder (untuk listing halaman komik).
 * NOTE: avoid calling this on every request in production.
 */
export async function listFiles(folderPath: string) {
  ensureStorage();
  const folderRef = ref(storage as any, folderPath);
  const result = await listAll(folderRef);
  return Promise.all(
    result.items.map(async (itemRef) => ({
      name: itemRef.name,
      fullPath: itemRef.fullPath,
      url: await getDownloadURL(itemRef),
    }))
  );
}

/**
 * Simpan array URL halaman ke dokumen chapter di Firestore.
 * Gunakan ini setelah upload selesai agar listing tidak perlu memanggil Storage API langsung.
 */
export async function saveChapterPagesToFirestore(comicId: string, chapterId: string, urls: string[]) {
  if (!db) throw new Error("Firestore not initialized. This function must run in the browser client.");
  const chapterRef = doc(db as any, "comics", comicId, "chapters", chapterId);
  await setDoc(chapterRef, { pages: urls }, { merge: true });
}
