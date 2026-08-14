const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const force = args.includes('--force');

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('serviceAccountKey.json not found in project root.');
  process.exit(1);
}
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id + '.appspot.com'),
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

async function run() {
  console.log('Listing files with prefix: comics/');
  const [files] = await bucket.getFiles({ prefix: 'comics/' });
  console.log(`Found ${files.length} files`);

  const coverCandidates = [];
  const regex1 = /^comics\/([^\/]+)\/covers\/([^\/]+)$/; // comics/<slug>/covers/<file>
  const regex2 = /^comics\/([^\/]+)\/cover_[^\/]+\.[^\/]+$/; // comics/<slug>/cover_123.png

  for (const f of files) {
    const name = f.name;
    let m = name.match(regex1);
    if (m) {
      coverCandidates.push({ slug: m[1], path: name });
      continue;
    }
    m = name.match(regex2);
    if (m) {
      coverCandidates.push({ slug: m[1], path: name });
      continue;
    }
  }

  console.log(`Found ${coverCandidates.length} cover candidates`);

  let updated = 0;
  for (const c of coverCandidates) {
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(c.path)}?alt=media`;
    // find comic by slug
    const q = await db.collection('comics').where('slug', '==', c.slug).limit(1).get();
    if (q.empty) {
      console.log(`No comic doc with slug=${c.slug} (path=${c.path})`);
      continue;
    }
    const doc = q.docs[0];
    const data = doc.data();
    if (data.coverUrl && !force) {
      console.log(`Skipping ${c.slug} (already has coverUrl)`);
      continue;
    }
    await doc.ref.set({ coverUrl: url }, { merge: true });
    console.log(`Wrote coverUrl for ${c.slug} -> ${url}`);
    updated++;
  }

  console.log(`Done. Updated ${updated} comics.`);
}

run().catch(err => { console.error('Migration failed:', err); process.exit(1); });
