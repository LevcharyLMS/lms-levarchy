import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get("instructorId") || undefined;
    const status = searchParams.get("status") || undefined;

    const suggestions = await SupabaseDbService.getTaxonomySuggestions({
      instructorId,
      status,
    });

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error("Error fetching taxonomy suggestions:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load suggestions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      instructorId,
      type,
      proposedName,
      parentCategoryId,
      reasonNotes,
      proposedCategory,
      proposedSubject,
      proposedGrade,
    } = body;

    if (!instructorId || !type || !reasonNotes?.trim()) {
      return NextResponse.json(
        { error: "Instructor ID, suggestion type, and description/notes are required" },
        { status: 400 }
      );
    }

    if (!["CATEGORY", "SUBJECT", "GRADE", "ALL_IN_ONE"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be CATEGORY, SUBJECT, GRADE, or ALL_IN_ONE" },
        { status: 400 }
      );
    }

    if (type === "ALL_IN_ONE") {
      const subName = proposedSubject?.trim() || proposedName?.trim();
      if (!subName) {
        return NextResponse.json(
          { error: "A proposed subject title is required for an all-in-one suggestion" },
          { status: 400 }
        );
      }
      if (!parentCategoryId && !proposedCategory?.trim()) {
        return NextResponse.json(
          { error: "Please either select an existing category or enter a new proposed category" },
          { status: 400 }
        );
      }

      const suggestion = await SupabaseDbService.createTaxonomySuggestion({
        instructorId,
        type: "ALL_IN_ONE",
        proposedName: subName,
        parentCategoryId: parentCategoryId || null,
        reasonNotes: reasonNotes.trim(),
        proposedCategory: proposedCategory?.trim() || null,
        proposedSubject: subName,
        proposedGrade: proposedGrade?.trim() || null,
      });

      return NextResponse.json({ success: true, suggestion }, { status: 201 });
    }

    if (!proposedName?.trim()) {
      return NextResponse.json(
        { error: "Proposed name is required" },
        { status: 400 }
      );
    }

    if (type === "SUBJECT" && !parentCategoryId) {
      return NextResponse.json(
        { error: "Parent category is required when proposing a subject" },
        { status: 400 }
      );
    }

    const suggestion = await SupabaseDbService.createTaxonomySuggestion({
      instructorId,
      type,
      proposedName: proposedName.trim(),
      parentCategoryId: parentCategoryId || undefined,
      reasonNotes: reasonNotes.trim(),
    });

    return NextResponse.json({ success: true, suggestion }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating taxonomy suggestion:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit suggestion" },
      { status: 500 }
    );
  }
}
