import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { NotificationService } from "@/services/notification";
import { BrevoService } from "@/lib/brevo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") || undefined;
    const instructorId = searchParams.get("instructorId") || undefined;
    const studentId = searchParams.get("studentId") || undefined;
    const status = searchParams.get("status") || undefined;
    const adminView = searchParams.get("admin") === "true";

    const reports = await SupabaseDbService.getClassReports({
      classId,
      instructorId,
      studentId,
      status,
      adminView,
    });

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("GET /api/class-reports error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch class reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      classId,
      bookingId,
      instructorId,
      format,
      classType,
      sessionDate,
      locationId,
      topicsCovered,
      homeworkAssigned,
      instructorPrivateNotes,
      textClassComments,
      attendanceRecords,
      status, // 'DRAFT' or 'PENDING_ADMIN_REVIEW'
    } = body;

    if (!classId || !instructorId || !topicsCovered || !textClassComments) {
      return NextResponse.json(
        { error: "Missing required class report fields (classId, instructorId, topicsCovered, textClassComments)" },
        { status: 400 }
      );
    }

    const report = await SupabaseDbService.createClassReport({
      classId,
      bookingId,
      instructorId,
      format: format || "VIRTUAL",
      classType: classType || "ONE_ON_ONE",
      sessionDate,
      locationId,
      topicsCovered,
      homeworkAssigned,
      instructorPrivateNotes,
      textClassComments,
      attendanceRecords: attendanceRecords || [],
      status: status || "PENDING_ADMIN_REVIEW",
    });

    // If submitted for admin review, send in-app notification to admins
    if (report && report.status === "PENDING_ADMIN_REVIEW") {
      try {
        const admins = await SupabaseDbService.query(
          `SELECT id FROM profiles WHERE role IN ('ADMIN', 'OWNER') LIMIT 10`
        );
        for (const admin of admins) {
          await NotificationService.dispatchMultiChannel({
            recipientId: admin.id,
            channels: ["IN_APP"],
            title: "New Post-Class Report Pending Review",
            message: `An instructor submitted a class report requiring admin approval before publishing.`,
            metadata: { reportId: report.id, classId },
          });
        }
      } catch (adminNotifErr) {
        console.warn("Notice: Admin notification on class report submit:", adminNotifErr);
      }
    }

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/class-reports error:", error);
    return NextResponse.json({ error: error.message || "Failed to create class report" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, status, adminReviewerId, adminNotes } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: "reportId and status are required" }, { status: 400 });
    }

    const updated = await SupabaseDbService.updateClassReportStatus({
      reportId,
      status,
      adminReviewerId,
      adminNotes,
    });

    if (!updated) {
      return NextResponse.json({ error: "Class report not found or update failed" }, { status: 404 });
    }

    // If report is approved and published over platform, notify enrolled students & instructor
    if (status === "APPROVED" || status === "PUBLISHED") {
      try {
        // 1. Notify instructor via email & in-app
        const instructor = await SupabaseDbService.getProfileById(updated.instructor_id);
        if (instructor?.email) {
          const classData = await SupabaseDbService.getClassById(updated.class_id);
          const classTitle = classData?.title || "Class Session";
          await BrevoService.sendClassReportApprovalNotification({
            to: instructor.email,
            instructorName: `${instructor.first_name} ${instructor.last_name}`.trim(),
            classTitle,
            sessionDate: new Date(updated.session_date).toLocaleDateString(),
          });
        }

        // 2. In-App notification to enrolled students
        const bookings = await SupabaseDbService.query(
          `SELECT student_id FROM bookings WHERE class_id = $1 AND status != 'CANCELLED'`,
          [updated.class_id]
        );
        for (const b of bookings) {
          if (b.student_id) {
            await NotificationService.dispatchMultiChannel({
              recipientId: b.student_id,
              channels: ["IN_APP"],
              title: "New Class Report & Teacher Notes Published",
              message: `Your instructor has published session notes and comments. Check them out on the platform.`,
              metadata: { reportId: updated.id, classId: updated.class_id },
            });
          }
        }
      } catch (notifErr) {
        console.warn("Post-approval notification dispatch notice:", notifErr);
      }
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    console.error("PATCH /api/class-reports error:", error);
    return NextResponse.json({ error: error.message || "Failed to update class report status" }, { status: 500 });
  }
}
