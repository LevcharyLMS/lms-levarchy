import { NextResponse } from "next/server";
import crypto from "crypto";
import { SupabaseDbService } from "@/lib/supabase-db";
import { BrevoService } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await SupabaseDbService.getUserByEmail(trimmedEmail);

    if (!user) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification link has been sent.",
      });
    }

    if (user.email_verified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "This email address is already verified. You can sign in immediately.",
      });
    }

    // Generate new token and 24h expiration
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await SupabaseDbService.setVerificationToken(trimmedEmail, token, expiresAt);

    // Send verification email via Brevo
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(trimmedEmail)}`;

    await BrevoService.sendVerificationEmail({
      to: trimmedEmail,
      firstName: user.first_name || "Student",
      verificationUrl,
    });

    return NextResponse.json({
      success: true,
      message: "A new verification email has been dispatched. Please check your inbox.",
    });
  } catch (err: any) {
    console.error("Error in /api/auth/resend-verification:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to resend verification email." },
      { status: 500 }
    );
  }
}
