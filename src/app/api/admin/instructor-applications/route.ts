import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  try {
    // 1. Query Supabase instructor_applications joined with profiles
    const { data: applications, error } = await supabaseAdmin
      .from("instructor_applications")
      .select(`
        id,
        user_id,
        status,
        submitted_at,
        reviewed_at,
        admin_notes,
        rejection_reason,
        bio,
        teaching_statement,
        requested_hourly_rate,
        degrees,
        subjects,
        experience_years,
        instructor:profiles!instructor_id (
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          phone,
          city,
          state
        )
      `)
      .order("submitted_at", { ascending: false });

    if (!error && applications) {
      return NextResponse.json({ applications });
    }

    // 2. Try legacy fallback if instructor_id was user_id
    const { data: legacyApps } = await supabaseAdmin
      .from("instructor_applications")
      .select(`
        id,
        user_id,
        status,
        submitted_at,
        reviewed_at,
        admin_notes,
        rejection_reason,
        bio,
        teaching_statement,
        requested_hourly_rate,
        degrees,
        subjects,
        experience_years,
        instructor:profiles (
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          phone,
          city,
          state
        )
      `)
      .order("submitted_at", { ascending: false });

    if (legacyApps) {
      return NextResponse.json({ applications: legacyApps });
    }
  } catch (err: any) {
    console.error("GET /api/admin/instructor-applications error:", err);
  }

  // Pure live handling: When no applications exist in DB, return empty array with clean 200
  return NextResponse.json({ applications: [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, userId, action, adminNotes, rejectionReason } = body;

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Valid action (APPROVE or REJECT) is required" }, { status: 400 });
    }

    const nextStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    // 1. Update Supabase table
    try {
      await supabaseAdmin
        .from("instructor_applications")
        .update({
          status: nextStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
          rejection_reason: action === "REJECT" ? (rejectionReason || adminNotes || "Qualifications review incomplete") : null,
        })
        .or(`id.eq.${applicationId},instructor_id.eq.${userId}`);

      if (userId && action === "APPROVE") {
        await supabaseAdmin
          .from("profiles")
          .update({ verification_status: "APPROVED", account_status: "ACTIVE" })
          .eq("id", userId);

        await supabaseAdmin
          .from("instructor_profiles")
          .update({ is_approved: true, application_status: "APPROVED" })
          .eq("user_id", userId);
      }
    } catch {}

    // 2. Synchronize memory store
    if (userId) {
      db.updateProfile(userId, {
        verification_status: nextStatus,
        account_status: action === "APPROVE" ? "ACTIVE" : undefined,
      });
      const instProfile = db.state.instructor_profiles.find((p) => p.user_id === userId);
      if (instProfile && action === "APPROVE") {
        instProfile.is_approved = true;
      }
    }

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (err: any) {
    console.error("POST /api/admin/instructor-applications error:", err);
    return NextResponse.json({ error: err.message || "Failed to process application" }, { status: 500 });
  }
}
