import { NextRequest, NextResponse } from "next/server";
import { uploadAttendanceRecord } from "@/lib/attendance-drive-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get required fields
    const file = formData.get("file") as File;
    const employeeId = formData.get("employeeId") as string;
    const employeeName = formData.get("employeeName") as string;
    const spreadsheetId = formData.get("spreadsheetId") as string;
    const driveFolderId = formData.get("driveFolderId") as string;
    const status = (formData.get("status") as "check-in" | "check-out") || "check-in";

    // Get location (optional)
    const latitude = parseFloat(formData.get("latitude") as string) || 0;
    const longitude = parseFloat(formData.get("longitude") as string) || 0;

    // Validation
    if (!file) {
      return NextResponse.json({ error: "Photo is required" }, { status: 400 });
    }
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }
    if (!employeeName) {
      return NextResponse.json({ error: "Employee name is required" }, { status: 400 });
    }
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID is required" },
        { status: 400 }
      );
    }
    if (!driveFolderId) {
      return NextResponse.json(
        { error: "Drive folder ID is required" },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendanceRecord = {
      employeeId,
      employeeName,
      photo: file,
      timestamp: new Date(),
      location: {
        latitude,
        longitude,
      },
      status,
    };

    // Upload to drive and save to sheets
    const result = await uploadAttendanceRecord(
      attendanceRecord,
      spreadsheetId,
      driveFolderId
    );

    return NextResponse.json(
      {
        success: true,
        message: `${status === "check-in" ? "Check-in" : "Check-out"} recorded successfully`,
        data: {
          employeeId,
          employeeName,
          status,
          timestamp: attendanceRecord.timestamp.toLocaleString("id-ID"),
          location: {
            latitude,
            longitude,
          },
          driveFile: result.driveFile,
          sheetTitle: result.sheetTitle,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Attendance upload error:", error);
    return NextResponse.json(
      {
        error: "Attendance upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Attendance API is ready",
    endpoint: "/api/attendance",
    method: "POST",
    contentType: "multipart/form-data",
    requiredFields: {
      file: "Photo file from camera",
      employeeId: "Employee ID",
      employeeName: "Employee name",
      spreadsheetId: "Google Sheets ID",
      driveFolderId: "Google Drive folder ID",
      status: "check-in or check-out",
    },
    optionalFields: {
      latitude: "Location latitude",
      longitude: "Location longitude",
    },
    example: {
      method: "POST",
      endpoint: "/api/attendance",
      fields: {
        file: "camera_photo.jpg",
        employeeId: "EMP001",
        employeeName: "John Doe",
        spreadsheetId: "1a2b3c...",
        driveFolderId: "folder123...",
        status: "check-in",
        latitude: "-7.2506",
        longitude: "112.7508",
      },
    },
  });
}
