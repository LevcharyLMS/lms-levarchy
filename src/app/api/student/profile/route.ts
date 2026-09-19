import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SupabaseDbService } from "@/lib/supabase-db";

function getUserIdFromSession(req: Request): string | null {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("levchary_session");
  if (sessionCookie?.value) {
    try {
      return JSON.parse(sessionCookie.value).userId;
    } catch {}
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const userId = queryUserId || getUserIdFromSession(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await SupabaseDbService.getUserById(userId);
    const studentProfile = await SupabaseDbService.getStudentProfile(userId);

    return NextResponse.json({ user, studentProfile });
  } catch (err: any) {
    console.error("Error in GET /api/student/profile:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = getUserIdFromSession(req);
    const body = await req.json();
    const targetUserId = body.userId || userId;

    if (!targetUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      firstName,
      lastName,
      phone,
      city,
      state,
      gradeLevel,
      learningGoals,
    } = body;

    // Update user profile
    const userUpdates: any = {};
    if (firstName) userUpdates.first_name = firstName.trim();
    if (lastName) userUpdates.last_name = lastName.trim();
    if (phone !== undefined) userUpdates.phone = phone;
    if (city !== undefined) userUpdates.city = city;
    if (state !== undefined) userUpdates.state = state;

    const updatedUser = await SupabaseDbService.updateUserProfile(targetUserId, userUpdates);

    // Update student profile
    const studentUpdates: any = {};
    if (gradeLevel !== undefined) studentUpdates.grade_level = gradeLevel;
    if (learningGoals !== undefined) studentUpdates.learning_goals = learningGoals;

    const updatedStudentProfile = await SupabaseDbService.createOrUpdateStudentProfile(
      targetUserId,
      studentUpdates
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
      studentProfile: updatedStudentProfile,
      message: "Student profile updated successfully.",
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/student/profile:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
