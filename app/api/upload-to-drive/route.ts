import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive, saveToSheets, ensureSheetExists } from "@/lib/google-api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get file from form data
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Get metadata from form data
    const spreadsheetId = formData.get("spreadsheetId") as string;
    const sheetTitle = (formData.get("sheetTitle") as string) || "Uploads";
    const folderId = formData.get("folderId") as string | undefined;
    const fileName = (formData.get("fileName") as string) || file.name;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID is required" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Google Drive
    console.log(`Uploading ${fileName} to Google Drive...`);
    const driveFile = await uploadToDrive(fileBuffer, fileName, folderId);

    // Ensure sheet exists
    console.log(`Ensuring sheet "${sheetTitle}" exists...`);
    await ensureSheetExists(spreadsheetId, sheetTitle);

    // Save link to Google Sheets
    console.log(`Saving link to Google Sheets...`);
    const now = new Date().toLocaleString("id-ID");
    const values = [
      [fileName, driveFile.viewLink, driveFile.downloadLink, now],
    ];

    await saveToSheets(
      spreadsheetId,
      `${sheetTitle}!A:D`,
      values
    );

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        data: {
          fileName: driveFile.name,
          driveId: driveFile.id,
          viewLink: driveFile.viewLink,
          downloadLink: driveFile.downloadLink,
          uploadedAt: now,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Upload API is ready. Use POST to upload files.",
    usage: {
      method: "POST",
      contentType: "multipart/form-data",
      fields: {
        file: "File to upload (required)",
        spreadsheetId: "Google Sheets ID (required)",
        sheetTitle: "Sheet name (optional, default: 'Uploads')",
        folderId: "Google Drive folder ID (optional)",
        fileName: "Custom file name (optional, uses original filename if not provided)",
      },
      example: {
        endpoint: "/api/upload-to-drive",
        method: "POST",
      },
    },
  });
}
