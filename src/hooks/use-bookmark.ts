"use client";

import { useState, useCallback } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/use-auth";
import type { Bookmark } from "@/types";

/**
 * Hook untuk mengelola bookmark komik user.
 * Menambah/menghapus comicId dari array bookmarks di Firestore.
 */
export function useBookmark() {
  const { firebaseUser, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  /** Cek apakah sebuah komik sudah di-bookmark */
  const isBookmarked = useCallback(
    (comicId: string): boolean => {
      if (!userProfile) return false;
      return userProfile.bookmarks.some((b) => b.comicId === comicId);
    },
    [userProfile]
  );

  /** Tambah bookmark */
  const addBookmark = useCallback(
    async (comicId: string, chapterId?: string, lastPage?: number) => {
      if (!firebaseUser) return;
      setLoading(true);
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const bookmark: Bookmark = {
          comicId,
          chapterId: chapterId || "",
          lastPage: lastPage || 0,
          updatedAt: Timestamp.now(),
        };

        // Hapus bookmark lama untuk komik yang sama (jika ada) lalu tambah baru
        const existing = userProfile?.bookmarks.find(
          (b) => b.comicId === comicId
        );
        if (existing) {
          await updateDoc(userRef, {
            bookmarks: arrayRemove(existing),
          });
        }

        await updateDoc(userRef, {
          bookmarks: arrayUnion(bookmark),
          updatedAt: serverTimestamp(),
        });

        await refreshProfile();
      } catch (error) {
        console.error("Gagal menambah bookmark:", error);
      } finally {
        setLoading(false);
      }
    },
    [firebaseUser, userProfile, refreshProfile]
  );

  /** Hapus bookmark */
  const removeBookmark = useCallback(
    async (comicId: string) => {
      if (!firebaseUser || !userProfile) return;
      setLoading(true);
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const existing = userProfile.bookmarks.find(
          (b) => b.comicId === comicId
        );
        if (existing) {
          await updateDoc(userRef, {
            bookmarks: arrayRemove(existing),
            updatedAt: serverTimestamp(),
          });
        }
        await refreshProfile();
      } catch (error) {
        console.error("Gagal menghapus bookmark:", error);
      } finally {
        setLoading(false);
      }
    },
    [firebaseUser, userProfile, refreshProfile]
  );

  /** Toggle bookmark */
  const toggleBookmark = useCallback(
    async (comicId: string) => {
      if (isBookmarked(comicId)) {
        await removeBookmark(comicId);
      } else {
        await addBookmark(comicId);
      }
    },
    [isBookmarked, addBookmark, removeBookmark]
  );

  return {
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    loading,
  };
}
