import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadResult,
  type UploadTask,
} from "firebase/storage";
import { storage } from "./config";

/**
 * Upload file ke Firebase Storage.
 * Mengembalikan download URL setelah upload selesai.
 */
export async function uploadFile(
  path: string,
  file: File
): Promise<{ url: string; result: UploadResult }> {
  const storageRef = ref(storage, path);
  const result = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(result.ref);
  return { url, result };
}

/**
 * Upload file dengan progress tracking (untuk bulk upload halaman komik).
 * Mengembalikan UploadTask yang bisa di-observe.
 */
export function uploadFileWithProgress(
  path: string,
  file: File
): UploadTask {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file);
}

/**
 * Ambil download URL dari path Storage.
 */
export async function getFileURL(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Hapus file dari Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
}

/**
 * List semua file dalam sebuah folder (untuk listing halaman komik).
 */
export async function listFiles(folderPath: string) {
  const folderRef = ref(storage, folderPath);
  const result = await listAll(folderRef);
  return Promise.all(
    result.items.map(async (itemRef) => ({
      name: itemRef.name,
      fullPath: itemRef.fullPath,
      url: await getDownloadURL(itemRef),
    }))
  );
}
