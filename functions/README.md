Cloud Function: optimizeImageOnUpload

What it does:
- Trigger: storage.object().onFinalize (when an object is uploaded)
- Converts images to WebP and generates 3 sizes (320,640,1024)
- Uploads optimized files to: <original_dir>/optimized/<filename>_opt_<size>.webp
- Sets long cache-control
- Writes optimized URLs to Firestore in the comic document (field optimized.webp)

Deploy steps:
1. Install Firebase CLI and have project configured: `npm i -g firebase-tools`
2. In project root, run: `cd functions && npm install`
3. Deploy functions: `firebase deploy --only functions:optimizeImageOnUpload`

Notes:
- Requires Blaze billing for Cloud Functions and potentially for egress.
- sharp requires native binaries; npm install will compile or fetch prebuilt.
- Ensure service account & function runtime have access to Storage and Firestore.
