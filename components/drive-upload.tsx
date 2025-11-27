import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, Link2 } from "lucide-react";

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    fileName: string;
    driveId: string;
    viewLink: string;
    downloadLink: string;
    uploadedAt: string;
  };
  error?: string;
}

export function DriveUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetTitle, setSheetTitle] = useState("Uploads");
  const [folderId, setFolderId] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResponse(null);

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!spreadsheetId) {
      setError("Please enter Spreadsheet ID");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("spreadsheetId", spreadsheetId);
      formData.append("sheetTitle", sheetTitle);
      if (folderId) formData.append("folderId", folderId);
      if (fileName) formData.append("fileName", fileName);

      const res = await fetch("/api/upload-to-drive", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setResponse(data);
        setFile(null);
        setFileName("");
        if (document.querySelector('input[type="file"]')) {
          (document.querySelector('input[type="file"]') as HTMLInputElement).value = "";
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload to Google Drive</CardTitle>
          <CardDescription>
            Upload files automatically to Google Drive and save links to Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Spreadsheet ID - Required */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Spreadsheet ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your Google Sheets ID"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Find it in your Sheets URL: docs.google.com/spreadsheets/d/<strong>THIS_ID</strong>
              </p>
            </div>

            {/* Sheet Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sheet Title</label>
              <Input
                type="text"
                placeholder="Enter sheet name (default: Uploads)"
                value={sheetTitle}
                onChange={(e) => setSheetTitle(e.target.value)}
              />
            </div>

            {/* Folder ID - Optional */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Google Drive Folder ID <span className="text-gray-400">(Optional)</span>
              </label>
              <Input
                type="text"
                placeholder="Leave empty to upload to root Drive folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Find it in folder URL: drive.google.com/drive/folders/<strong>THIS_ID</strong>
              </p>
            </div>

            {/* File - Required */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                File <span className="text-red-500">*</span>
              </label>
              <Input
                type="file"
                onChange={handleFileChange}
                required
              />
              {file && (
                <p className="text-sm text-green-600">
                  ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Custom File Name - Optional */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Custom File Name <span className="text-gray-400">(Optional)</span>
              </label>
              <Input
                type="text"
                placeholder="Leave empty to use original filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !file}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload to Drive"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Response */}
      {response?.success && response.data && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Upload Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">File Name:</p>
              <p className="text-sm text-gray-800">{response.data.fileName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Drive ID:</p>
              <p className="text-sm font-mono text-gray-800 break-all">{response.data.driveId}</p>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-600">View Link:</p>
                <a
                  href={response.data.viewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Link2 className="h-4 w-4" />
                  Open in Google Drive
                </a>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Download Link:</p>
                <a
                  href={response.data.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Link2 className="h-4 w-4" />
                  Direct Download
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Uploaded At:</p>
              <p className="text-sm text-gray-800">{response.data.uploadedAt}</p>
            </div>

            <p className="text-sm text-green-700 font-medium">
              ✓ Link automatically saved to your Google Sheet!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
