import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId") || undefined;
    const reviews = await SupabaseDbService.getReviews(tutorId);
    return NextResponse.json({ reviews });
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
