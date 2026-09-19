import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { GoogleMeetService } from "@/services/google-meet";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId") || undefined;
    const format = searchParams.get("format") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const [classes, commissionRate] = await Promise.all([
      SupabaseDbService.getClasses({ tutorId, format, categoryId, status, search }),
      SupabaseDbService.getPlatformCommissionRate(),
    ]);

    return NextResponse.json({ classes, commissionRate });
  } catch (err: any) {
    console.error("Error in GET /api/classes:", err);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Authentication verification
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("levchary_session");
    let authenticatedTutorId = body.tutor_id || body.tutorId;

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.userId) {
          authenticatedTutorId = session.userId;
        }
      } catch {}
    }

    if (!authenticatedTutorId) {
      return NextResponse.json({ error: "Authentication required to publish classes" }, { status: 401 });
    }

    // Validation
    const title = (body.title || "").trim();
    const description = (body.description || "").trim();
    if (!title || title.length < 3) {
      return NextResponse.json({ error: "Class title must be at least 3 characters" }, { status: 400 });
    }
    if (!description || description.length < 10) {
      return NextResponse.json({ error: "Class description must be at least 10 characters" }, { status: 400 });
    }

    const priceCents = Number(body.price || body.priceCents || 0);
    if (priceCents < 500) {
      return NextResponse.json({ error: "Tuition must be at least $5.00 (500 cents)" }, { status: 400 });
    }

    const durationMinutes = Number(body.duration_minutes || body.duration || 60);
    if (durationMinutes < 15) {
      return NextResponse.json({ error: "Duration must be at least 15 minutes" }, { status: 400 });
    }

    const classType = body.class_type || body.classType || "ONE_ON_ONE";
    const format = body.format || "VIRTUAL";
    const capacity = classType === "ONE_ON_ONE" ? 1 : Math.max(2, Number(body.capacity || 10));

    // Real Google Meet integration for virtual classes
    let meetUrl: string | null = null;
    let meetEventId: string | null = null;

    if (format === "VIRTUAL") {
      try {
        const meetRes = await GoogleMeetService.createMeeting({
          title: `Levchary: ${title}`,
          startTime: body.start_time || new Date(Date.now() + 86400000).toISOString(),
          endTime: body.end_time || new Date(Date.now() + 86400000 + durationMinutes * 60000).toISOString(),
        });
        meetUrl = meetRes.meetUrl;
        meetEventId = meetRes.eventId;
      } catch (err) {
        console.warn("Google Meet provisioning notice:", err);
      }
    }

    const newClass = await SupabaseDbService.createClass({
      title,
      description,
      tutor_id: authenticatedTutorId,
      category_id: body.category_id || body.categoryId || "11111111-1111-1111-1111-111111111001",
      subject_id: body.subject_id || body.subjectId || "22222222-2222-2222-2222-222222222001",
      grade_id: body.grade_id || body.gradeId || "33333333-3333-3333-3333-333333333003",
      class_type: classType,
      format,
      duration_minutes: durationMinutes,
      price: priceCents,
      currency: "USD",
      capacity,
      location_id: format === "PHYSICAL" ? body.location_id || body.locationId || "44444444-4444-4444-4444-444444444001" : null,
      meet_url: meetUrl,
      status: body.status || "PUBLISHED",
      start_time: body.start_time || null,
      end_time: body.end_time || null,
    });

    return NextResponse.json({ success: true, class: newClass }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating class in POST /api/classes:", err);
    return NextResponse.json({ error: err.message || "Failed to create class" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    const updated = await SupabaseDbService.updateClass(id, updates);
    return NextResponse.json({ success: true, class: updated });
  } catch (err: any) {
    console.error("Error updating class in PATCH /api/classes:", err);
    return NextResponse.json({ error: err.message || "Failed to update class" }, { status: 500 });
  }
}
