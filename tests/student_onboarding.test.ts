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
});
