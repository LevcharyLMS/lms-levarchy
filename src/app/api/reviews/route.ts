import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

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
    const { reviewId, is_published, is_featured_testimonial, is_moderated } = body;

    if (!reviewId) {
      return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
    }

    const updated = await SupabaseDbService.updateReview(reviewId, {
      is_published,
      is_featured_testimonial,
      is_moderated: is_moderated !== undefined ? is_moderated : true,
    });

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

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
