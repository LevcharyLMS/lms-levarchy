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
    const { flagId, status, adminNotes, actorId = "usr-admin-1", senderId } = body;

    if (!flagId || !status) {
      return NextResponse.json({ error: "Missing flagId or status" }, { status: 400 });
    }

    const success = await SupabaseDbService.updateMessageFlag(flagId, status, actorId, adminNotes);

    // Also update in-memory store for sync and audit log
    const memFlag = db.state.message_flags.find((f) => f.id === flagId);
    let resolvedSenderId = senderId;
    if (memFlag) {
      memFlag.status = status;
      memFlag.reviewed_by = actorId;
      memFlag.reviewed_at = new Date().toISOString();
      memFlag.admin_notes = adminNotes;
      if (!resolvedSenderId && (memFlag as any).sender_id) {
        resolvedSenderId = (memFlag as any).sender_id;
      }
    }

    // Account Enforcement on RESTRICTED (sets account_status to SUSPENDED)
    if (status === "RESTRICTED" && resolvedSenderId) {
      try {
        await SupabaseDbService.query(
          `UPDATE profiles SET account_status = 'SUSPENDED', updated_at = NOW() WHERE id = $1`,
          [resolvedSenderId]
        );
        const profile = db.state.profiles.find((p) => p.id === resolvedSenderId);
        if (profile) profile.account_status = "SUSPENDED";
      } catch (restrictErr) {
        console.warn("Account restriction notice:", restrictErr);
      }
    }

    db.logAudit({
      actor_id: actorId,
      actor_role: "ADMIN",
      action: `MESSAGE_FLAG_${status}`,
      entity_type: "MESSAGE_FLAG",
      entity_id: flagId,
      metadata: { status, adminNotes, sender_id: resolvedSenderId },
    });

    return NextResponse.json({ success, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
