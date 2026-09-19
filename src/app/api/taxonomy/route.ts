import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function GET() {
  try {
    const [categories, subjects, grades, locations] = await Promise.all([
      SupabaseDbService.getCategories(),
      SupabaseDbService.getSubjects(),
      SupabaseDbService.getGrades(),
      SupabaseDbService.getLocations(),
    ]);

    return NextResponse.json({ categories, subjects, grades, locations });
  } catch (err: any) {
    console.error("Error fetching taxonomy:", err);
    return NextResponse.json({ error: "Failed to load taxonomy" }, { status: 500 });
  }
}
