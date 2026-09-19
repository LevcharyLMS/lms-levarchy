import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("levchary_session");

    let userId: string | null = null;
    let email: string | null = null;

    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        userId = parsed.userId;
        email = parsed.email;
      } catch {}
    }

    // Also support authorization header for API requests
    const authHeader = req.headers.get("authorization");
    if (!userId && authHeader?.startsWith("Bearer ")) {
      userId = authHeader.replace("Bearer ", "").trim();
    }

    if (!userId && !email) {
      return NextResponse.json({ user: null, studentProfile: null });
    }

    let user = userId ? await SupabaseDbService.getUserById(userId) : null;
    if (!user && email) {
      user = await SupabaseDbService.getUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json({ user: null, studentProfile: null });
    }

    let studentProfile = null;
    if (user.role === "STUDENT") {
      studentProfile = await SupabaseDbService.getStudentProfile(user.id);
    }

    return NextResponse.json({
      user,
      studentProfile,
    });
  } catch (err: any) {
    console.error("Error in /api/auth/me:", err);
    return NextResponse.json({ user: null, studentProfile: null });
  }
}
