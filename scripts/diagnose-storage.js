const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

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

async function run() {
  console.log('Using bucket:', bucket.name);
  const [files] = await bucket.getFiles({ autoPaginate: true });
  console.log('Found files:', files.length);

  const items = [];
  for (const f of files) {
    try {
      const [meta] = await f.getMetadata();
      const size = parseInt(meta.size || '0', 10);
      items.push({ name: f.name, size, contentType: meta.contentType || '', md: meta });
    } catch (err) {
      console.error('Failed to get metadata for', f.name, err && err.message);
    }
  }

  // totals
  const total = items.reduce((s, it) => s + it.size, 0);

  // group by top-level two segments
  const groups = {};
  for (const it of items) {
    const segments = it.name.split('/');
    const prefix = segments.slice(0, 3).join('/') || '/';
    groups[prefix] = groups[prefix] || { size: 0, count: 0 };
    groups[prefix].size += it.size;
    groups[prefix].count += 1;
  }

  const groupList = Object.entries(groups).map(([k, v]) => ({ prefix: k, ...v })).sort((a,b) => b.size - a.size);

  console.log('\nTotal storage size:', formatSize(total));
  console.log('\nTop prefixes by size:');
  groupList.slice(0,20).forEach(g => console.log(`${g.prefix} — ${g.count} files — ${formatSize(g.size)}`));

  console.log('\nTop 20 largest files:');
  items.sort((a,b) => b.size - a.size).slice(0,20).forEach((it, i) => {
    console.log(`${i+1}. ${it.name} — ${formatSize(it.size)} — ${it.contentType}`);
  });

  // find common big file types
  const byType = {};
  for (const it of items) {
    const t = (it.contentType || 'unknown').split('/')[1] || it.contentType || 'unknown';
    byType[t] = byType[t] || { size:0, count:0 };
    byType[t].size += it.size;
    byType[t].count += 1;
  }
  const types = Object.entries(byType).map(([k,v])=>({type:k,...v})).sort((a,b)=>b.size-a.size);
  console.log('\nStorage by content type:');
  types.forEach(t=>console.log(`${t.type} — ${t.count} files — ${formatSize(t.size)}`));

  console.log('\nDone.');
}

function formatSize(n){
  if (n < 1024) return n + ' B';
  if (n < 1024*1024) return (n/1024).toFixed(1) + ' KB';
  if (n < 1024*1024*1024) return (n/(1024*1024)).toFixed(1) + ' MB';
  return (n/(1024*1024*1024)).toFixed(2) + ' GB';
}

run().catch(err=>{
  console.error('Diagnostic failed:', err);
  process.exit(1);
});
