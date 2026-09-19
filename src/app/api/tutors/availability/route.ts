import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { cookies } from "next/headers";
import { db as memoryDb } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tutorId = searchParams.get("tutorId");

  if (!tutorId) {
    return NextResponse.json({ error: "tutorId required" }, { status: 400 });
  }

  try {
    const rows = await SupabaseDbService["query"](
      `SELECT * FROM tutor_availability WHERE tutor_id = $1 AND is_active = true ORDER BY day_of_week, start_time`,
      [tutorId]
    ).catch(() => null);

    const availability = rows && rows.length > 0
      ? rows
      : memoryDb.state.tutor_availability.filter((a) => a.tutor_id === tutorId);

    return NextResponse.json({ availability });
  } catch (err) {
    console.error("Error fetching availability:", err);
    const availability = memoryDb.state.tutor_availability.filter((a) => a.tutor_id === tutorId);
    return NextResponse.json({ availability });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("levchary_session");
    let tutorId: string | null = null;

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        tutorId = session.userId || null;
      } catch {}
    }

    if (!tutorId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { day_of_week, start_time, end_time } = body;

    if (day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json({ error: "day_of_week, start_time, end_time are required" }, { status: 400 });
    }

    if (end_time <= start_time) {
      return NextResponse.json({ error: "end_time must be after start_time" }, { status: 400 });
    }

    const newId = `av-${Date.now()}`;
    const now = new Date().toISOString();

    // Try Supabase first
    try {
      const rows = await SupabaseDbService["query"](
        `INSERT INTO tutor_availability (id, tutor_id, day_of_week, start_time, end_time, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, true, $6)
         RETURNING *`,
        [newId, tutorId, day_of_week, start_time, end_time, now]
      );
      if (rows && rows.length > 0) {
        return NextResponse.json({ availability: rows[0] }, { status: 201 });
      }
    } catch (err) {
      console.warn("DB unavailable, using memory store fallback:", err);
    }

    // Fallback to in-memory
    const newSlot = {
      id: newId,
      tutor_id: tutorId,
      day_of_week,
      start_time,
      end_time,
      is_active: true,
      created_at: now,
    };
    memoryDb.state.tutor_availability.push(newSlot);
    return NextResponse.json({ availability: newSlot }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating availability slot:", err);
    return NextResponse.json({ error: err.message || "Failed to create slot" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get("id");

    if (!slotId) {
      return NextResponse.json({ error: "Slot ID required" }, { status: 400 });
    }

    // Try Supabase first
    try {
      await SupabaseDbService["query"](
        `UPDATE tutor_availability SET is_active = false WHERE id = $1`,
        [slotId]
      );
    } catch {}

    // Always also remove from in-memory store
    memoryDb.state.tutor_availability = memoryDb.state.tutor_availability.filter((a) => a.id !== slotId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete slot" }, { status: 500 });
  }
}
