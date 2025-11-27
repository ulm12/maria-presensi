# 🚀 Quick Reference Card - Google Drive Upload

## 📦 Instalasi

Dependencies sudah ada di `package.json`:

```json
"googleapis": "^166.0.0",
"google-auth-library": "latest"
```

Tidak perlu install lagi! Ready to use.

---

## ⚙️ Setup (5 menit)

### 1. Create Service Account

```bash
Google Cloud Console → Service Accounts → Create → Download JSON
Rename ke: service-account.json
Lokasi: root project folder
```

### 2. Share

```bash
Google Sheets   → Share dengan service account email → Editor
Google Drive    → Share folder dengan service account email → Editor
```

### 3. Copy IDs

```bash
Spreadsheet ID: docs.google.com/spreadsheets/d/[COPY THIS]
Folder ID:      drive.google.com/drive/folders/[COPY THIS]
```

---

## 💻 Code Examples

### React Component (Recommended)

```tsx
import { DriveUploadComponent } from "@/components/drive-upload";

export default function Page() {
  return <DriveUploadComponent />;
}
```

### Attendance dengan Camera

```tsx
import { CameraAttendanceComponent } from "@/components/camera-attendance";

export default function Page() {
  return <CameraAttendanceComponent />;
}
```

### API Call (JavaScript/Fetch)

```javascript
const uploadFile = async (file, spreadsheetId, folderId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("spreadsheetId", spreadsheetId);
  formData.append("driveFolderId", folderId);

  const res = await fetch("/api/upload-to-drive", {
    method: "POST",
    body: formData,
  });

  return await res.json();
};

// Usage
const result = await uploadFile(
  fileInput.files[0],
  "YOUR_SHEET_ID",
  "YOUR_FOLDER_ID"
);

console.log(result.data.viewLink); // Google Drive link
console.log(result.data.downloadLink); // Direct download link
```

### Direct Backend Call (TypeScript)

```typescript
import { uploadToDrive, saveToSheets } from "@/lib/google-api";

// 1. Upload ke Drive
const file = await uploadToDrive(fileBuffer, "photo.jpg", "YOUR_FOLDER_ID");

// 2. Save link ke Sheets
await saveToSheets("YOUR_SHEET_ID", "Sheet1!A:D", [
  [file.name, file.viewLink, file.downloadLink, new Date()],
]);
```

### Attendance

```typescript
import { uploadAttendanceRecord } from "@/lib/attendance-drive-service";

const result = await uploadAttendanceRecord(
  {
    employeeId: "EMP001",
    employeeName: "John Doe",
    photo: photoBlob,
    timestamp: new Date(),
    location: { latitude: -7.25, longitude: 112.75 },
    status: "check-in",
  },
  "YOUR_SHEET_ID",
  "YOUR_FOLDER_ID"
);
```

---

## 🔗 API Endpoints

### Upload File

```
POST /api/upload-to-drive
Content-Type: multipart/form-data

Fields:
- file            (File)      ✓ required
- spreadsheetId   (string)    ✓ required
- driveFolderId   (string)    optional
- sheetTitle      (string)    optional (default: "Uploads")
- fileName        (string)    optional

Response:
{
  "success": true,
  "data": {
    "fileName": "photo.jpg",
    "driveId": "xxx",
    "viewLink": "https://drive.google.com/file/d/xxx/view",
    "downloadLink": "https://...",
    "uploadedAt": "28/11/2025, 10:30:00"
  }
}
```

### Attendance

```
POST /api/attendance
Content-Type: multipart/form-data

Fields:
- file            (File)      ✓ required
- employeeId      (string)    ✓ required
- employeeName    (string)    ✓ required
- spreadsheetId   (string)    ✓ required
- driveFolderId   (string)    ✓ required
- status          (string)    check-in | check-out
- latitude        (number)    optional
- longitude       (number)    optional

Response:
{
  "success": true,
  "data": {
    "employeeId": "EMP001",
    "employeeName": "John Doe",
    "status": "check-in",
    "timestamp": "28/11/2025, 10:30:00"
  }
}
```

---

## 📚 Functions Reference

### Upload to Drive

```typescript
uploadToDrive(fileBuffer, fileName, folderId?)
→ { id, name, viewLink, downloadLink }
```

### Save to Sheets

```typescript
saveToSheets(spreadsheetId, range, values)
→ API response
```

### Ensure Sheet Exists

```typescript
ensureSheetExists(spreadsheetId, sheetTitle)
→ true | throws error
```

### Compress Image

```typescript
compressImageBlob(blob, maxWidth?, quality?)
→ Blob (compressed)
```

---

## 🎯 Typical Flow

```
User Upload
    ↓
Client: <DriveUploadComponent />
    ↓
POST /api/upload-to-drive
    ↓
Server: uploadToDrive()
    ↓
Google Drive API (upload file)
    ↓
Server: saveToSheets()
    ↓
Google Sheets API (save link)
    ↓
Return: { viewLink, downloadLink, ... }
    ↓
Client: Show success + links
```

---

## 🆘 Troubleshooting

| Error                            | Fix                                            |
| -------------------------------- | ---------------------------------------------- |
| "service-account.json not found" | Check file exists in root folder               |
| "Permission denied"              | Share Sheet/Folder with service account email  |
| "Invalid Spreadsheet ID"         | Copy from: docs.google.com/spreadsheets/d/[ID] |
| "File too large"                 | Use `compressImageBlob()` first                |
| "Network error"                  | Check internet connection & API quotas         |

---

## ✅ Checklist

- [ ] Create service-account.json
- [ ] Enable Drive API
- [ ] Enable Sheets API
- [ ] Share Sheets
- [ ] Share Drive Folder
- [ ] Test with component
- [ ] Ready to deploy!

---

## 📖 More Resources

- `QUICK_START_GOOGLE_DRIVE.md` - Full setup guide
- `GOOGLE_DRIVE_SETUP.md` - Complete documentation
- `IMPLEMENTATION_SUMMARY.md` - System overview
- Source files: Check comments di code

---

**Need Help?** Check the documentation files or test endpoints:

```bash
GET /api/upload-to-drive
GET /api/attendance
```

Good luck! 🚀
