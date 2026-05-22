"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { onAuthChange } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/config";
import type { User, UserRole } from "@/types";

// ────────────────────────────────────────────────
// Context Type
// ────────────────────────────────────────────────

interface AuthContextType {
  /** Firebase Auth user object (null jika belum login) */
  firebaseUser: FirebaseUser | null;

  /** Profil lengkap dari Firestore (null jika belum login / belum loaded) */
  userProfile: User | null;

  /** Role pengguna saat ini (shortcut dari userProfile.role) */
  role: UserRole | null;

  /** Sedang memuat status autentikasi */
  loading: boolean;

  /** Apakah user sudah login? */
  isAuthenticated: boolean;

  /** Apakah user adalah admin? */
  isAdmin: boolean;

  /** Refresh profil pengguna dari Firestore */
  refreshProfile: () => Promise<void>;
}

// ────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Ambil profil user dari Firestore.
   * Jika dokumen belum ada (first login), otomatis buat dokumen baru
   * dengan role default 'student'.
   */
  const fetchOrCreateProfile = useCallback(
    async (fbUser: FirebaseUser): Promise<User | null> => {
      try {
        const userDocRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          // User sudah ada — kembalikan datanya
          return { uid: fbUser.uid, ...userSnap.data() } as User;
        }

        // User belum ada — buat dokumen baru (first login)
        const newUser: Omit<User, "uid"> = {
          email: fbUser.email || "",
          displayName: fbUser.displayName || "Pengguna Baru",
          photoURL: fbUser.photoURL || undefined,
          role: "student", // Default role untuk user baru
          bookmarks: [],
          readingStreak: 0,
          badges: [],
          totalComicsRead: 0,
          xp: 0,
          level: 1,
          createdAt: serverTimestamp() as unknown as Timestamp,
          updatedAt: serverTimestamp() as unknown as Timestamp,
        };

        await setDoc(userDocRef, newUser);

        return { uid: fbUser.uid, ...newUser };
      } catch (error) {
        console.error("Gagal mengambil/membuat profil user:", error);
        return null;
      }
    },
    []
  );

  /**
   * Refresh profil user dari Firestore (bisa dipanggil manual
   * setelah update profil).
   */
  const refreshProfile = useCallback(async () => {
    if (firebaseUser) {
      const profile = await fetchOrCreateProfile(firebaseUser);
      setUserProfile(profile);
    }
  }, [firebaseUser, fetchOrCreateProfile]);

  // ── Listener: Firebase Auth State ──────────────
  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const profile = await fetchOrCreateProfile(fbUser);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchOrCreateProfile]);

  // ── Derived Values ─────────────────────────────
  const value = useMemo<AuthContextType>(
    () => ({
      firebaseUser,
      userProfile,
      role: userProfile?.role ?? null,
      loading,
      isAuthenticated: !!firebaseUser,
      isAdmin: userProfile?.role === "admin",
      refreshProfile,
    }),
    [firebaseUser, userProfile, loading, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ────────────────────────────────────────────────
// Hook: useAuth
// ────────────────────────────────────────────────

/**
 * Hook untuk mengakses konteks autentikasi.
 * HARUS digunakan di dalam `<AuthProvider>`.
 *
 * @example
 * ```tsx
 * const { userProfile, isAdmin, loading } = useAuth();
 *
 * if (loading) return <LoadingSpinner />;
 * if (!userProfile) return <Redirect to="/login" />;
 * if (isAdmin) return <AdminDashboard />;
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth() harus digunakan di dalam <AuthProvider>. " +
        "Pastikan komponen ini dibungkus oleh AuthProvider di layout."
    );
  }
  return context;
}
