import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { NotificationService } from "@/services/notification";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const instructorId = searchParams.get("instructorId") || undefined;
    const studentId = searchParams.get("studentId") || undefined;
    const classId = searchParams.get("classId") || undefined;
    const status = searchParams.get("status") || undefined;

    const assignments = await SupabaseDbService.getAssignments({
      instructorId,
      studentId,
      classId,
      status,
    });

    let progressionMetrics = null;
    if (studentId) {
      progressionMetrics = await SupabaseDbService.getStudentProgressionMetrics(studentId);
    }

    return NextResponse.json({ assignments, progressionMetrics });
  } catch (err: any) {
    console.error("GET /api/assignments error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.instructorId || !body.dueDate) {
      return NextResponse.json(
        { error: "Title, instructorId, and dueDate are required." },
        { status: 400 }
      );
    }

    const created = await SupabaseDbService.createAssignment({
      instructor_id: body.instructorId,
      class_id: body.classId || null,
      booking_id: body.bookingId || null,
      title: body.title,
      description: body.description || "",
      file_url: body.fileUrl || null,
      file_name: body.fileName || null,
      resource_links: body.resourceLinks || [],
      max_marks: body.maxMarks ? parseFloat(body.maxMarks) : 100,
      due_date: body.dueDate,
      status: body.status || "PUBLISHED",
    });

    if (!created) {
      return NextResponse.json({ error: "Failed to create assignment." }, { status: 500 });
    }

    // Trigger notification if created for a specific class or booking session
    if (body.classId) {
      const bookings = await SupabaseDbService.getBookings({ classId: body.classId } as any);
      for (const b of bookings) {
        if (b.student_id) {
          NotificationService.sendNotification({
            userId: b.student_id,
            title: "New Post-Class Assignment Published",
            message: `Your instructor posted an assignment: "${body.title}". Due on ${new Date(body.dueDate).toLocaleDateString()}.`,
            type: "CLASS_REMINDER",
            link: "/student/assignments",
            idempotencyKey: `notif-assign-${created.id}-${b.student_id}`,
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({ assignment: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/assignments error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required." }, { status: 400 });
    }

    const updated = await SupabaseDbService.updateAssignment(id, updates);
    return NextResponse.json({ assignment: updated });
  } catch (err: any) {
    console.error("PATCH /api/assignments error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
