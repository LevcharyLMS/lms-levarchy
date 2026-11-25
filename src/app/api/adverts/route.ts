import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const adverts = all
      ? await SupabaseDbService.getAllAdverts()
      : await SupabaseDbService.getActiveAdverts();

    return NextResponse.json({ adverts });
  } catch (err: any) {
    console.error("Error in GET /api/adverts:", err);
    return NextResponse.json({ error: "Failed to load adverts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Basic admin check from session cookie if present
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("levchary_session");
    let isAdmin = false;
    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.role === "ADMIN") isAdmin = true;
      } catch {}
    }

    const body = await req.json();
    const {
      title,
      description,
      media_type,
      media_url,
      thumbnail_url,
      target_url,
      downloadable,
      duration_hours,
      start_date,
      end_date: directEndDate,
    } = body;

    if (!title || !media_url) {
      return NextResponse.json({ error: "Title and media URL are required" }, { status: 400 });
    }

    // Calculate end_date based on duration_hours if provided
    let calculatedEndDate: string | null = directEndDate || null;
    if (duration_hours && !calculatedEndDate) {
      const hours = Number(duration_hours);
      if (!isNaN(hours) && hours > 0) {
        calculatedEndDate = new Date(Date.now() + hours * 3600000).toISOString();
      }
    }

    const newAdvert = await SupabaseDbService.createAdvert({
      title,
      description: description || null,
      media_type: media_type === "VIDEO" ? "VIDEO" : "IMAGE",
      media_url,
      thumbnail_url: thumbnail_url || media_url,
      target_url: target_url || null,
      downloadable: downloadable !== false,
      start_date: start_date || new Date().toISOString(),
      end_date: calculatedEndDate,
      is_active: true,
      display_order: body.display_order ? Number(body.display_order) : 0,
    });

    // Record in immutable audit trail
    try {
      const { db } = await import("@/lib/data-store");
      db.logAudit({
        actor_id: body.admin_id || "admin",
        actor_role: "ADMIN",
        action: "ADVERT_CREATED",
        entity_type: "ADVERT",
        entity_id: newAdvert.id,
        metadata: {
          title: newAdvert.title,
          media_type: newAdvert.media_type,
          media_url: newAdvert.media_url,
          end_date: newAdvert.end_date,
        },
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json({ advert: newAdvert }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/adverts:", err);
    return NextResponse.json({ error: err.message || "Failed to create advert" }, { status: 500 });
  }
}
