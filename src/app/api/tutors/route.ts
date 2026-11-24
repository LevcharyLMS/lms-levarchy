import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { RecommendationService } from "@/services/recommendation";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const format = searchParams.get("format") || undefined;
  const instructorType = (searchParams.get("type") || searchParams.get("instructorType")) as 'ALL' | 'TUTOR' | 'FACULTY' | null;
  const studentId = searchParams.get("studentId") || undefined;
  const gradeLevel = searchParams.get("gradeLevel") || undefined;

  let tutors = await SupabaseDbService.getApprovedTutors({
    instructorType: instructorType && ['TUTOR', 'FACULTY'].includes(instructorType) ? instructorType : 'ALL',
  });
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

    // Attach academic match scores if requested
    if (studentId || gradeLevel) {
      const ctx = studentId
        ? await RecommendationService.resolveStudentContext(studentId)
        : { gradeLevel };

      tutors = tutors.map((t: any) => {
        const { score, reasons } = RecommendationService.scoreTutor(t, ctx);
        return {
          ...t,
          match_score: score,
          match_reasons: reasons,
        };
      });
    }
  }

  return NextResponse.json({ tutors, instructors: tutors });
}
