import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { suggestionId, action, adminId, adminNotes } = body;

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

    return NextResponse.json({ success: true, suggestion: updated });
  } catch (err: any) {
    console.error("Error moderating taxonomy suggestion:", err);
    return NextResponse.json(
      { error: err.message || "Failed to moderate suggestion" },
      { status: 500 }
    );
  }
}
