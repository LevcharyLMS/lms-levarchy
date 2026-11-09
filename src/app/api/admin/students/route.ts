import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { data: students, error } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        city,
        state,
        country,
        avatar_url,
        account_status,
        verification_status,
        created_at,
        student_profiles (
          grade_level,
          learning_goals,
          preferences
        )
      `)
      .eq("role", "STUDENT")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ students: students || [] });
  } catch (err: any) {
    console.error("GET /api/admin/students error:", err);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, verificationStatus, accountStatus } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (verificationStatus) updates.verification_status = verificationStatus;
    if (accountStatus) updates.account_status = accountStatus;

    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (pErr) throw pErr;

    // Also update any pending verification documents if approving/rejecting
    if (verificationStatus) {
      await supabaseAdmin
        .from("verification_documents")
        .update({ status: verificationStatus === "APPROVED" ? "APPROVED" : "REJECTED" })
        .eq("user_id", userId)
        .eq("status", "PENDING_REVIEW");
    }

    return NextResponse.json({ success: true, updates });
  } catch (err: any) {
    console.error("POST /api/admin/students error:", err);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}
