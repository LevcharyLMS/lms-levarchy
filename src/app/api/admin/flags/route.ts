import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export async function GET() {
  try {
    const flags = await SupabaseDbService.getMessageFlags();
    return NextResponse.json({ flags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { flagId, status, adminNotes, actorId = "usr-admin-1" } = body;

    if (!flagId || !status) {
      return NextResponse.json({ error: "Missing flagId or status" }, { status: 400 });
    }

    const success = await SupabaseDbService.updateMessageFlag(flagId, status, actorId, adminNotes);

    // Also update in-memory store for sync and audit log
    const memFlag = db.state.message_flags.find((f) => f.id === flagId);
    if (memFlag) {
      memFlag.status = status;
      memFlag.reviewed_by = actorId;
      memFlag.reviewed_at = new Date().toISOString();
      memFlag.admin_notes = adminNotes;
    }

    db.logAudit({
      actor_id: actorId,
      actor_role: "ADMIN",
      action: `MESSAGE_FLAG_${status}`,
      entity_type: "MESSAGE_FLAG",
      entity_id: flagId,
      metadata: { status, adminNotes },
    });

    return NextResponse.json({ success, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
