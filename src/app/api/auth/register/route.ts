import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

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

    // Create user profile
    const user = await SupabaseDbService.createUser({
      email: email.toLowerCase().trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: role === "TUTOR" ? "TUTOR" : "STUDENT",
    });

    let studentProfile = null;
    if (user.role === "STUDENT") {
      studentProfile = await SupabaseDbService.getStudentProfile(user.id);
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`,
    };

    const response = NextResponse.json({
      success: true,
      user,
      studentProfile,
      message: "Account created successfully.",
    });

    // Set HTTP-only session cookie
    response.cookies.set("levchary_session", JSON.stringify(sessionPayload), {
      httpOnly: false, // accessible to client auth context
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
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
