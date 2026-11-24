import { describe, it, expect } from "vitest";
import { RecommendationService, StudentRecommendationContext } from "../src/services/recommendation";

describe("Recommendation Engine - Academic Match Matrix", () => {
  const sampleTutors = [
    {
      user_id: "tut-math-boston",
      instructor_type: "FACULTY",
      headline: "Senior Faculty in AP Calculus & Physics",
      bio: "12 years teaching AP Calculus BC and Linear Algebra. Ph.D. in Applied Mathematics.",
      qualifications: "Ph.D. Applied Mathematics",
      hourly_rate: 6500, // $65/hr
      rating_avg: 4.95,
      reviews_count: 24,
      preferred_format: "BOTH",
      subjects: ["AP Calculus BC", "Linear Algebra"],
      grades: ["High School (Grades 11-12)", "Undergraduate / College"],
      user: {
        id: "tut-math-boston",
        first_name: "Dr. Evelyn",
        last_name: "Reed",
        city: "Boston",
        state: "MA",
      },
    },
    {
      user_id: "tut-chem-ny",
      instructor_type: "TUTOR",
      headline: "High School Chemistry & Biology Tutor",
      bio: "Certified science tutor helping middle and high school students master organic chemistry.",
      qualifications: "B.S. Biochemistry",
      hourly_rate: 4500, // $45/hr
      rating_avg: 4.8,
      reviews_count: 8,
      preferred_format: "PHYSICAL",
      subjects: ["Organic Chemistry", "Biology"],
      grades: ["Middle School (Grades 6-8)", "High School (Grades 9-10)"],
      user: {
        id: "tut-chem-ny",
        first_name: "Marcus",
        last_name: "Vance",
        city: "New York",
        state: "NY",
      },
    },
  ];

  it("scores higher when student grade and subject match directly", () => {
    const studentCtx: StudentRecommendationContext = {
      gradeLevel: "High School (Grades 11-12)",
      preferredSubjects: ["AP Calculus BC"],
      city: "Boston",
      preferredFormat: "BOTH",
    };

    const mathScore = RecommendationService.scoreTutor(sampleTutors[0], studentCtx);
    const chemScore = RecommendationService.scoreTutor(sampleTutors[1], studentCtx);

    // Math tutor has direct grade match (+25), subject match (+20), city match (+15), and faculty tier (+15)
    expect(mathScore.score).toBeGreaterThan(chemScore.score);
    expect(mathScore.score).toBeGreaterThanOrEqual(85);
    expect(mathScore.reasons.length).toBeGreaterThan(0);
    expect(mathScore.reasons.some((r) => r.includes("High School") || r.includes("AP Calculus"))).toBe(true);
  });

  it("factors in location proximity for physical class preferences", () => {
    const bostonStudentCtx: StudentRecommendationContext = {
      preferredFormat: "PHYSICAL",
      city: "Boston",
      preferredSubjects: [],
    };

    const bostonTutorScore = RecommendationService.scoreTutor(sampleTutors[0], bostonStudentCtx);
    const nyTutorScore = RecommendationService.scoreTutor(sampleTutors[1], bostonStudentCtx);

    // Boston tutor matches city (+15)
    expect(bostonTutorScore.reasons.some((r) => r.includes("Boston"))).toBe(true);
  });

  it("prioritizes Faculty tier and credentialed educators", () => {
    const neutralCtx: StudentRecommendationContext = {
      preferredFormat: "VIRTUAL",
    };

    const facultyScore = RecommendationService.scoreTutor(sampleTutors[0], neutralCtx);
    expect(facultyScore.reasons.some((r) => r.includes("Faculty") || r.includes("degree"))).toBe(true);
  });

  it("scores upcoming classes and cohorts based on format and subject", () => {
    const sampleClass = {
      id: "cls-calc-101",
      title: "AP Calculus BC Intensive Workshop",
      description: "Master differential and integral calculus with live whiteboard sessions.",
      format: "VIRTUAL",
      max_capacity: 12,
      enrolled_count: 5,
    };

    const ctx: StudentRecommendationContext = {
      preferredSubjects: ["Calculus"],
      preferredFormat: "VIRTUAL",
    };

    const scored = RecommendationService.scoreClass(sampleClass, ctx);
    expect(scored.score).toBeGreaterThanOrEqual(75);
    expect(scored.reasons.some((r) => r.includes("Calculus"))).toBe(true);
  });
});
