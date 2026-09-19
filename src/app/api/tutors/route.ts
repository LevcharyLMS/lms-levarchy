import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const format = searchParams.get("format") || undefined;

  let tutors = await SupabaseDbService.getApprovedTutors();
  if (tutors && tutors.length > 0) {
    if (search) {
      const q = search.toLowerCase();
      tutors = tutors.filter(
        (t: any) =>
          t.user?.first_name?.toLowerCase().includes(q) ||
          t.user?.last_name?.toLowerCase().includes(q) ||
          t.headline?.toLowerCase().includes(q) ||
          t.bio?.toLowerCase().includes(q)
      );
    }
    if (format) {
      tutors = tutors.filter((t: any) => t.preferred_format === format);
    }
  } else {
    tutors = db.getTutors({ search, format });
  }

  return NextResponse.json({ tutors });
}
