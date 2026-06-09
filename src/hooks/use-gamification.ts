"use client";

import { useCallback } from "react";
import { doc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/auth-context";

const XP_PER_CHAPTER = 50;
const XP_PER_LEVEL = 1000;

export function useGamification() {
  const { firebaseUser, userProfile, refreshProfile } = useAuth();

  const awardXpForReading = useCallback(async (comicId: string, chapterId: string) => {
    if (!firebaseUser || !userProfile) return;

    // Pastikan user belum pernah membaca chapter ini sebelumnya
    const readChapters = userProfile.readChapters || [];
    const chapterIdentifier = `${comicId}_${chapterId}`;

    if (readChapters.includes(chapterIdentifier)) {
      // Sudah pernah dibaca, tidak dapat XP tambahan
      return;
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      
      // Kalkulasi XP dan Level baru
      const newXp = userProfile.xp + XP_PER_CHAPTER;
      const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

      // Kalkulasi Streak
      let newStreak = userProfile.readingStreak || 0;
      const now = new Date();
      const lastRead = userProfile.lastReadAt ? userProfile.lastReadAt.toDate() : null;

      if (lastRead) {
        const diffTime = Math.abs(now.getTime() - lastRead.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          // Hari yang sama, biarkan streak
        } else if (diffDays === 2) {
          // Hari berikutnya, tambah streak
          newStreak += 1;
        } else if (diffDays > 2) {
          // Terlewat hari, reset streak
          newStreak = 1;
        }
      } else {
        // Baru pertama kali baca
        newStreak = 1;
      }

      await updateDoc(userRef, {
        xp: newXp,
        level: newLevel,
        readingStreak: newStreak,
        lastReadAt: serverTimestamp(),
        readChapters: arrayUnion(chapterIdentifier)
      });

      // Refresh profile di context agar UI update
      await refreshProfile();

    } catch (error) {
      console.error("Gagal menambahkan XP:", error);
    }
  }, [firebaseUser, userProfile, refreshProfile]);

  return { awardXpForReading };
}
