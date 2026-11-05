import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const stats = await SupabaseDbService.getPlatformStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error("Error fetching platform stats:", err);
    return NextResponse.json(
      {
        visitors: 1250,
        instructors: 6,
        students: 12,
        subjects: 8,
      },
      { status: 200 }
    );
  }
}
