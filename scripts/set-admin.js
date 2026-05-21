/**
 * Script untuk menjadikan user sebagai Admin.
 * 
 * Cara pakai:
 * 1. Login dulu di app (/login) dengan akun yang ingin dijadikan admin
 * 2. Buka browser console (F12 → Console)
 * 3. Copy-paste kode di bawah ini
 * 4. Ganti EMAIL di bawah dengan email Anda
 * 5. Tekan Enter
 * 6. Refresh halaman
 * 
 * Atau jalankan langsung di Firebase Console → Firestore.
 */

// ============================================================
// JALANKAN DI BROWSER CONSOLE (F12) SAAT APP SUDAH TERBUKA
// ============================================================

// Ganti dengan email admin Anda:
const ADMIN_EMAIL = "emailanda@gmail.com";

(async () => {
  const { collection, getDocs, doc, updateDoc, query, where } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js");
  
  // Ambil Firestore instance dari window (sudah di-init oleh app)
  const db = window.__NEXT_DATA__?.props?.pageProps?.db;
  
  console.log("⚠️ Script ini hanya bisa dijalankan langsung di Firebase Console.");
  console.log("");
  console.log("📋 INSTRUKSI MANUAL:");
  console.log("1. Buka https://console.firebase.google.com");
  console.log("2. Pilih project PAI-Toon");
  console.log("3. Klik Firestore Database");
  console.log("4. Buka collection 'users'");
  console.log("5. Cari dokumen dengan email: " + ADMIN_EMAIL);
  console.log("6. Klik dokumen tersebut");
  console.log("7. Ubah field 'role' dari 'student' menjadi 'admin'");
  console.log("8. Klik Save/Update");
  console.log("9. Refresh app di browser → akses /admin");
  console.log("");
  console.log("✅ Selesai! Anda sekarang bisa akses /admin");
})();
