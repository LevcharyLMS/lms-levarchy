import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool, SupabaseDbService } from "@/lib/supabase-db";

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

    // 1. Update general profile fields (phone, city, state, address)
    const profileUpdates: any = {};
    if (phone) profileUpdates.phone = phone;
    if (city) profileUpdates.city = city;
    if (state) profileUpdates.state = state;
    if (body.address) profileUpdates.address = body.address;
    if (body.country) profileUpdates.country = body.country;

    const updatedUser = await SupabaseDbService.updateUserProfile(userId, profileUpdates);

    // 2. Build learning goals summary
    const goalsCombined = [primaryGoal, notes ? `Specific focus: ${notes}` : null]
      .filter(Boolean)
      .join(" • ");

    // 3. Save Student ID verification document if uploaded
    if (body.studentIdDocument?.fileName) {
      try {
        const docId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "doc-stu-" + Date.now();
        await pool.query(
          `INSERT INTO verification_documents (
             id, user_id, document_type, file_path, file_name, mime_type, file_size, status, uploaded_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING_REVIEW', NOW())`,
          [
            docId,
            userId,
            "STUDENT_ID",
            `private/verifications/${userId}/${body.studentIdDocument.fileName}`,
            body.studentIdDocument.fileName,
            body.studentIdDocument.mimeType || "application/pdf",
            body.studentIdDocument.fileSize || 1024 * 500,
          ]
        );
      } catch (docErr) {
        console.warn("Notice: could not record student verification document:", docErr);
      }
    }

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
