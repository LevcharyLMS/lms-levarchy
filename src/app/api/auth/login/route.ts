import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await SupabaseDbService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.account_status === "SUSPENDED") {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact platform administration." },
        { status: 403 }
      );
    }

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
      message: "Signed in successfully.",
    });

    response.cookies.set("levchary_session", JSON.stringify(sessionPayload), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Error in /api/auth/login:", err);
    return NextResponse.json(
      { error: err?.message || "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
