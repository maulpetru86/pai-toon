import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

/**
 * Daftar akun baru dengan email & password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential;
}

/**
 * Masuk dengan email & password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Masuk dengan akun Google (popup).
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

/**
 * Keluar dari sesi aktif.
 */
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Listener perubahan status autentikasi.
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
