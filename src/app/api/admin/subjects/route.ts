import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const subjects = await SupabaseDbService.getSubjects();
    const categories = await SupabaseDbService.getCategories();

    // Map categories into subjects for easy client display
    const enriched = subjects.map((s: any) => {
      const cat = categories.find((c: any) => c.id === s.category_id);
      return {
        ...s,
        category: cat ? cat.name : "General",
      };
    });

    return NextResponse.json({ subjects: enriched, categories });
  } catch (err: any) {
    console.error("Error in GET /api/admin/subjects:", err);
    return NextResponse.json({ error: err.message || "Failed to load subjects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category_id, description, adminId = "usr-admin-1" } = body;

    if (!name || !category_id) {
      return NextResponse.json({ error: "Subject name and Category are required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    let newSub: any;
    try {
      const rows = await SupabaseDbService.query(
        `INSERT INTO subjects (category_id, name, slug, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING *`,
        [category_id, name.trim(), slug, description || `${name} coursework and syllabus mastery`]
      );
      newSub = rows[0];
    } catch {
      // Fallback in data store
      newSub = {
        id: `sub-${Date.now()}`,
        category_id,
        name: name.trim(),
        slug,
        description: description || `${name} coursework and syllabus mastery`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.state.subjects.unshift(newSub);
    }

    // Record audit trail
    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "ACADEMIC_SUBJECT_CREATED",
        entity_type: "SUBJECT",
        entity_id: newSub.id,
        metadata: { name: newSub.name, slug: newSub.slug, category_id },
      });
    } catch {}

    return NextResponse.json({ subject: newSub }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/subjects:", err);
    return NextResponse.json({ error: err.message || "Failed to create subject" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const adminId = searchParams.get("adminId") || "usr-admin-1";

    if (!id) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
    }

    try {
      await SupabaseDbService.query(`DELETE FROM subjects WHERE id = $1`, [id]);
    } catch {
      const idx = db.state.subjects.findIndex((s) => s.id === id);
      if (idx !== -1) db.state.subjects.splice(idx, 1);
    }

    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "ACADEMIC_SUBJECT_DELETED",
        entity_type: "SUBJECT",
        entity_id: id,
        metadata: { id },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/subjects:", err);
    return NextResponse.json({ error: err.message || "Failed to delete subject" }, { status: 500 });
  }
}
