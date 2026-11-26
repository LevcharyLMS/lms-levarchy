import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const flags = await SupabaseDbService.getMessageFlags(status);
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

    // If resolvedSenderId not passed or found in memFlag, look up from DB
    if (!resolvedSenderId) {
      try {
        const rows = await SupabaseDbService.query(
          `SELECT m.sender_id FROM message_flags f JOIN messages m ON f.message_id = m.id WHERE f.id = $1 LIMIT 1`,
          [flagId]
        );
        if (rows.length > 0 && rows[0].sender_id) {
          resolvedSenderId = rows[0].sender_id;
        }
      } catch (dbLookupErr) {
        console.warn("Could not lookup sender_id for flag:", dbLookupErr);
      }
    }

    // Account Enforcement on RESTRICTED (sets account_status to SUSPENDED)
    if (status === "RESTRICTED" && resolvedSenderId) {
      try {
        await SupabaseDbService.updateUserProfile(resolvedSenderId, { account_status: "SUSPENDED" });
      } catch (restrictErr) {
        console.warn("Account restriction notice:", restrictErr);
      }
      db.updateProfile(resolvedSenderId, { account_status: "SUSPENDED" as any });
    }

    // In-app Notification to Sender (Student or Instructor) on Warning or Restriction
    if (resolvedSenderId && (status === "WARNED" || status === "RESTRICTED")) {
      const isRestricted = status === "RESTRICTED";
      const title = isRestricted ? "Account Temporarily Restricted" : "Community Safety Warning";
      const message = isRestricted
        ? "Your account has been restricted following a safety review regarding off-platform payment/contact details. Please contact Levchary Support."
        : "A recent message was flagged for safety policy violation (e.g., off-platform contact/payment attempt). Please adhere to Levchary marketplace policies.";

      try {
        await SupabaseDbService.createNotification({
          userId: resolvedSenderId,
          title,
          message,
          type: "SYSTEM",
          link: isRestricted ? "/contact-support" : "/student/messages",
        });
      } catch (notifErr) {
        console.warn("Failed to dispatch safety decision notification to user:", notifErr);
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
