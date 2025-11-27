# Google Drive Upload & Google Sheets Integration

Sistem otomatis untuk upload file ke Google Drive dan menyimpan link-nya ke Google Sheets menggunakan TypeScript/Node.js.

## 📋 Fitur

- ✅ Upload file ke Google Drive secara otomatis
- ✅ Simpan link file (view & download) ke Google Sheets
- ✅ Support upload ke folder tertentu di Drive
- ✅ Custom nama file
- ✅ Automatic sheet creation
- ✅ Full error handling

## 🚀 Setup

### 1. Google Cloud Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau gunakan yang sudah ada
3. Enable APIs:
   - Google Drive API
   - Google Sheets API
4. Buat Service Account:
   - Go to "Service Accounts"
   - Create new service account
   - Create & download JSON key
   - Rename ke `service-account.json` di root project

### 2. Setup Google Sheets

1. Buat Google Sheet baru di Drive
2. Share dengan email dari service account (format: `xxx@xxx.iam.gserviceaccount.com`)
3. Copy Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 3. Setup Google Drive Folder (Optional)

1. Buat folder di Google Drive untuk upload files
2. Share dengan email service account
3. Copy Folder ID dari URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]
   ```

## 📁 File Structure

```
lib/
  └── google-api.ts          # Google APIs utility functions
app/api/
  └── upload-to-drive/
      └── route.ts           # API endpoint for upload
components/
  └── drive-upload.tsx       # React component for upload UI
```

## 🔧 API Usage

### Endpoint
```
POST /api/upload-to-drive
Content-Type: multipart/form-data
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | ✅ Yes | File to upload |
| `spreadsheetId` | string | ✅ Yes | Google Sheets ID |
| `sheetTitle` | string | ❌ No | Sheet name (default: "Uploads") |
| `folderId` | string | ❌ No | Google Drive folder ID |
| `fileName` | string | ❌ No | Custom file name |

### Example Request (JavaScript/Fetch)

```typescript
const uploadFile = async (file: File, spreadsheetId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("spreadsheetId", spreadsheetId);
  formData.append("sheetTitle", "Presensi");
  formData.append("folderId", "YOUR_FOLDER_ID"); // Optional

  const response = await fetch("/api/upload-to-drive", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  
  if (data.success) {
    console.log("Uploaded:", data.data);
    // {
    //   fileName: "photo.jpg",
    //   driveId: "xxx",
    //   viewLink: "https://drive.google.com/file/d/xxx/view",
    //   downloadLink: "https://drive.google.com/uc?id=xxx&export=download",
    //   uploadedAt: "28/11/2025, 10:30:00"
    // }
  }
};
```

### Example Response

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileName": "attendance-photo.jpg",
    "driveId": "1a2b3c4d5e6f",
    "viewLink": "https://drive.google.com/file/d/1a2b3c4d5e6f/view",
    "downloadLink": "https://drive.google.com/uc?id=1a2b3c4d5e6f&export=download",
    "uploadedAt": "28/11/2025, 10:30:00"
  }
}
```

## 🎨 React Component Usage

```tsx
import { DriveUploadComponent } from "@/components/drive-upload";

export default function Page() {
  return (
    <div>
      <h1>Upload Attendance</h1>
      <DriveUploadComponent />
    </div>
  );
}
```

## 📊 Google Sheets Format

Setelah upload, data akan tersimpan di Google Sheets dengan format:

| Kolom A (Nama File) | Kolom B (View Link) | Kolom C (Download Link) | Kolom D (Waktu) |
|---|---|---|---|
| photo-001.jpg | [Link] | [Link] | 28/11/2025, 10:30:00 |
| photo-002.jpg | [Link] | [Link] | 28/11/2025, 10:35:00 |

## 🔍 Backend Functions

### `uploadToDrive(fileBuffer, fileName, folderId?)`
Upload file ke Google Drive
```typescript
const result = await uploadToDrive(fileBuffer, "my-file.jpg", "FOLDER_ID");
// Returns: { id, name, viewLink, downloadLink }
```

### `saveToSheets(spreadsheetId, range, values)`
Save data ke Google Sheets
```typescript
await saveToSheets(
  "SHEET_ID",
  "Sheet1!A:D",
  [["photo.jpg", "link", "download-link", "28/11/2025"]]
);
```

### `ensureSheetExists(spreadsheetId, sheetTitle)`
Ensure sheet ada, atau buat jika belum ada
```typescript
await ensureSheetExists("SHEET_ID", "Presensi");
```

### `createSheetHeader(spreadsheetId, sheetTitle, headers)`
Create header untuk sheet
```typescript
await createSheetHeader(
  "SHEET_ID",
  "Presensi",
  ["Nama File", "View Link", "Download Link", "Waktu Upload"]
);
```

## ⚙️ Environment Variables

Buat file `.env.local` (JANGAN di-upload ke git):
```
# Optional: jika service account di tempat lain
GOOGLE_SERVICE_ACCOUNT_PATH=/path/to/service-account.json
```

## 🚨 Error Handling

```typescript
try {
  const result = await uploadToDrive(fileBuffer, "file.jpg");
} catch (error) {
  if (error instanceof Error) {
    console.error("Upload failed:", error.message);
    // - "service-account.json not found"
    // - "File too large"
    // - "Invalid folder ID"
    // - "Authentication failed"
  }
}
```

## 🔐 Security Best Practices

1. ✅ `service-account.json` sudah di `.gitignore` - TIDAK di-upload ke git
2. ✅ Share Sheet & Folder hanya dengan service account email
3. ✅ Validate file type & size di client & server
4. ✅ Use rate limiting untuk prevent abuse
5. ✅ Monitor API quota di Google Cloud Console

## 📈 Monitoring

Monitor Google Cloud APIs usage:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Quotas"
4. Check Drive API & Sheets API quotas

## 🛠️ Troubleshooting

### Error: "service-account.json not found"
- Pastikan file ada di root project
- Pastikan file tidak di `.gitignore` saat development

### Error: "Permission denied"
- Pastikan Service Account email punya access ke Sheet
- Share Sheet dengan service account email
- Pastikan Drive API & Sheets API sudah enabled

### Error: "Invalid Spreadsheet ID"
- Copy ID dengan benar dari URL: `docs.google.com/spreadsheets/d/[ID]`
- ID harus valid format

### Error: "File too large"
- Google Drive punya limit ukuran file
- Compress file sebelum upload

## 📚 References

- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
- [google-auth-library](https://www.npmjs.com/package/google-auth-library)

## 💡 Tips

1. **Batch Upload**: Untuk upload multiple files, gunakan `Promise.all()`
2. **Compress Images**: Gunakan library seperti `sharp` untuk compress sebelum upload
3. **Progress Tracking**: Track upload progress menggunakan event listeners
4. **Scheduled Uploads**: Gunakan `node-cron` untuk scheduled uploads
5. **Retry Logic**: Implement retry dengan exponential backoff untuk failed uploads

## 📞 Support

Jika ada error atau pertanyaan, check:
- Google Cloud Console logs
- Browser console untuk client-side errors
- Network tab untuk request/response details
