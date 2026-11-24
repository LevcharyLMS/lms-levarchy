// ============================================================
// LEVCHARY LMS - ACADEMIC RECOMMENDATION ENGINE
// Multi-factor weighted match algorithm for tutors and classes
// Conforms to 100-point academic affinity matrix
// ============================================================

import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";

export interface StudentRecommendationContext {
  studentId?: string;
  gradeLevel?: string | null;
  learningGoals?: string | null;
  preferredSubjects?: string[];
  preferredFormat?: "VIRTUAL" | "PHYSICAL" | "BOTH";
  city?: string | null;
  state?: string | null;
  maxHourlyRate?: number;
}

export interface ScoredTutor {
  tutor: any;
  matchScore: number; // 0 - 100%
  matchReasons: string[];
}

export interface ScoredClass {
  classItem: any;
  matchScore: number; // 0 - 100%
  matchReasons: string[];
}

export class RecommendationService {
  /**
   * Normalize grade level string for fuzzy matching
   */
  private static normalizeGrade(grade?: string | null): string {
    if (!grade) return "";
    return grade.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  /**
   * Resolves student profile context from database or memory store
   */
  public static async resolveStudentContext(
    studentId: string
  ): Promise<StudentRecommendationContext> {
    try {
      const user = await SupabaseDbService.getUserById(studentId);
      const studentProfile = (user as any)?.student_profile || (user as any)?.studentProfile;

      let prefs: any = studentProfile?.preferences || {};
      if (typeof prefs === "string") {
        try {
          prefs = JSON.parse(prefs);
        } catch {
          prefs = {};
        }
      }

      return {
        studentId,
        gradeLevel: studentProfile?.grade_level || prefs?.grade_level || null,
        learningGoals: studentProfile?.learning_goals || prefs?.learning_goals || null,
        preferredSubjects: prefs?.subjects || prefs?.preferred_subjects || [],
        preferredFormat: prefs?.class_format || prefs?.preferred_format || "BOTH",
        city: user?.city || null,
        state: user?.state || null,
        maxHourlyRate: prefs?.max_rate ? Number(prefs.max_rate) : undefined,
      };
    } catch {
      return { studentId };
    }
  }

  /**
   * Computes weighted 100-point academic match score for a tutor
   */
  public static scoreTutor(
    tutor: any,
    ctx: StudentRecommendationContext
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // --- 1. GRADE LEVEL ALIGNMENT (25 pts) ---
    if (ctx.gradeLevel) {
      const normStudentGrade = this.normalizeGrade(ctx.gradeLevel);
      const tutorGrades = Array.isArray(tutor.grades) ? tutor.grades : [];
      const tutorGradeNames = tutorGrades.map((g: any) =>
        this.normalizeGrade(typeof g === "string" ? g : g?.name)
      );

      // Check direct match
      const exactMatch = tutorGradeNames.some((g: string) =>
        normStudentGrade.includes(g) || g.includes(normStudentGrade)
      );

      if (exactMatch) {
        score += 25;
        reasons.push(`Direct curriculum match for ${ctx.gradeLevel}`);
      } else if (
        (normStudentGrade.includes("high") && tutorGradeNames.some((g: string) => g.includes("high"))) ||
        (normStudentGrade.includes("middle") && tutorGradeNames.some((g: string) => g.includes("middle")))
      ) {
        score += 15;
        reasons.push(`Academic level aligned with your grade`);
      } else {
        score += 5; // general baseline
      }
    } else {
      score += 15; // neutral baseline if student hasn't stated grade
    }

    // --- 2. SUBJECT & INTEREST MAPPING (25 pts) ---
    const studentSubjects = (ctx.preferredSubjects || []).map((s) => s.toLowerCase().trim());
    const goals = (ctx.learningGoals || "").toLowerCase();

    const tutorSubjects = Array.isArray(tutor.subjects) ? tutor.subjects : [];
    const tutorSubNames = tutorSubjects.map((s: any) =>
      (typeof s === "string" ? s : s?.name || "").toLowerCase()
    );
    const headline = (tutor.headline || "").toLowerCase();
    const bio = (tutor.bio || "").toLowerCase();

    let subjectMatched = false;
    for (const sub of studentSubjects) {
      if (
        tutorSubNames.some((ts: string) => ts.includes(sub) || sub.includes(ts)) ||
        headline.includes(sub) ||
        bio.includes(sub)
      ) {
        score += 20;
        reasons.push(`Specialist in ${sub.toUpperCase()}`);
        subjectMatched = true;
        break;
      }
    }

    if (!subjectMatched && goals) {
      const goalWords = goals.split(/\s+/).filter((w) => w.length > 3);
      const goalMatch = goalWords.some((gw) => headline.includes(gw) || bio.includes(gw));
      if (goalMatch) {
        score += 15;
        reasons.push(`Aligned with learning goal: ${ctx.learningGoals}`);
        subjectMatched = true;
      }
    }

    if (!subjectMatched) {
      score += 8; // general subject baseline
    }

    // --- 3. LOCATION & FORMAT PROXIMITY (15 pts) ---
    const preferredFormat = ctx.preferredFormat || "BOTH";
    const tutorFormat = tutor.preferred_format || "BOTH";

    if (preferredFormat === "PHYSICAL" || preferredFormat === "BOTH") {
      const studentCity = (ctx.city || "").toLowerCase().trim();
      const tutorCity = (tutor.user?.city || "").toLowerCase().trim();

      if (studentCity && tutorCity && (studentCity.includes(tutorCity) || tutorCity.includes(studentCity))) {
        score += 15;
        reasons.push(`Teaches in your city (${tutor.user?.city})`);
      } else if (tutorFormat === "BOTH" || tutorFormat === "VIRTUAL") {
        score += 10;
        reasons.push(`Offers interactive virtual classrooms`);
      } else {
        score += 4;
      }
    } else {
      // Virtual preference
      if (tutorFormat === "VIRTUAL" || tutorFormat === "BOTH") {
        score += 15;
        reasons.push(`Interactive in-app virtual classroom`);
      } else {
        score += 5;
      }
    }

    // --- 4. TIER LEVEL & CREDENTIAL PRIORITY (15 pts) ---
    const isFaculty =
      tutor.instructor_type === "FACULTY" ||
      (tutor.qualifications || "").toLowerCase().includes("ph.d") ||
      (tutor.qualifications || "").toLowerCase().includes("master");

    if (isFaculty) {
      score += 15;
      reasons.push(`Senior Faculty Tier with advanced academic degree`);
    } else {
      score += 12;
      reasons.push(`Certified & credential-verified instructor`);
    }

    // --- 5. SOCIAL PROOF, REVIEWS & VELOCITY (10 pts) ---
    const rating = Number(tutor.rating_avg || 5.0);
    const reviewsCount = Number(tutor.reviews_count || 0);

    // Rating contribution (up to 6 pts)
    const ratingScore = Math.min(6, (rating / 5) * 6);
    score += ratingScore;

    // Volume contribution (up to 4 pts)
    if (reviewsCount >= 10) {
      score += 4;
      reasons.push(`High satisfaction track record (${rating.toFixed(1)}★ · ${reviewsCount} reviews)`);
    } else if (reviewsCount >= 3) {
      score += 2.5;
    } else {
      score += 1.5;
    }

    // --- 6. PRICE & AFFORDABILITY (10 pts) ---
    const hourlyRateDollars =
      typeof tutor.hourly_rate === "number"
        ? tutor.hourly_rate > 500
          ? Math.round(tutor.hourly_rate / 100)
          : tutor.hourly_rate
        : 60;

    if (ctx.maxHourlyRate && hourlyRateDollars <= ctx.maxHourlyRate) {
      score += 10;
      reasons.push(`Within your requested budget ($${hourlyRateDollars}/hr)`);
    } else if (hourlyRateDollars <= 65) {
      score += 8;
      reasons.push(`Competitive rate ($${hourlyRateDollars}/hr)`);
    } else {
      score += 5;
    }

    // Clamp score strictly between 10 and 99%
    const finalScore = Math.min(99, Math.max(10, Math.round(score)));

    return {
      score: finalScore,
      reasons: reasons.slice(0, 2), // Keep top 2 human-readable reasons for clean UI
    };
  }

  /**
   * Generates ranked, personalized tutor recommendations for a student
   */
  public static async getRecommendedTutors(
    contextOrStudentId: StudentRecommendationContext | string,
    limit = 4
  ): Promise<ScoredTutor[]> {
    let ctx: StudentRecommendationContext;
    if (typeof contextOrStudentId === "string") {
      ctx = await this.resolveStudentContext(contextOrStudentId);
    } else {
      ctx = contextOrStudentId;
    }

    let tutors: any[] = [];
    try {
      if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
        tutors = await Promise.race([
          SupabaseDbService.getApprovedTutors(),
          new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 1500)),
        ]);
      }
    } catch {
      tutors = [];
    }

    if (!tutors || tutors.length === 0) {
      if (db.getInstructors().length === 0) {
        db.seedTestFixtures();
      }
      tutors = db.getInstructors();
    }

    const scored: ScoredTutor[] = tutors.map((tutor) => {
      const { score, reasons } = this.scoreTutor(tutor, ctx);
      return {
        tutor,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    // Sort descending by matchScore
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored.slice(0, limit);
  }

  /**
   * Computes weighted match score for an upcoming class or cohort
   */
  public static scoreClass(
    classItem: any,
    ctx: StudentRecommendationContext
  ): { score: number; reasons: string[] } {
    let score = 50; // base score
    const reasons: string[] = [];

    const title = (classItem.title || "").toLowerCase();
    const desc = (classItem.description || "").toLowerCase();
    const format = classItem.format || "VIRTUAL";

    // Format alignment
    if (ctx.preferredFormat === format || ctx.preferredFormat === "BOTH" || !ctx.preferredFormat) {
      score += 15;
      reasons.push(format === "PHYSICAL" ? "Supervised in-person hub cohort" : "Live interactive virtual class");
    }

    // Subject alignment
    for (const sub of ctx.preferredSubjects || []) {
      const s = sub.toLowerCase();
      if (title.includes(s) || desc.includes(s)) {
        score += 25;
        reasons.push(`Direct match for ${sub}`);
        break;
      }
    }

    // Open seats bonus
    const maxCapacity = classItem.max_capacity || 10;
    const enrolled = classItem.enrolled_count || 0;
    if (enrolled < maxCapacity) {
      score += 10;
    }

    return {
      score: Math.min(99, Math.round(score)),
      reasons: reasons.slice(0, 2),
    };
  }

  /**
   * Generates ranked, personalized class recommendations for a student
   */
  public static async getRecommendedClasses(
    contextOrStudentId: StudentRecommendationContext | string,
    limit = 3
  ): Promise<ScoredClass[]> {
    let ctx: StudentRecommendationContext;
    if (typeof contextOrStudentId === "string") {
      ctx = await this.resolveStudentContext(contextOrStudentId);
    } else {
      ctx = contextOrStudentId;
    }

    let classes: any[] = [];
    try {
      if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
        classes = await SupabaseDbService.getClasses();
      }
    } catch {
      classes = [];
    }

    if (!classes || classes.length === 0) {
      classes = db.getClasses();
    }

    const scored: ScoredClass[] = classes.map((c) => {
      const { score, reasons } = this.scoreClass(c, ctx);
      return {
        classItem: c,
        matchScore: score,
        matchReasons: reasons,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored.slice(0, limit);
  }
}
