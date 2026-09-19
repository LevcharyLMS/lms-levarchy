import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId: bodyUserId,
      gradeLevel,
      subjects = [],
      primaryGoal,
      preferredFormat = "VIRTUAL",
      weeklyCommitment,
      city,
      state,
      phone,
      notes,
    } = body;

    // Resolve userId from body or session cookie
    let userId = bodyUserId;
    if (!userId) {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get("levchary_session");
      if (sessionCookie?.value) {
        try {
          userId = JSON.parse(sessionCookie.value).userId;
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to complete onboarding." },
        { status: 401 }
      );
    }

    // 1. Update general profile fields (phone, city, state)
    const profileUpdates: any = {};
    if (phone) profileUpdates.phone = phone;
    if (city) profileUpdates.city = city;
    if (state) profileUpdates.state = state;

    const updatedUser = await SupabaseDbService.updateUserProfile(userId, profileUpdates);

    // 2. Build learning goals summary
    const goalsCombined = [primaryGoal, notes ? `Specific focus: ${notes}` : null]
      .filter(Boolean)
      .join(" • ");

    // 3. Update student_profiles with answers and onboarding_completed = true
    const updatedStudentProfile = await SupabaseDbService.createOrUpdateStudentProfile(userId, {
      grade_level: gradeLevel,
      learning_goals: goalsCombined,
      preferences: {
        subjects,
        primary_goal: primaryGoal,
        preferred_format: preferredFormat,
        weekly_commitment: weeklyCommitment,
        notes,
        onboarding_completed: true,
        completed_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      studentProfile: updatedStudentProfile,
      message: "Student onboarding completed successfully.",
    });
  } catch (err: any) {
    console.error("Error in /api/student/onboarding:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save student onboarding data." },
      { status: 500 }
    );
  }
}
