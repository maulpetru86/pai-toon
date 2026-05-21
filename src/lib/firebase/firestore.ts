import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryConstraint,
  type DocumentReference,
  type DocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Referensi koleksi Firestore.
 */
export function getCollectionRef(collectionName: string) {
  return collection(db, collectionName);
}

/**
 * Referensi dokumen Firestore.
 */
export function getDocRef(collectionName: string, docId: string) {
  return doc(db, collectionName, docId);
}

/**
 * Ambil satu dokumen berdasarkan ID.
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const snap: DocumentSnapshot = await getDoc(doc(db, collectionName, docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as T) };
}

/**
 * Ambil banyak dokumen dengan filter opsional.
 */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}

/**
 * Tambah dokumen baru.
 */
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<DocumentReference> {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update dokumen yang sudah ada.
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  return updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Hapus dokumen.
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  return deleteDoc(doc(db, collectionName, docId));
}

// Re-export utilitas Firestore yang sering dipakai
export { where, orderBy, limit, startAfter, serverTimestamp };
