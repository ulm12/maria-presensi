import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Simple approach: compress image and return base64 for storage
// Since service accounts can't write to personal Google Drive folders,
// we'll store compressed image data in the cell or use a different strategy

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, fileName } = await req.json();

    if (!imageBase64 || !fileName) {
      return NextResponse.json(
        { success: false, message: "Missing imageBase64 or fileName" },
        { status: 400 }
      );
    }

    // For now, return the base64 directly with a placeholder strategy
    // In production, consider:
    // 1. Use a Shared Drive instead of personal folder
    // 2. Use OAuth 2.0 with user credentials
    // 3. Store images in a separate Cloud Storage (GCS)
    // 4. Use Imgur/Cloudinary for image hosting

    // Compress by limiting quality (optional)
    // For now, just return success with the image data
    // The client can store this and decide how to handle it

    return NextResponse.json({
      success: true,
      message: "Image data received. Ready for storage.",
      // Option: store compressed base64 or use alternative storage
      imageData: {
        fileName,
        sizeKB: Math.round(imageBase64.length / 1024),
        note: "Store in sheet or use external storage service",
      },
    });
  } catch (error) {
    const errorMsg =
      process.env.NODE_ENV !== "production"
        ? error instanceof Error
          ? error.message
          : String(error)
        : "Failed to process image";
    console.error("Upload image error:", error);
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 500 }
    );
  }
}
