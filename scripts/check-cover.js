const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const https = require('https');

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('serviceAccountKey.json not found');
  process.exit(1);
}
const serviceAccount = require(serviceAccountPath);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id + '.appspot.com') });
const db = admin.firestore();

async function run() {
  console.log('Listing comics docs and cover/pages fields (limit 50)');
  const snaps = await db.collection('comics').limit(50).get();
  for (const doc of snaps.docs) {
    const data = doc.data();
    console.log('DOC:', doc.id, 'slug:', data.slug || '', 'title:', data.title || '');
    console.log('  cover:', data.cover || '(none)');
    console.log('  pages:', Array.isArray(data.pages) ? `${data.pages.length} items` : (data.pages ? JSON.stringify(data.pages).slice(0,200) : '(none)'));

    if (data.cover && typeof data.cover === 'string' && data.cover.startsWith('http')) {
      console.log('  Testing cover URL...');
      await testUrl(data.cover);
    }
  }
}

function testUrl(u){
  return new Promise((resolve)=>{
    https.get(u, (res)=>{
      console.log('    URL status:', res.statusCode, 'content-type:', res.headers['content-type']);
      res.resume();
      resolve();
    }).on('error',(err)=>{
      console.log('    URL error:', err.message);
      resolve();
    });
  });
}

run().catch(err=>{ console.error('Failed:', err); process.exit(1); });
