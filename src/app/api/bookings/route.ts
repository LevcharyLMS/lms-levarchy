import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";
import { BookingService } from "@/services/booking";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;
  const tutorId = searchParams.get("tutorId") || undefined;

  const bookings = await SupabaseDbService.getBookings({ studentId, tutorId });
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.classType === "GROUP") {
      const result = await BookingService.enrollInGroupClass({
        studentId: body.studentId,
        classId: body.classId,
        timezone: body.timezone,
      });
      return NextResponse.json(result, { status: 201 });
    } else {
      const result = await BookingService.bookOneOnOne({
        studentId: body.studentId,
        tutorId: body.tutorId,
        classId: body.classId,
        startTime: body.startTime,
        endTime: body.endTime,
        timezone: body.timezone,
        format: body.format,
        locationId: body.locationId,
        notes: body.notes,
      });
      return NextResponse.json(result, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
