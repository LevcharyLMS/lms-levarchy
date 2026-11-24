import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { BrevoService } from "@/lib/brevo";
import { NotificationService } from "@/services/notification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instructorId, sendEmail = true } = body;

    if (!instructorId) {
      return NextResponse.json({ error: "instructorId is required" }, { status: 400 });
    }

    const instructor = await SupabaseDbService.getProfileById(instructorId);
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    // Query all published reviews for this instructor
    const reviews = await SupabaseDbService.getReviews({ instructorId, adminView: true });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0) / totalReviews
        : 5.0;

    const formattedReviews = reviews.slice(0, 10).map((r: any) => ({
      studentName: `${r.student_first_name || "Student"} ${r.student_last_name ? r.student_last_name[0] + "." : ""}`.trim(),
      rating: Number(r.rating) || 5,
      comment: r.comment || "",
      date: new Date(r.created_at).toLocaleDateString(),
      classTitle: r.booking_number ? `Booking ${r.booking_number}` : undefined,
    }));

    let emailResult: { success: boolean; skipped?: boolean; error?: string } = { success: false, skipped: true };

    if (sendEmail && instructor.email) {
      emailResult = await BrevoService.sendFeedbackReviewReportEmail({
        to: instructor.email,
        instructorName: `${instructor.first_name} ${instructor.last_name}`.trim(),
        totalReviews,
        averageRating,
        recentReviews: formattedReviews,
        viewUrl: "https://levchary.com/instructor/dashboard",
      });
    }

    // In-App confirmation for instructor
    await NotificationService.dispatchMultiChannel({
      recipientId: instructorId,
      channels: ["IN_APP"],
      title: "Student Feedback Review Report Generated",
      message: `Your compiled feedback report with ${totalReviews} student reviews (${averageRating.toFixed(1)} avg) has been prepared.`,
      metadata: { averageRating, totalReviews },
    });

    return NextResponse.json({
      success: true,
      report: {
        instructorId,
        instructorName: `${instructor.first_name} ${instructor.last_name}`.trim(),
        instructorEmail: instructor.email,
        totalReviews,
        averageRating: Number(averageRating.toFixed(2)),
        reviews: formattedReviews,
      },
      emailDelivery: emailResult,
    });
  } catch (error: any) {
    console.error("POST /api/reviews/report error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate review report" }, { status: 500 });
  }
}
