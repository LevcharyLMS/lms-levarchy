import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const classes = await SupabaseDbService.getClasses({ format, categoryId });
    return NextResponse.json({ classes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { classId, status, actorId = "usr-admin-1" } = body;

    if (!classId || !status) {
      return NextResponse.json({ error: "Missing classId or status" }, { status: 400 });
    }

    await SupabaseDbService.updateClassStatus(classId, status);

    const memClass = db.state.classes.find((c) => c.id === classId);
    if (memClass) {
      memClass.status = status;
    }

    db.logAudit({
      actor_id: actorId,
      actor_role: "ADMIN",
      action: `CLASS_STATUS_${status}`,
      entity_type: "CLASS",
      entity_id: classId,
      metadata: { status },
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
