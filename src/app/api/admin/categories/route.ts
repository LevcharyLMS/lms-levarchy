import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await SupabaseDbService.getCategories();
    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error("Error in GET /api/admin/categories:", err);
    return NextResponse.json({ error: err.message || "Failed to load categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, icon_name = "BookOpen", adminId = "usr-admin-1" } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    let newCat: any;
    try {
      const rows = await SupabaseDbService.query(
        `INSERT INTO categories (name, slug, description, icon_name, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, NOW(), NOW()) RETURNING *`,
        [name.trim(), slug, description || null, icon_name]
      );
      newCat = rows[0];
    } catch {
      newCat = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug,
        description: description || null,
        icon_name,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.state.categories.push(newCat);
    }

    // Audit log
    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "ACADEMIC_CATEGORY_CREATED",
        entity_type: "CATEGORY",
        entity_id: newCat.id,
        metadata: { name: newCat.name, slug: newCat.slug },
      });
    } catch {}

    return NextResponse.json({ category: newCat }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/categories:", err);
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates, adminId = "usr-admin-1" } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: "Category id and updates required" }, { status: 400 });
    }

    try {
      if (updates.name || updates.description !== undefined || updates.is_active !== undefined) {
        await SupabaseDbService.query(
          `UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active), updated_at = NOW() WHERE id = $4`,
          [updates.name || null, updates.description !== undefined ? updates.description : null, updates.is_active !== undefined ? updates.is_active : null, id]
        );
      }
    } catch {}

    const mem = db.state.categories.find((c) => c.id === id);
    if (mem) {
      Object.assign(mem, updates);
    }

    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "ACADEMIC_CATEGORY_UPDATED",
        entity_type: "CATEGORY",
        entity_id: id,
        metadata: { updates },
      });
    } catch {}

    return NextResponse.json({ success: true, category: mem || updates });
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/categories:", err);
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const adminId = searchParams.get("adminId") || "usr-admin-1";

    if (!id) {
      return NextResponse.json({ error: "Category id required" }, { status: 400 });
    }

    // Safety check: ensure no subjects are attached
    const childSubjects = (db.state.subjects || []).filter((s) => s.category_id === id);
    if (childSubjects.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete discipline: ${childSubjects.length} subjects are currently attached to this category.` },
        { status: 400 }
      );
    }

    try {
      await SupabaseDbService.query(`DELETE FROM categories WHERE id = $1`, [id]);
    } catch {}

    const idx = db.state.categories.findIndex((c) => c.id === id);
    if (idx !== -1) db.state.categories.splice(idx, 1);

    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "ACADEMIC_CATEGORY_DELETED",
        entity_type: "CATEGORY",
        entity_id: id,
        metadata: { id },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/categories:", err);
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}
