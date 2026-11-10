import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { BookingService } from "@/services/booking";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;
  const tutorId = searchParams.get("instructorId") || searchParams.get("tutorId") || undefined;

  const bookings = await SupabaseDbService.getBookings({ studentId, instructorId: tutorId, tutorId });
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let instructorId = body.instructorId || body.tutorId;

    // Resolve instructor from class if not provided
    if (!instructorId && body.classId) {
      const classItem = await SupabaseDbService.getClassById(body.classId);
      if (classItem) {
        instructorId = classItem.instructor_id || classItem.tutor_id;
      }
    }

    if (!instructorId) {
      return NextResponse.json({ error: "Instructor could not be identified for this class." }, { status: 400 });
    }

    // Persist real booking to Supabase PostgreSQL database
    const booking = await SupabaseDbService.createBooking({
      studentId: body.studentId,
      instructorId: instructorId,
      classId: body.classId,
      startTime: body.startTime,
      endTime: body.endTime || new Date(new Date(body.startTime).getTime() + 3600000).toISOString(),
      timezone: body.timezone,
      format: body.format || "VIRTUAL",
      locationId: body.locationId,
      notes: body.notes || body.studentNotes,
      status: "CONFIRMED",
    });

    // Automatically establish or ensure a conversation channel between student and instructor
    try {
      await SupabaseDbService.getOrCreateConversation(body.studentId, instructorId);
    } catch (convErr: any) {
      console.warn("Auto-establishing conversation note:", convErr?.message);
    }

    // Send notifications to student & instructor asynchronously
    try {
      await BookingService.bookOneOnOne({
        studentId: body.studentId,
        tutorId: instructorId,
        classId: body.classId,
        startTime: body.startTime,
        endTime: body.endTime || new Date(new Date(body.startTime).getTime() + 3600000).toISOString(),
        timezone: body.timezone,
        format: body.format || "VIRTUAL",
        locationId: body.locationId,
        notes: body.notes || body.studentNotes,
      }).catch((e) => console.warn("In-memory booking/notification sync note:", e.message));
    } catch {}

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: any) {
    console.error("Booking creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
