import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("levchary_session");

    let userId: string | null = null;
    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        userId = parsed.userId || null;
      } catch {}
    }

    const body = await req.json();
    const targetUserId = body.userId || userId;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Authentication required to submit semester check-in" },
        { status: 401 }
      );
    }

    const { gradeLevel, learningGoals, subjects, parentGuardianPhone } = body;

    if (!gradeLevel) {
      return NextResponse.json(
        { error: "Academic grade level is required" },
        { status: 400 }
      );
    }

    const result = await SupabaseDbService.updateStudentSemesterCheckin({
      userId: targetUserId,
      gradeLevel,
      learningGoals,
      subjects,
      parentGuardianPhone,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update profile check-in" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Semester profile check-in confirmed successfully.",
      studentProfile: result.studentProfile,
    });
  } catch (error: any) {
    console.error("Error in /api/student/profile-checkin:", error);
    return NextResponse.json(
      { error: "Internal server error during profile verification" },
      { status: 500 }
    );
  }
}
