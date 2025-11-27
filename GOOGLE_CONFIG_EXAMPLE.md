# Google Drive & Sheets Configuration

Berikut ini adalah file contoh untuk setup Google Drive API integration.

## 1. service-account.json (JANGAN di-upload ke Git!)

File ini berisi credentials untuk Google Service Account. 

**Cara mendapatkan:**
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. Go to "Service Accounts" (Search atau di sidebar)
4. Klik "Create Service Account"
5. Fill in details:
   - Service account name: `maria-presensi` (atau nama lainnya)
   - Service account ID: auto-generated
   - Click "Create and Continue"
6. Grant roles:
   - Click "Continue" (atau select roles)
   - Tidak wajib ada role disini
   - Click "Continue" lagi
7. Create Key:
   - Click "Create Key"
   - Choose "JSON"
   - File akan otomatis download
8. Rename file ke `service-account.json` dan letakkan di root project

**File structure:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "xxx@xxx.iam.gserviceaccount.com",
  "client_id": "xxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "xxx"
}
```

## 2. Enable APIs di Google Cloud

Pastikan 2 API sudah enabled:

### Drive API
1. Di Google Cloud Console, search "Drive API"
2. Click "Enable"

### Sheets API
1. Search "Sheets API"
2. Click "Enable"

## 3. Share dengan Service Account

Setelah punya `service-account.json`, ambil `client_email` (format: `xxx@xxx.iam.gserviceaccount.com`)

### Share Google Sheets
1. Buka Google Sheets Anda
2. Click "Share" di kanan atas
3. Paste email service account
4. Give "Editor" permission
5. Click "Share"

### Share Google Drive Folder
1. Buka folder di Google Drive
2. Right-click → Share
3. Paste email service account
4. Give "Editor" permission
5. Click "Share"

## 4. Environment Variables (Optional)

Buat file `.env.local` (JANGAN di-upload ke Git):

```env
# Google Sheets ID untuk attendance
NEXT_PUBLIC_ATTENDANCE_SPREADSHEET_ID=your-spreadsheet-id

# Google Drive Folder ID untuk upload files
NEXT_PUBLIC_ATTENDANCE_DRIVE_FOLDER_ID=your-folder-id
```

⚠️ **IMPORTANT**: Jangan share credentials Anda!
- Jangan commit `service-account.json` ke Git
- Jangan share `service-account.json` dengan orang lain
- Jangan hardcode credentials di code

## 5. Verify Setup

Test setup dengan menjalankan:

```bash
npm run dev
```

Kemudian akses:
- `http://localhost:3000/api/upload-to-drive` (GET) - untuk test endpoint
- `http://localhost:3000/api/attendance` (GET) - untuk test attendance endpoint

## Troubleshooting

**Error: "service-account.json not found"**
- Pastikan file ada di root project
- Check filename: harus exactly `service-account.json`

**Error: "Permission denied"**
- Verify Sheet sudah di-share dengan service account email
- Verify Folder sudah di-share dengan service account email
- Check di Google Cloud Console apakah APIs sudah enabled

**Error: "Invalid credentials"**
- Generate key baru di Google Cloud Console
- Verify private_key tidak corrupted di file

## References
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Google Drive API - Service Account](https://developers.google.com/drive/api/guides/service-accounts)
- [Google Sheets API - Service Account](https://developers.google.com/sheets/api/guides/service-accounts)
