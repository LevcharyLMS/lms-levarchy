import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { suggestionId, action, adminId = "usr-admin-1", adminNotes, overrides } = body;

    if (!suggestionId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Suggestion ID and valid action (APPROVE or REJECT) are required" },
        { status: 400 }
      );
    }

    const updated = await SupabaseDbService.reviewTaxonomySuggestion({
      suggestionId,
      action,
      adminId,
      adminNotes,
    });

    // Also update in-memory data store if present
    const inMem = (db.state as any).taxonomy_suggestions?.find((s: any) => s.id === suggestionId);
    if (inMem) {
      inMem.status = action === "APPROVE" ? "APPROVED" : "REJECTED";
      inMem.admin_notes = adminNotes || (action === "APPROVE" ? "Approved by Admin" : "Rejected by Admin");
      inMem.reviewed_by = adminId;
      inMem.updated_at = new Date().toISOString();
    }

    // Audit Logging
    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: action === "APPROVE" ? "TAXONOMY_SUGGESTION_APPROVED" : "TAXONOMY_SUGGESTION_REJECTED",
        entity_type: "TAXONOMY_SUGGESTION",
        entity_id: suggestionId,
        metadata: {
          action,
          adminNotes: adminNotes || undefined,
          suggestionId,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, suggestion: updated });
  } catch (err: any) {
    console.error("Error moderating taxonomy suggestion:", err);
    return NextResponse.json(
      { error: err.message || "Failed to moderate suggestion" },
      { status: 500 }
    );
  }
}
