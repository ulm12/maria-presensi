import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  Camera,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface AttendanceResponse {
  success: boolean;
  message: string;
  data?: {
    employeeId: string;
    employeeName: string;
    status: "check-in" | "check-out";
    timestamp: string;
    driveFile: string;
  };
}

export function CameraAttendanceComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [driveFolderId, setDriveFolderId] = useState("");
  const [status, setStatus] = useState<"check-in" | "check-out">("check-in");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AttendanceResponse | null>(null);
  const [error, setError] = useState("");

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Could not get location. Continuing without location...");
        }
      );
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }

      getCurrentLocation();
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            setPhoto(blob);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setPhoto(null);
    setPreviewUrl("");
    startCamera();
  };

  // Submit attendance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResponse(null);

    // Validation
    if (!employeeId.trim()) {
      setError("Please enter Employee ID");
      return;
    }
    if (!employeeName.trim()) {
      setError("Please enter Employee Name");
      return;
    }
    if (!spreadsheetId.trim()) {
      setError("Please enter Spreadsheet ID");
      return;
    }
    if (!driveFolderId.trim()) {
      setError("Please enter Drive Folder ID");
      return;
    }
    if (!photo) {
      setError("Please capture a photo");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", photo, "attendance.jpg");
      formData.append("employeeId", employeeId);
      formData.append("employeeName", employeeName);
      formData.append("spreadsheetId", spreadsheetId);
      formData.append("driveFolderId", driveFolderId);
      formData.append("status", status);

      if (latitude) formData.append("latitude", latitude);
      if (longitude) formData.append("longitude", longitude);

      const res = await fetch("/api/attendance", {
        method: "POST",
        body: formData,
      });

      const data: AttendanceResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Submission failed");
      } else {
        setResponse(data);
        // Reset form
        setEmployeeId("");
        setEmployeeName("");
        setPhoto(null);
        setPreviewUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance with Camera</CardTitle>
          <CardDescription>
            Capture photo and automatically upload to Google Drive with Sheets record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., EMP001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., John Doe"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Google Setup */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-semibold">Google Setup</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Spreadsheet ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Your Google Sheets ID"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    From: docs.google.com/spreadsheets/d/<strong>THIS_ID</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Drive Folder ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Your Google Drive folder ID"
                    value={driveFolderId}
                    onChange={(e) => setDriveFolderId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    From: drive.google.com/drive/folders/<strong>THIS_ID</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check-in">Check-In</SelectItem>
                  <SelectItem value="check-out">Check-Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Camera Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Camera</h3>

              {!cameraActive && !photo && (
                <Button
                  type="button"
                  onClick={startCamera}
                  className="w-full"
                  variant="outline"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              )}

              {cameraActive && (
                <>
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full"
                      variant="default"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture
                    </Button>
                    <Button
                      type="button"
                      onClick={stopCamera}
                      className="w-full"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {photo && previewUrl && (
                <>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                    <img
                      src={previewUrl}
                      alt="Captured photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    {latitude && longitude && (
                      <p className="text-sm text-gray-600">
                        📍 Location: {latitude}, {longitude}
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={retakePhoto}
                      className="w-full"
                      variant="outline"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retake Photo
                    </Button>
                  </div>
                </>
              )}
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
              disabled={loading || !photo}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Submit Attendance"
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
              {status === "check-in" ? "Check-In" : "Check-Out"} Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Employee:</strong> {response.data.employeeName} ({response.data.employeeId})
            </p>
            <p className="text-sm">
              <strong>Time:</strong> {response.data.timestamp}
            </p>
            <p className="text-sm text-green-700">
              ✓ Photo uploaded to Google Drive and record saved to Sheets
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
