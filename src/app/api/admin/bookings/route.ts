import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || undefined;
    const tutorId = searchParams.get("tutorId") || undefined;

    const bookings = await SupabaseDbService.getBookings({ studentId, tutorId });
    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, status, actorId = "usr-admin-1", note } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Missing bookingId or status" }, { status: 400 });
    }

    // Update in data store
    const booking = db.getBookings().find((b) => b.id === bookingId);
    if (booking) {
      booking.status = status;
    }

    // Record immutable audit entry
    db.logAudit({
      actor_id: actorId,
      actor_role: "ADMIN",
      action: status === "CANCELLED" ? "BOOKING_ADMIN_CANCELLED" : `BOOKING_STATUS_${status}`,
      entity_type: "BOOKING",
      entity_id: bookingId,
      metadata: {
        booking_number: booking?.booking_number,
        student_id: booking?.student_id,
        tutor_id: booking?.tutor_id,
        status,
        note: note || undefined,
      },
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

