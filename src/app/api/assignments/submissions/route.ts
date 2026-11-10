import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { NotificationService } from "@/services/notification";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
    }

    const submissions = await SupabaseDbService.getSubmissions(assignmentId);
    return NextResponse.json({ submissions });
  } catch (err: any) {
    console.error("GET /api/assignments/submissions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.assignmentId || !body.studentId) {
      return NextResponse.json(
        { error: "assignmentId and studentId are required" },
        { status: 400 }
      );
    }

    const submission = await SupabaseDbService.submitAssignment({
      assignment_id: body.assignmentId,
      student_id: body.studentId,
      submission_text: body.submissionText || "",
      file_url: body.fileUrl || null,
      file_name: body.fileName || null,
      file_size: body.fileSize || null,
    });

    if (!submission) {
      return NextResponse.json({ error: "Failed to submit assignment." }, { status: 500 });
    }

    // Notify instructor that work was submitted
    const assignment = await SupabaseDbService.getAssignmentById(body.assignmentId);
    if (assignment && assignment.instructor_id) {
      NotificationService.sendNotification({
        userId: assignment.instructor_id,
        title: "Assignment Submission Received",
        message: `A student submitted work for "${assignment.title}". Ready for review & grading.`,
        type: "CLASS_REMINDER",
        link: "/instructor/assignments",
        idempotencyKey: `notif-sub-${submission.id}`,
      }).catch(() => {});
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/assignments/submissions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, marksAwarded, gradeLetter, instructorFeedback } = body;

    if (!submissionId || marksAwarded === undefined) {
      return NextResponse.json(
        { error: "submissionId and marksAwarded are required" },
        { status: 400 }
      );
    }

    const graded = await SupabaseDbService.gradeSubmission(submissionId, {
      marks_awarded: parseFloat(marksAwarded),
      grade_letter: gradeLetter || "A",
      instructor_feedback: instructorFeedback || "",
    });

    if (!graded) {
      return NextResponse.json({ error: "Failed to grade submission." }, { status: 500 });
    }

    // Notify student that grades and feedback were published
    if (graded.student_id) {
      NotificationService.sendNotification({
        userId: graded.student_id,
        title: "Assignment Graded & Feedback Published",
        message: `Your instructor marked your assignment. Grade: ${gradeLetter || "A"} (${marksAwarded} pts). Click to view feedback.`,
        type: "CLASS_REMINDER",
        link: "/student/assignments",
        idempotencyKey: `notif-graded-${graded.id}`,
      }).catch(() => {});
    }

    return NextResponse.json({ submission: graded });
  } catch (err: any) {
    console.error("PATCH /api/assignments/submissions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
