/**
 * Example implementation untuk Attendance System
 * Menggunakan Google Drive Upload + Google Sheets Integration
 */

import { uploadToDrive, saveToSheets, ensureSheetExists } from "@/lib/google-api";

// Attendance record structure
interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  photo: File;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  status: "check-in" | "check-out";
}

// Upload attendance photo and save record
export async function uploadAttendanceRecord(
  record: AttendanceRecord,
  spreadsheetId: string,
  driveFolderId: string
) {
  try {
    // Generate filename with timestamp
    const timestamp = record.timestamp.toISOString().split("T")[0];
    const timeString = record.timestamp.toTimeString().split(" ")[0].replace(/:/g, "-");
    const fileName = `${record.employeeId}_${record.employeeName}_${record.status}_${timestamp}_${timeString}.jpg`;

    // Convert file to buffer
    const fileBuffer = Buffer.from(await record.photo.arrayBuffer());

    // Upload to Google Drive
    console.log(`Uploading attendance photo: ${fileName}`);
    const driveFile = await uploadToDrive(fileBuffer, fileName, driveFolderId);

    // Ensure sheet exists
    const sheetTitle = `Attendance_${record.timestamp.getFullYear()}-${String(record.timestamp.getMonth() + 1).padStart(2, "0")}`;
    await ensureSheetExists(spreadsheetId, sheetTitle);

    // Prepare data for sheets
    const values = [
      [
        record.timestamp.toLocaleString("id-ID"), // Tanggal & Jam
        record.employeeId, // Employee ID
        record.employeeName, // Nama Karyawan
        record.status, // Status (Check-in/Check-out)
        `${record.location.latitude}, ${record.location.longitude}`, // Lokasi
        driveFile.viewLink, // Link Drive
        driveFile.downloadLink, // Link Download
      ],
    ];

    // Save to sheets
    console.log(`Saving attendance record to Sheets: ${sheetTitle}`);
    await saveToSheets(spreadsheetId, `${sheetTitle}!A:G`, values);

    return {
      success: true,
      driveFile: driveFile.id,
      sheetTitle: sheetTitle,
      message: `Attendance recorded successfully for ${record.employeeName}`,
    };
  } catch (error) {
    console.error("Error uploading attendance record:", error);
    throw error;
  }
}

// Batch upload multiple attendance records
export async function uploadBatchAttendance(
  records: AttendanceRecord[],
  spreadsheetId: string,
  driveFolderId: string
) {
  const results = [];

  for (const record of records) {
    try {
      const result = await uploadAttendanceRecord(
        record,
        spreadsheetId,
        driveFolderId
      );
      results.push({
        employeeId: record.employeeId,
        status: "success",
        data: result,
      });
    } catch (error) {
      results.push({
        employeeId: record.employeeId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

// Get attendance summary for specific date
export async function getAttendanceSummary(
  spreadsheetId: string,
  date: Date
) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const sheetTitle = `Attendance_${year}-${month}`;

  return {
    sheetTitle,
    date: date.toLocaleDateString("id-ID"),
    message: `Query attendance data from sheet: ${sheetTitle}`,
  };
}

/**
 * Example Usage (untuk next.js API route)
 * 
 * POST /api/attendance
 * 
 * Request body:
 * {
 *   "employeeId": "EMP001",
 *   "employeeName": "John Doe",
 *   "file": <File>,
 *   "latitude": -7.2506,
 *   "longitude": 112.7508,
 *   "status": "check-in"
 * }
 */
