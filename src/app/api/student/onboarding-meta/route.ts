import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function GET() {
  try {
    const [grades, categories, subjects] = await Promise.all([
      SupabaseDbService.getGrades(),
      SupabaseDbService.getCategories(),
      SupabaseDbService.getSubjects(),
    ]);

    return NextResponse.json({
      grades: grades || [],
      categories: categories || [],
      subjects: subjects || [],
    });
  } catch (err: any) {
    console.error("GET /api/student/onboarding-meta error:", err);
    return NextResponse.json({ error: "Failed to load onboarding metadata" }, { status: 500 });
  }
}
