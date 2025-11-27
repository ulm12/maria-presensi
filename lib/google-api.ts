import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as fs from "fs";
import * as path from "path";

// Initialize Google Auth
const getAuthClient = () => {
  const serviceAccountPath = path.join(
    process.cwd(),
    "service-account.json"
  );

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      "service-account.json not found. Please add your Google service account credentials."
    );
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf-8")
  );

  const auth = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return auth;
};

// Upload file to Google Drive
export const uploadToDrive = async (
  fileBuffer: Buffer,
  fileName: string,
  folderId?: string
) => {
  try {
    const auth = getAuthClient();
    const drive = google.drive({ version: "v3", auth });

    const fileMetadata: any = {
      name: fileName,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: "application/octet-stream",
      body: fileBuffer,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink, webContentLink",
    });

    return {
      id: response.data.id,
      name: response.data.name,
      viewLink: response.data.webViewLink,
      downloadLink: response.data.webContentLink,
    };
  } catch (error) {
    console.error("Error uploading to Drive:", error);
    throw error;
  }
};

// Save link to Google Sheets
export const saveToSheets = async (
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
) => {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error saving to Sheets:", error);
    throw error;
  }
};

// Get or create sheet
export const ensureSheetExists = async (
  spreadsheetId: string,
  sheetTitle: string
) => {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // Get all sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Check if sheet exists
    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetTitle
    );

    if (!sheetExists) {
      // Create new sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitle,
                },
              },
            },
          ],
        },
      });
    }

    return true;
  } catch (error) {
    console.error("Error ensuring sheet exists:", error);
    throw error;
  }
};

// Create spreadsheet header
export const createSheetHeader = async (
  spreadsheetId: string,
  sheetTitle: string,
  headers: string[]
) => {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A1:Z1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers],
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating header:", error);
    throw error;
  }
};
