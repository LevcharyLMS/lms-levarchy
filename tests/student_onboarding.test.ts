import { describe, it, expect } from "vitest";
import { isStudentOnboarded } from "../src/lib/utils";

describe("Student Onboarding Detection & Protected Routing", () => {
  it("returns false for new student without preferences or grade level", () => {
    expect(isStudentOnboarded(null)).toBe(false);
    expect(isStudentOnboarded({ preferences: { onboarding_completed: false } })).toBe(false);
  });

  it("detects onboarded status from explicit boolean or stringified JSON", () => {
    expect(isStudentOnboarded({ preferences: { onboarding_completed: true } })).toBe(true);
    expect(isStudentOnboarded({ preferences: '{"onboarding_completed": true}' })).toBe(true);
  });

  it("detects existing/old student accounts from grade_level or learning_goals", () => {
    expect(isStudentOnboarded({ grade_level: "High School (Grades 9-10)", preferences: {} })).toBe(true);
    expect(isStudentOnboarded({ learning_goals: "Exam Prep", preferences: {} })).toBe(true);
    expect(isStudentOnboarded({ preferences: { subjects: ["Calculus"] } })).toBe(true);
  });

  describe("6-Month Semester Profile Check-in Cadence", () => {
    it("determines whether 180 days have elapsed since last profile verification", () => {
      const isCheckinDue = (lastVerifiedAt?: string | null): boolean => {
        if (!lastVerifiedAt) return false;
        const daysSince = (Date.now() - new Date(lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= 180;
      };

      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const twoHundredDaysAgo = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();

      expect(isCheckinDue(ninetyDaysAgo)).toBe(false);
      expect(isCheckinDue(twoHundredDaysAgo)).toBe(true);
    });

    it("updates student profile verification timestamp and preferences on check-in", async () => {
      const { SupabaseDbService } = await import("../src/lib/supabase-db");
      const { db } = await import("../src/lib/data-store");

      const studentId = "usr-checkin-test";
      db.state.profiles.push({
        id: studentId,
        email: "checkin@test.com",
        role: "STUDENT",
        first_name: "Semester",
        last_name: "Tester",
        account_status: "ACTIVE",
        verification_status: "APPROVED",
        email_verified: true,
        country: "US",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      db.state.student_profiles.push({
        user_id: studentId,
        grade_level: "High School (Grades 9-10)",
        preferences: { subjects: ["Geometry"] },
        profile_last_verified_at: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const res = await SupabaseDbService.updateStudentSemesterCheckin({
        userId: studentId,
        gradeLevel: "High School (Grades 11-12)",
        learningGoals: "Score 5 on AP Calculus",
        subjects: ["AP Calculus BC", "Physics: Mechanics"],
        parentGuardianPhone: "+15559876543",
      });

      expect(res.success).toBe(true);
      expect(res.studentProfile.grade_level).toBe("High School (Grades 11-12)");
      expect(res.studentProfile.profile_last_verified_at).toBeDefined();

      const updatedSp = db.state.student_profiles.find((p) => p.user_id === studentId);
      expect(updatedSp?.grade_level).toBe("High School (Grades 11-12)");
    });
  });
});
