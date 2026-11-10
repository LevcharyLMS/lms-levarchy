import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "assignments";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. If Cloudinary credentials are provided, upload directly to Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `levchary/${folder}`,
            resource_type: "auto",
            public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
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
      });
    }

    // 2. Reliable local storage in public/uploads for direct HTTP serving & browser preview
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${folder}/${safeName}`;

    return NextResponse.json({
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error("Assignment upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
