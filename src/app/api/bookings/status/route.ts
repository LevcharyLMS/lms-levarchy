import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, status, actorId, notes, attendanceMetadata } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: "bookingId and status are required" }, { status: 400 });
    }

    const updated = await SupabaseDbService.updateBookingStatus({
      bookingId,
      status,
      actorId,
      notes,
      attendanceMetadata,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update booking status" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error("Booking status API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
