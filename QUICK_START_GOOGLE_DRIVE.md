# Quick Start: Google Drive Upload + Google Sheets

Setup dan gunakan sistem upload otomatis dalam 5 menit!

## ⚡ Quick Setup

### 1. Dapatkan Service Account JSON (5 menit)

```bash
# Di Google Cloud Console:
# 1. Buka https://console.cloud.google.com/
# 2. Create new project atau pilih existing
# 3. Search & enable: "Google Drive API"
# 4. Search & enable: "Google Sheets API"
# 5. Buat Service Account:
#    - Go to "Service Accounts"
#    - "Create Service Account"
#    - Fill name: "maria-presensi"
#    - Click "Create and Continue"
#    - Click "Create Key" → "JSON"
#    - Download file
# 6. Rename to service-account.json
# 7. Letakkan di root project folder
```

### 2. Share dengan Service Account (2 menit)

```bash
# Ambil email dari service-account.json: client_email
# Format: xxx@xxx.iam.gserviceaccount.com

# 1. Buka Google Sheets → Share → Paste email → "Editor"
# 2. Buka Google Drive Folder → Share → Paste email → "Editor"
```

### 3. Copy IDs (1 menit)

```bash
# Sheets ID dari URL:
# docs.google.com/spreadsheets/d/[COPY THIS]

# Folder ID dari URL:
# drive.google.com/drive/folders/[COPY THIS]
```

## 🚀 Usage

### Option 1: React Component (Easiest)

```tsx
import { DriveUploadComponent } from "@/components/drive-upload";
// atau untuk attendance dengan camera:
import { CameraAttendanceComponent } from "@/components/camera-attendance";

export default function Page() {
  return <DriveUploadComponent />;
  // atau
  // return <CameraAttendanceComponent />;
}
```

### Option 2: Direct API Call

```typescript
// Upload file ke Drive & save link ke Sheets
const uploadFile = async (file: File, spreadsheetId: string, folderId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("spreadsheetId", spreadsheetId);
  formData.append("folderId", folderId);

  const response = await fetch("/api/upload-to-drive", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.data.viewLink; // Google Drive link
};
```

### Option 3: Attendance with Camera

```typescript
// Capture photo dari camera & submit
const submitAttendance = async (
  photo: Blob,
  employeeId: string,
  spreadsheetId: string,
  folderId: string
) => {
  const formData = new FormData();
  formData.append("file", photo);
  formData.append("employeeId", employeeId);
  formData.append("employeeName", "John Doe");
  formData.append("spreadsheetId", spreadsheetId);
  formData.append("driveFolderId", folderId);
  formData.append("status", "check-in");

  const response = await fetch("/api/attendance", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};
```

## 📋 Files Created

```
lib/
  ├── google-api.ts              # Google APIs utilities
  └── attendance-drive-service.ts # Attendance logic
  
app/api/
  ├── upload-to-drive/route.ts   # Upload API endpoint
  └── attendance/route.ts         # Attendance API endpoint

components/
  ├── drive-upload.tsx            # Upload UI component
  └── camera-attendance.tsx       # Attendance with camera component

docs/
  ├── GOOGLE_DRIVE_SETUP.md       # Full documentation
  └── GOOGLE_CONFIG_EXAMPLE.md    # Configuration guide
```

## 🧪 Test

### Test Upload API
```bash
# GET /api/upload-to-drive
# akan menunjukkan format request

# atau test dengan curl:
curl -X POST http://localhost:3000/api/upload-to-drive \
  -F "file=@photo.jpg" \
  -F "spreadsheetId=YOUR_SHEET_ID" \
  -F "driveFolderId=YOUR_FOLDER_ID"
```

### Test Attendance API
```bash
curl -X POST http://localhost:3000/api/attendance \
  -F "file=@photo.jpg" \
  -F "employeeId=EMP001" \
  -F "employeeName=John Doe" \
  -F "spreadsheetId=YOUR_SHEET_ID" \
  -F "driveFolderId=YOUR_FOLDER_ID" \
  -F "status=check-in" \
  -F "latitude=-7.2506" \
  -F "longitude=112.7508"
```

## 📊 What Gets Saved to Sheets

Setelah upload, ini akan tersimpan di Google Sheets:

```
| Nama File | View Link | Download Link | Waktu Upload |
|-----------|-----------|---------------|--------------|
| photo.jpg | [Link]    | [Link]        | 28/11/2025   |
```

Untuk attendance:
```
| Waktu | ID | Nama | Status | Lokasi | Link View | Link Download |
|------|----|----|--------|-------|-----------|---------------|
```

## 🔧 Troubleshooting

**❌ Error: "service-account.json not found"**
```bash
# Pastikan file ada di root project
# Dan check nama file: EXACTLY service-account.json
ls service-account.json
```

**❌ Error: "Permission denied"**
```bash
# 1. Buka service-account.json
# 2. Copy client_email
# 3. Share Sheets & Folder dengan email tersebut
# 4. Tunggu 1-2 menit propagasi permissions
```

**❌ Error: "Invalid Spreadsheet ID"**
```bash
# Ambil dari URL:
# docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
#                            ^ ambil ini
```

**❌ Error: "File too large"**
```typescript
// Gunakan compression sebelum upload:
import { compressImageBlob } from "@/lib/image-compression";

const compressed = await compressImageBlob(file, 1280, 0.8);
// Ukuran file akan lebih kecil
```

## 📚 Next Steps

1. **Add validation**: Validate file type & size
2. **Add retry logic**: Handle network errors
3. **Add rate limiting**: Prevent abuse
4. **Add logging**: Track uploads
5. **Add batch upload**: Upload multiple files at once
6. **Add progress tracking**: Show upload progress
7. **Integrate dengan app**: Connect ke attendance flow

## 📞 More Info

- Full docs: `GOOGLE_DRIVE_SETUP.md`
- Setup guide: `GOOGLE_CONFIG_EXAMPLE.md`
- Examples: Check comments di source files

---

**Ready?** Start using: `<DriveUploadComponent />` atau `<CameraAttendanceComponent />`
