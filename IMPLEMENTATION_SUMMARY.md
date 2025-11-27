# 📤 Google Drive Upload + Google Sheets Integration

**Created:** November 28, 2025

Sistem otomatis untuk upload file ke Google Drive dan menyimpan link-nya ke Google Sheets menggunakan **JavaScript/TypeScript (Node.js)** di Next.js environment.

## ✨ Fitur Utama

✅ **Upload Otomatis ke Google Drive**

- Upload file dengan mudah ke Google Drive
- Support upload ke folder tertentu
- Custom nama file

✅ **Auto-Save Link ke Google Sheets**

- Link (view + download) otomatis tersimpan di Google Sheets
- Support multiple sheets
- Automatic sheet creation

✅ **Attendance with Camera**

- Capture photo dari webcam
- Automatic geolocation
- One-click check-in/check-out

✅ **Responsive & User-Friendly**

- React components ready to use
- Shadcn UI components
- Mobile-friendly interface

✅ **Production Ready**

- Full error handling
- Input validation
- Secure credential management
- Already in .gitignore

## 📁 File Structure

```
lib/
  ├── google-api.ts                    # Google APIs utilities
  │   ├── uploadToDrive()             # Upload ke Drive
  │   ├── saveToSheets()              # Save link ke Sheets
  │   ├── ensureSheetExists()         # Create sheet jika perlu
  │   └── createSheetHeader()         # Create header
  │
  ├── attendance-drive-service.ts     # Attendance logic
  │   ├── uploadAttendanceRecord()    # Upload attendance
  │   ├── uploadBatchAttendance()     # Batch upload
  │   └── getAttendanceSummary()      # Get summary
  │
  └── image-compression.ts            # Image utils (existing)
     ├── compressImage()
     ├── compressImageBlob()
     └── getBlobSizeMB()

app/api/
  ├── upload-to-drive/route.ts       # Upload API endpoint
  │   ├── POST: Upload file & save link
  │   └── GET: API documentation
  │
  └── attendance/route.ts            # Attendance API endpoint
     ├── POST: Submit attendance
     └── GET: API documentation

components/
  ├── drive-upload.tsx               # Upload UI component
  │   └── Features:
  │       - File selector
  │       - Spreadsheet ID input
  │       - Optional: Folder ID
  │       - Custom file name
  │       - Success response with links
  │
  └── camera-attendance.tsx          # Attendance camera component
     └── Features:
         - Camera capture
         - Employee info input
         - Geolocation
         - Check-in/Check-out toggle
         - Success feedback

docs/
  ├── GOOGLE_DRIVE_SETUP.md         # Full documentation
  ├── GOOGLE_CONFIG_EXAMPLE.md      # Setup guide
  └── QUICK_START_GOOGLE_DRIVE.md  # Quick start guide
```

## 🚀 Quick Start (3 Steps)

### 1️⃣ Setup Service Account (5 min)

```bash
# Di Google Cloud Console:
# 1. Enable: Google Drive API + Google Sheets API
# 2. Create Service Account
# 3. Download JSON key
# 4. Rename to service-account.json di root project
```

### 2️⃣ Share dengan Service Account (2 min)

```bash
# Ambil email dari service-account.json
# Share Google Sheets → Editor
# Share Google Drive Folder → Editor
```

### 3️⃣ Use Components (1 min)

```tsx
import { DriveUploadComponent } from "@/components/drive-upload";
import { CameraAttendanceComponent } from "@/components/camera-attendance";

// Atau langsung dengan API
```

## 🔌 API Usage

### Upload File

```bash
POST /api/upload-to-drive

# Request:
Content-Type: multipart/form-data
- file: File              ✓ required
- spreadsheetId: string   ✓ required
- sheetTitle: string      optional (default: "Uploads")
- folderId: string        optional
- fileName: string        optional

# Response:
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

### Submit Attendance

```bash
POST /api/attendance

# Request:
Content-Type: multipart/form-data
- file: File              ✓ required (photo)
- employeeId: string      ✓ required
- employeeName: string    ✓ required
- spreadsheetId: string   ✓ required
- driveFolderId: string   ✓ required
- status: string          check-in or check-out
- latitude: number        optional
- longitude: number       optional

# Response:
{
  "success": true,
  "data": {
    "employeeId": "EMP001",
    "employeeName": "John Doe",
    "status": "check-in",
    "timestamp": "28/11/2025, 10:30:00",
    "driveFile": "xxx"
  }
}
```

## 💻 Code Examples

### Upload dengan React Component

```tsx
import { DriveUploadComponent } from "@/components/drive-upload";

