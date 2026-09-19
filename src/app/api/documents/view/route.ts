import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const token = searchParams.get("token");
  const expires = searchParams.get("expires");

  if (!path || !token || !expires) {
    return NextResponse.json({ error: "Missing signed authorization parameters." }, { status: 400 });
  }

  // Prevent path traversal
  if (path.includes("..") || path.startsWith("/") || path.includes("\\")) {
    return NextResponse.json({ error: "Path traversal violation." }, { status: 403 });
  }

  // Check token expiry
  const expiresTimestamp = parseInt(expires, 10);
  if (Date.now() > expiresTimestamp) {
    return NextResponse.json({ error: "Signed document token has expired (15 minute limit)." }, { status: 401 });
  }

  // Return signed document view content (PDF simulation header)
  return new NextResponse(
    `%PDF-1.4\n% Levchary LMS Secure Verification Document Stream\n% Path: ${path}\n% Signed At Token: ${token}\n% Expiration: ${new Date(expiresTimestamp).toISOString()}`,
    {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${path.split("/").pop()}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    }
  );
}
