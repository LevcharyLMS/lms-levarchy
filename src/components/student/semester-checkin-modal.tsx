"use client";

import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface SemesterCheckinModalProps {
  userId: string;
  initialGradeLevel?: string | null;
  initialGoals?: string | null;
  initialPhone?: string | null;
  initialSubjects?: string[];
  onCompleted: () => void;
}

const DEFAULT_GRADE_OPTIONS = [
  "Middle School (Grades 6-8)",
  "High School (Grades 9-10)",
  "High School (Grades 11-12)",
  "Undergraduate / College",
  "Graduate / Professional",
];

const COMMON_SUBJECTS = [
  "AP Calculus BC",
  "Algebra & Geometry",
  "Physics: Mechanics",
  "Organic Chemistry",
  "Python & Algorithms",
  "Academic Writing",
  "Digital SAT Prep",
];

export function SemesterCheckinModal({
  userId,
  initialGradeLevel,
  initialGoals,
  initialPhone,
  initialSubjects = [],
  onCompleted,
}: SemesterCheckinModalProps) {
  const [gradeLevel, setGradeLevel] = useState<string>(
    initialGradeLevel || "High School (Grades 11-12)"
  );
  const [learningGoals, setLearningGoals] = useState<string>(
    initialGoals || "Score 5 on AP Exams & improve STEM foundations"
  );
  const [phone, setPhone] = useState<string>(initialPhone || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialSubjects.length > 0 ? initialSubjects : ["AP Calculus BC", "Physics: Mechanics"]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradeOptions, setGradeOptions] = useState<string[]>(DEFAULT_GRADE_OPTIONS);

  React.useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch("/api/admin/grades");
        if (res.ok) {
          const data = await res.json();
          if (data.grades && data.grades.length > 0) {
            setGradeOptions(data.grades.map((g: any) => g.name));
          }
        }
      } catch {}
    }
    fetchGrades();
  }, []);
  const [error, setError] = useState<string | null>(null);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeLevel) {
      setError("Please select your current grade level.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/student/profile-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          gradeLevel,
          learningGoals,
          subjects: selectedSubjects,
          parentGuardianPhone: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit check-in");
      }

      onCompleted();
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">
                  6-Month Academic Check-in
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[10px] font-semibold border border-teal-400/30">
                  Required
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Verify your current curriculum standing for accurate educator matching
              </p>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Academic Grade Level */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Current Academic Grade Standing
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gradeOptions.map((g) => {
                const isSelected = gradeLevel === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGradeLevel(g)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50/70 text-teal-950 font-bold shadow-xs"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <span className="truncate">{g}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Target Subject Focus */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Active Subjects & Key Goals (Select All That Apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SUBJECTS.map((sub) => {
                const active = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      active
                        ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Learning Goals Summary */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Semester Learning Focus or Target Exam
            </label>
            <input
              type="text"
              placeholder="e.g., Score 5 on AP Calculus, prep for SAT Math"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* 4. Parent / Guardian Contact Verification */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Parent or Emergency Contact Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="tel"
                placeholder="+1 (555) 012-3456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Used strictly for session schedule alerts and learning hub safety verification.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Academic Standing...</span>
                </>
              ) : (
                <>
                  <span>Confirm & Continue to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
