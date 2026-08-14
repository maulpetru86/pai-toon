/*
  Script migrasi storage -> tulis array pages ke dokumen chapter di Firestore

  Cara pakai:
    1. Download serviceAccountKey.json dari Firebase Console dan taruh di root proyek
    2. Jalankan: node scripts/migrate-storage.js [--prefix=comics/] [--force]

  Script akan:
    - Daftar semua file di bucket (prefix)
    - Kelompokkan berdasarkan comics/{comicId}/chapters/{chapterId}/...
    - Untuk tiap chapter, urutkan file berdasarkan nama, bangun public download URL dan tulis array ke field `pages` pada dokumen chapter (merge)

  Catatan: URL yang ditulis adalah URL publik `https://firebasestorage.googleapis.com/.../o/<encoded>?alt=media`.
  Jika bucket Anda privat, pertimbangkan menggunakan signed URLs (bisa ditambahkan).
*/

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const prefixArg = args.find((a) => a.startsWith("--prefix="));
const prefix = prefixArg ? prefixArg.split("=")[1] : "comics/";
const force = args.includes("--force");

const serviceAccountPath = path.resolve(__dirname, "../serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("serviceAccountKey.json not found in project root. Download from Firebase Console and place it there.");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id + ".appspot.com"),
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

async function run() {
  console.log("Listing files with prefix:", prefix);
  const [files] = await bucket.getFiles({ prefix });
  console.log(`Found ${files.length} files`);

  // group by comicId/chapterId
  const groups = {}; // { [comicId]: { [chapterId]: [fileName,...] } }
  const regex1 = /^comics\/([^\/]+)\/chapters\/([^\/]+)\/(.+)$/; // comics/<comicId>/chapters/<chapterId>/...
  const regex2 = /^comics\/[^\/]+\/pages\/([^\/]+)\/(ch\d+)\/(.+)$/; // comics/mock/pages/<slug>/ch1/...

  for (const file of files) {
    const name = file.name; // e.g. comics/<comicId>/chapters/<chapterId>/page-01.png or comics/mock/pages/slug/ch1/page-01.png
    console.log("file:", name);
    let m = name.match(regex1);
    let comicId, chapterId, filename;
    if (m) {
      comicId = m[1];
      chapterId = m[2];
      filename = m[3];
    } else {
      m = name.match(regex2);
      if (m) {
        comicId = m[1]; // slug
        chapterId = m[2].replace(/^ch/, ""); // convert ch1 -> 1
        filename = m[3];
      } else {
        console.log("  - no match for expected patterns");
        continue;
      }
    }

    groups[comicId] = groups[comicId] || {};
    groups[comicId][chapterId] = groups[comicId][chapterId] || [];
    groups[comicId][chapterId].push({ fullPath: name, filename });
  }

  console.log("Groups discovered:", Object.keys(groups).length, "comics");
  for (const c of Object.keys(groups)) {
    console.log(` - comic ${c} has ${Object.keys(groups[c]).length} chapters`);
    for (const ch of Object.keys(groups[c])) {
      console.log(`   - chapter ${ch} => ${groups[c][ch].length} files`);
    }
  }

  let totalUpdated = 0;
  for (const comicId of Object.keys(groups)) {
    for (const chapterId of Object.keys(groups[comicId])) {
      const items = groups[comicId][chapterId];
      // sort by filename
      items.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
      const urls = items.map((it) => {
        const bucketName = bucket.name;
        return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(it.fullPath)}?alt=media`;
      });

      // read existing doc
      const chapterRef = db.collection("comics").doc(comicId).collection("chapters").doc(chapterId);
      const snap = await chapterRef.get();
      if (snap.exists && !force) {
        const existing = snap.exists ? snap.data() : null;
        if (existing && existing.pages && Array.isArray(existing.pages) && existing.pages.length > 0) {
          console.log(`Skipping ${comicId}/${chapterId} — already has pages (use --force to overwrite)`);
          continue;
        }
      }

      await chapterRef.set({ pages: urls }, { merge: true });
      console.log(`Wrote ${urls.length} pages -> comics/${comicId}/chapters/${chapterId}`);
      totalUpdated += 1;
    }
  }

  console.log(`Done. Updated ${totalUpdated} chapter documents.`);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
