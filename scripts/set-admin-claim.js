const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

/**
 * Script untuk set Custom Claims "admin" ke Firebase Auth user.
 * 
 * CARA PAKAI:
 * 1. Download file serviceAccountKey.json dari Firebase Console
 *    (Project Settings > Service Accounts > Generate new private key)
 * 2. Taruh file tersebut di root folder proyek ini (sejajar dengan package.json)
 * 3. Buka terminal dan jalankan: node scripts/set-admin-claim.js <EMAIL_ADMIN>
 */

const args = process.argv.slice(2);
const targetEmail = args[0];

if (!targetEmail) {
  console.error("❌ ERROR: Email belum dimasukkan!");
  console.log("👉 Cara pakai: node scripts/set-admin-claim.js nama@emailanda.com");
  process.exit(1);
}

const serviceAccountPath = path.resolve(__dirname, "../serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ ERROR: File serviceAccountKey.json tidak ditemukan!");
  console.log("Silakan download private key dari Firebase Console (Project Settings > Service Accounts) dan simpan di root folder dengan nama serviceAccountKey.json");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    console.log(`✅ BERHASIL! User dengan email ${email} (UID: ${user.uid}) telah diberi hak akses Admin.`);
    console.log("Storage Rules sekarang akan mengizinkan user ini mengupload file.");
    console.log("⚠️ Silakan Logout dan Login kembali di web agar token Auth diperbarui.");
    process.exit(0);
  } catch (error) {
    console.error("❌ GAGAL mengatur custom claim:", error.message);
    process.exit(1);
  }
}

setAdminClaim(targetEmail);
