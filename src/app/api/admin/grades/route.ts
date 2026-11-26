import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const grades = await SupabaseDbService.getGrades();
    return NextResponse.json({ grades });
  } catch (err: any) {
    console.error("Error in GET /api/admin/grades:", err);
    return NextResponse.json({ error: err.message || "Failed to load grades" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, level, description, instructor_type = "BOTH", adminId = "usr-admin-1" } = body;

    if (!name || level === undefined) {
      return NextResponse.json({ error: "Grade name and level are required" }, { status: 400 });
    }

    let newGrade: any;
    try {
      const rows = await SupabaseDbService.query(
        `INSERT INTO grades (name, level, description, created_at)
         VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [name.trim(), Number(level), description || null]
      );
      newGrade = rows[0];
    } catch {
      newGrade = {
        id: `grd-${Date.now()}`,
        name: name.trim(),
        level: Number(level),
        description: description || "",
        instructor_type,
      };
      db.state.grades.push(newGrade);
    }

    // Audit log
    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "GRADE_TIER_CREATED",
        entity_type: "GRADE",
        entity_id: newGrade.id,
        metadata: { name: newGrade.name, level: newGrade.level, instructor_type },
      });
    } catch {}

    return NextResponse.json({ grade: newGrade }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/grades:", err);
    return NextResponse.json({ error: err.message || "Failed to create grade" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates, adminId = "usr-admin-1" } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: "Grade id and updates required" }, { status: 400 });
    }

    try {
      if (updates.name || updates.level !== undefined || updates.description !== undefined) {
        await SupabaseDbService.query(
          `UPDATE grades SET name = COALESCE($1, name), level = COALESCE($2, level), description = COALESCE($3, description) WHERE id = $4`,
          [updates.name || null, updates.level !== undefined ? Number(updates.level) : null, updates.description || null, id]
        );
      }
    } catch {}

    const mem = db.state.grades.find((g) => g.id === id);
    if (mem) {
      Object.assign(mem, updates);
    }

    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "GRADE_TIER_UPDATED",
        entity_type: "GRADE",
        entity_id: id,
        metadata: { updates },
      });
    } catch {}

    return NextResponse.json({ success: true, grade: mem || updates });
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/grades:", err);
    return NextResponse.json({ error: err.message || "Failed to update grade" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const adminId = searchParams.get("adminId") || "usr-admin-1";

    if (!id) {
      return NextResponse.json({ error: "Grade id required" }, { status: 400 });
    }

    try {
      await SupabaseDbService.query(`DELETE FROM grades WHERE id = $1`, [id]);
    } catch {}

    const idx = db.state.grades.findIndex((g) => g.id === id);
    if (idx !== -1) db.state.grades.splice(idx, 1);

    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "GRADE_TIER_DELETED",
        entity_type: "GRADE",
        entity_id: id,
        metadata: { id },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/grades:", err);
    return NextResponse.json({ error: err.message || "Failed to delete grade" }, { status: 500 });
  }
}
