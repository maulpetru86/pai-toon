export interface DriveUploadResult {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  publicUrl: string;
}

import { uploadFile } from "@/lib/firebase/storage";

export async function uploadToDrive(
  file: File,
  fileName?: string,
  folderId?: string
): Promise<DriveUploadResult> {
  const path = folderId ? `${folderId}/${fileName || file.name}` : (fileName || file.name);
  const { url, result } = await uploadFile(path, file);
  const ref: any = (result as any).ref || {};
  const id = ref.fullPath || ref.name || path;
  const name = ref.name || fileName || file.name;
  return {
    id,
    name,
    mimeType: file.type,
    webViewLink: url,
    publicUrl: url,
  } as DriveUploadResult;
}
