import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { data: instructors, error } = await supabaseAdmin
      .from("instructor_profiles")
      .select(`
        user_id,
        is_approved,
        instructor_type,
        hourly_rate,
        preferred_format,
        rating_avg,
        reviews_count,
        user:profiles (
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          city,
          state,
          account_status,
          verification_status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ instructors: instructors || [] });
  } catch (err: any) {
    console.error("GET /api/admin/instructors error:", err);
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, approve } = body;

    if (!userId || typeof approve !== "boolean") {
      return NextResponse.json({ error: "userId and approve boolean are required" }, { status: 400 });
    }

    // 1. Update instructor_profiles table
    const { error: ipErr } = await supabaseAdmin
      .from("instructor_profiles")
      .update({ is_approved: approve, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (ipErr) throw ipErr;

    // 2. Update profiles verification_status
    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .update({
        verification_status: approve ? "APPROVED" : "PENDING_REVIEW",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (pErr) throw pErr;

    return NextResponse.json({ success: true, is_approved: approve });
  } catch (err: any) {
    console.error("POST /api/admin/instructors error:", err);
    return NextResponse.json({ error: "Failed to update instructor status" }, { status: 500 });
  }
}
