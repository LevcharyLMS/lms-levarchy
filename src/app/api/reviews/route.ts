import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";
import { NotificationService } from "@/services/notification";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId") || undefined;
    const featuredOnly = searchParams.get("featured") === "true";
    const adminView = searchParams.get("admin") === "true";

    const reviews = await SupabaseDbService.getReviews({
      tutorId,
      featuredOnly,
      adminView,
    });
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId, is_published, is_featured_testimonial, is_moderated, actorId = "usr-admin-1" } = body;

    if (!reviewId) {
      return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
    }

    const updated = await SupabaseDbService.updateReview(reviewId, {
      is_published,
      is_featured_testimonial,
      is_moderated: is_moderated !== undefined ? is_moderated : true,
    });

    // Audit Logging
    try {
      db.logAudit({
        actor_id: actorId,
        actor_role: "ADMIN",
        action: is_featured_testimonial
          ? "REVIEW_FEATURED_TESTIMONIAL"
          : is_published
          ? "REVIEW_APPROVED_PUBLISHED"
          : "REVIEW_UNPUBLISHED",
        entity_type: "REVIEW",
        entity_id: reviewId,
        metadata: {
          review_id: reviewId,
          is_published,
          is_featured_testimonial,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, studentId, tutorId, rating, comment } = body;

    if (!bookingId || !rating) {
      return NextResponse.json({ error: "Missing required review fields" }, { status: 400 });
    }

    const review = await SupabaseDbService.createReview(
      bookingId,
      studentId || "usr-stu-1",
      tutorId,
      rating,
      comment || ""
    );

    // Also update in-memory store for sync
    try {
      db.submitReview({
        bookingId,
        studentId: studentId || "usr-stu-1",
        tutorId,
        rating,
        comment: comment || "",
      });
    } catch {}

    // Dispatch In-App Notifications for instructor and admin (per user feedback policy)
    try {
      // 1. Notify instructor
      if (tutorId) {
        await NotificationService.dispatchMultiChannel({
          recipientId: tutorId,
          channels: ["IN_APP"],
          title: "New Student Review Received",
          message: `A student submitted a ${rating}-star review for your completed class session.`,
          metadata: { bookingId, rating },
        });
      }

      // 2. Notify platform admins
      const admins = await SupabaseDbService.query(
        `SELECT id FROM profiles WHERE role IN ('ADMIN', 'OWNER') LIMIT 10`
      );
      for (const admin of admins) {
        await NotificationService.dispatchMultiChannel({
          recipientId: admin.id,
          channels: ["IN_APP"],
          title: `New Student Rating (${rating}★)`,
          message: `Student left feedback for instructor. Review is awaiting moderation or published.`,
          metadata: { bookingId, rating, tutorId },
        });
      }
    } catch (notifErr) {
      console.warn("Review notification notice:", notifErr);
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