export default function Page() {
  return <DriveUploadComponent />;
}
```

### Upload dengan API Call

```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("spreadsheetId", "YOUR_SHEET_ID");
  formData.append("driveFolderId", "YOUR_FOLDER_ID");

  const response = await fetch("/api/upload-to-drive", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};
```

### Attendance dengan Camera

```tsx
import { CameraAttendanceComponent } from "@/components/camera-attendance";

export default function Page() {
  return <CameraAttendanceComponent />;
}
```

### Direct Backend Call

```typescript
import { uploadToDrive, saveToSheets } from "@/lib/google-api";

// Upload file
const file = await uploadToDrive(buffer, "filename.jpg", "folderId");

// Save to sheets
await saveToSheets("spreadsheetId", "Sheet1!A:D", [
  ["filename.jpg", file.viewLink, file.downloadLink, new Date()],
]);
```

## 📊 Google Sheets Format

**Uploads Sheet:**
| Nama File | View Link | Download Link | Waktu Upload |
|-----------|-----------|---------------|--------------|
| photo.jpg | [Link] | [Link] | 28/11/2025 |

**Attendance Sheet (Attendance_2025-11):**
| Waktu | ID | Nama | Status | Lokasi | View Link | Download Link |
|------|----|----|--------|-------|-----------|---------------|
| 28/11 10:30 | EMP001 | John | check-in | -7.25, 112.75 | [Link] | [Link] |

## 🔐 Security

✅ **Credentials Protected**

- `service-account.json` sudah di .gitignore
- TIDAK akan ter-upload ke Git
- Safe untuk commit code

✅ **Best Practices**

- Use Service Account (not OAuth)
- Share Sheet/Folder hanya dengan service account
- Validate input di client & server
- Error handling untuk semua cases

## 🛠️ Dependencies

Sudah included di package.json:

```json
{
  "googleapis": "^166.0.0",
  "google-auth-library": "latest",
  "google-spreadsheet": "latest"
}
```

Tidak perlu install lagi! Sudah ready to use.

## 📖 Documentation

3 file dokumentasi lengkap:

1. **QUICK_START_GOOGLE_DRIVE.md** (← START HERE)

   - Setup dalam 5 menit
   - Quick examples
   - Troubleshooting

2. **GOOGLE_DRIVE_SETUP.md**

   - Dokumentasi lengkap
   - Penjelasan detail setiap fungsi
   - API reference
   - Best practices

3. **GOOGLE_CONFIG_EXAMPLE.md**
   - Setup step-by-step
   - Configuration details
   - Security notes

## 🧪 Testing

```bash
# Test endpoints
curl http://localhost:3000/api/upload-to-drive
curl http://localhost:3000/api/attendance

# Kedua endpoint akan return dokumentasi format request
```

## 🔧 Troubleshooting

| Error                            | Solusi                                             |
| -------------------------------- | -------------------------------------------------- |
| "service-account.json not found" | Pastikan file di root project                      |
| "Permission denied"              | Share Sheet/Folder dengan service account email    |
| "Invalid Spreadsheet ID"         | Copy dari URL: docs.google.com/spreadsheets/d/[ID] |
| "File too large"                 | Gunakan `compressImageBlob()` sebelum upload       |

## 📈 What's Next?

Suggestions untuk extend:

- [ ] Add batch upload functionality
- [ ] Add progress tracking
- [ ] Add retry logic with exponential backoff
- [ ] Add rate limiting
- [ ] Add logging & monitoring
- [ ] Add image optimization/compression
- [ ] Add scheduled uploads
- [ ] Add analytics dashboard

## 📚 References

- [Google Drive API](https://developers.google.com/drive/api)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [googleapis npm](https://www.npmjs.com/package/googleapis)
- [google-auth-library](https://www.npmjs.com/package/google-auth-library)

## ✅ Checklist untuk Deploy

- [ ] Setup service-account.json
- [ ] Enable Google Drive API
- [ ] Enable Google Sheets API
- [ ] Share Sheets dengan service account
- [ ] Share Drive Folder dengan service account
- [ ] Test upload with component
- [ ] Test attendance with camera
- [ ] Configure environment variables (optional)
- [ ] Deploy to production

---

**Status:** ✅ Production Ready  
**Last Updated:** November 28, 2025  
**Files Changed:** 10 files created/modified  
**Commits:** 1 commit
