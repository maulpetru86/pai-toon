import { Readable } from "stream";
import { readFileSync } from "fs";
import { google } from "googleapis";
import { NextResponse } from "next/server";

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "1x65w2MsiEVqrOuk2rpeWp82TfomgIwKz";

function getServiceAccountCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    return JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH, "utf8"));
  }

  throw new Error(
    "Service account credentials tidak ditemukan. Set `GOOGLE_SERVICE_ACCOUNT_KEY` atau `GOOGLE_SERVICE_ACCOUNT_KEY_PATH`."
  );
}

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getServiceAccountCredentials(),
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({ version: "v3", auth });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type harus multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folderId = formData.get("folderId")?.toString() || DRIVE_FOLDER_ID;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "File tidak ditemukan dalam field 'file'." },
        { status: 400 }
      );
    }

    const fileName = formData.get("fileName")?.toString() || (file as File).name || "upload-file";
    const mimeType = (file as File).type || "application/octet-stream";
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const drive = getDriveClient();
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType,
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: "id, name, mimeType, webViewLink, webContentLink",
    });

    const result = response.data;
    if (!result.id) {
      throw new Error("Google Drive tidak mengembalikan file id.");
    }

    await drive.permissions.create({
      fileId: result.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return NextResponse.json({
      id: result.id,
      name: result.name,
      mimeType: result.mimeType,
      webViewLink: result.webViewLink,
      webContentLink: result.webContentLink,
    });
  } catch (error) {
    console.error("Drive upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload ke Google Drive gagal.",
      },
      { status: 500 }
    );
  }
}
