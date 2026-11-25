import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mediaType = (formData.get("mediaType") as string) || "IMAGE";

    if (!file) {
      return NextResponse.json({ error: "No media file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. If Cloudinary credentials are provided, upload directly to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "levchary/adverts",
            resource_type: mediaType === "VIDEO" ? "video" : "image",
            public_id: `ad_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      return NextResponse.json({
        fileUrl: uploadResult.secure_url,
        fileName: file.name,
        fileSize: file.size,
        publicId: uploadResult.public_id,
        storage: "CLOUDINARY",
      });
    }

    // 2. Reliable fallback storage in public/uploads/adverts for local & testing environments
    const uploadDir = path.join(process.cwd(), "public", "uploads", "adverts");
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = `ad_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/adverts/${safeName}`;

    return NextResponse.json({
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      storage: "LOCAL_UPLOADS",
    });
  } catch (err: any) {
    console.error("Advert upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload file" }, { status: 500 });
  }
}
