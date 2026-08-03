export interface DriveUploadResult {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  publicUrl: string;
}

export async function uploadToDrive(
  file: File,
  fileName?: string,
  folderId?: string
): Promise<DriveUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", fileName || file.name);
  if (folderId) {
    formData.append("folderId", folderId);
  }

  const response = await fetch("/api/drive-upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Upload ke Google Drive gagal.");
  }

  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    webViewLink: data.webViewLink,
    publicUrl: data.webContentLink || data.webViewLink || "",
  } as DriveUploadResult;
}
