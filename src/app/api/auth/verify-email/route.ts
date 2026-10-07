import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email address and verification token are required." },
        { status: 400 }
      );
    }

    const result = await SupabaseDbService.verifyEmailToken(email, token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to verify email." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (err: any) {
    console.error("Error in /api/auth/verify-email:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token query parameters are required." },
        { status: 400 }
      );
    }

    const result = await SupabaseDbService.verifyEmailToken(email, token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to verify email." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (err: any) {
    console.error("Error in GET /api/auth/verify-email:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
