import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    const updated = await SupabaseDbService.updateAdvert(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Advert not found" }, { status: 404 });
    }

    // Record in immutable audit trail
    try {
      const { db } = await import("@/lib/data-store");
      db.logAudit({
        actor_id: body.admin_id || "admin",
        actor_role: "ADMIN",
        action: body.is_active !== undefined
          ? (body.is_active ? "ADVERT_ACTIVATED" : "ADVERT_DEACTIVATED")
          : "ADVERT_UPDATED",
        entity_type: "ADVERT",
        entity_id: id,
        metadata: {
          title: updated.title,
          is_active: updated.is_active,
          ...body,
        },
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json({ advert: updated });
  } catch (err: any) {
    console.error("Error in PATCH /api/adverts/[id]:", err);
    return NextResponse.json({ error: err.message || "Failed to update advert" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const success = await SupabaseDbService.deleteAdvert(id);

    // Record in immutable audit trail
    try {
      const { db } = await import("@/lib/data-store");
      db.logAudit({
        actor_id: "admin",
        actor_role: "ADMIN",
        action: "ADVERT_DELETED",
        entity_type: "ADVERT",
        entity_id: id,
        metadata: { id },
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Error in DELETE /api/adverts/[id]:", err);
    return NextResponse.json({ error: "Failed to delete advert" }, { status: 500 });
  }
}
