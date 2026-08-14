const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const os = require('os');
const path = require('path');
const fs = require('fs');

admin.initializeApp();
const storage = new Storage();

// Trigger on finalized object (new upload)
exports.optimizeImageOnUpload = functions.storage.object().onFinalize(async (object) => {
  const bucketName = object.bucket;
  const contentType = object.contentType || '';
  const filePath = object.name; // e.g. comics/<slug>/cover_...png
  if (!filePath) return null;
  if (!contentType.startsWith('image/')) return null; // only images

  // Avoid processing files we already generated
  if (filePath.includes('/optimized/') || filePath.includes('_opt_')) {
    console.log('Skipping already-optimized file:', filePath);
    return null;
  }

  const bucket = storage.bucket(bucketName);
  const tmpFilePath = path.join(os.tmpdir(), path.basename(filePath));
  const tempLocalDir = path.dirname(tmpFilePath);
  if (!fs.existsSync(tempLocalDir)) fs.mkdirSync(tempLocalDir, { recursive: true });

  // Download file locally
  await bucket.file(filePath).download({ destination: tmpFilePath });
  console.log('Downloaded to', tmpFilePath);

  const sizes = [320, 640, 1024];
  const optimizedFiles = {}; // size -> public url

  for (const size of sizes) {
    const outFileName = `${path.basename(filePath, path.extname(filePath))}_opt_${size}.webp`;
    const outPath = path.join(os.tmpdir(), outFileName);
    await sharp(tmpFilePath)
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);

    // upload back
    const destPath = path.join(path.dirname(filePath), 'optimized', outFileName).replace(/\\/g, '/');
    await bucket.upload(outPath, {
      destination: destPath,
      metadata: {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000, s-maxage=31536000, immutable'
      }
    });
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destPath)}?alt=media`;
    optimizedFiles[size] = publicUrl;

    // cleanup
    try { fs.unlinkSync(outPath); } catch(e){}
  }

  // Optionally write optimized urls to Firestore if file is a cover or matches comics/<slug>/...
  // derive slug
  const m = filePath.match(/^comics\/([^\/]+)\//);
  if (m) {
    const slug = m[1];
    const docRef = admin.firestore().collection('comics').where('slug', '==', slug).limit(1);
    const snap = await docRef.get();
    if (!snap.empty) {
      const doc = snap.docs[0];
      await doc.ref.set({ optimized: { webp: optimizedFiles } }, { merge: true });
      console.log('Wrote optimized urls to comic', slug);
    } else {
      console.log('No comic doc found for slug', slug);
    }
  }

  // cleanup downloaded file
  try { fs.unlinkSync(tmpFilePath); } catch (e) {}
  return null;
});
