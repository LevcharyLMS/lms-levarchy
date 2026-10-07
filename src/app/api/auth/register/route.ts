import { NextResponse } from "next/server";
import crypto from "crypto";
import { SupabaseDbService } from "@/lib/supabase-db";
import { BrevoService } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, role = "STUDENT" } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "First name, last name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters in length." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await SupabaseDbService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    // Generate secure email verification token (24-hour expiration)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Create user profile (unverified pending email verification)
    const user = await SupabaseDbService.createUser({
      email: email.toLowerCase().trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: role === "TUTOR" ? "TUTOR" : "STUDENT",
      email_verified: false,
      verification_token: token,
      verification_token_expires_at: expiresAt,
    });

    let studentProfile = null;
    if (user.role === "STUDENT") {
      studentProfile = await SupabaseDbService.getStudentProfile(user.id);
    }

    // Send verification email via Brevo
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

    await BrevoService.sendVerificationEmail({
      to: user.email,
      firstName: user.first_name,
      verificationUrl,
    });

    const response = NextResponse.json({
      success: true,
      requiresVerification: true,
      user,
      studentProfile,
      message: "Account created! We've sent a verification link to your email address.",
    });

    return response;
  } catch (err: any) {
    console.error("Error in /api/auth/register:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
