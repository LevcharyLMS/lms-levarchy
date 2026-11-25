import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        avatar_url,
        phone,
        city,
        state,
        country,
        account_status,
        verification_status,
        email_verified,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error || !profiles || profiles.length === 0) {
      // Fallback to data store profiles combined with demo users if DB is empty
      const localProfiles = db.getProfiles();
      return NextResponse.json({ users: localProfiles });
    }

    return NextResponse.json({ users: profiles });
  } catch (err: any) {
    console.error("GET /api/admin/users error:", err);
    // Graceful fallback to data store
    return NextResponse.json({ users: db.getProfiles() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, accountStatus, verificationStatus } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (accountStatus) updates.account_status = accountStatus;
    if (verificationStatus) updates.verification_status = verificationStatus;

    // Update in Supabase
    try {
      await supabaseAdmin.from("profiles").update(updates).eq("id", userId);
    } catch {}

    // Update in local data store as well
    db.updateProfile(userId, updates);

    return NextResponse.json({ success: true, userId, updates });
  } catch (err: any) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}
