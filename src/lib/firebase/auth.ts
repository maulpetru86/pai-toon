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
  type Auth,
} from "firebase/auth";
import { auth as firebaseAuth } from "./config";

const googleProvider = new GoogleAuthProvider();

function getAuth(): Auth {
  if (!firebaseAuth) throw new Error("Firebase auth not initialized. This function must be called in the browser.");
  return firebaseAuth as Auth;
}

/**
 * Daftar akun baru dengan email & password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const a = getAuth();
  const credential = await createUserWithEmailAndPassword(a, email, password);
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
  const a = getAuth();
  return signInWithEmailAndPassword(a, email, password);
}

/**
 * Masuk dengan akun Google (popup).
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const a = getAuth();
  return signInWithPopup(a, googleProvider);
}

/**
 * Keluar dari sesi aktif.
 */
export async function signOut(): Promise<void> {
  const a = getAuth();
  return firebaseSignOut(a);
}

/**
 * Listener perubahan status autentikasi.
 */
export function onAuthChange(callback: (user: User | null) => void) {
  const a = getAuth();
  return onAuthStateChanged(a, callback);
}
