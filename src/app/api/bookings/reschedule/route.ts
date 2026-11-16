import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "ACCEPT") {
      const { bookingId } = body;
      if (!bookingId) {
        return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
      }
      const updated = await SupabaseDbService.acceptReschedule(bookingId);
      return NextResponse.json({ success: true, booking: updated });
    }

    // Default action: Propose Reschedule
    const { bookingId, newStartTime, newEndTime, reason, requestedBy } = body;
    if (!bookingId || !newStartTime) {
      return NextResponse.json({ error: "bookingId and newStartTime are required" }, { status: 400 });
    }

    const calculatedEndTime =
      newEndTime || new Date(new Date(newStartTime).getTime() + 60 * 60 * 1000).toISOString();

    const updated = await SupabaseDbService.rescheduleBooking({
      bookingId,
      newStartTime,
      newEndTime: calculatedEndTime,
      reason,
      requestedBy,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error("Reschedule API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
