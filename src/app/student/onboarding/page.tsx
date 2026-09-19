"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap,
  BookOpen,
  Target,
  Video,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Clock,
  Laptop,
  Compass,
} from "lucide-react";

const GRADE_LEVELS = [
  { id: "Middle School (Grades 6-8)", label: "Middle School", sub: "Grades 6 – 8" },
  { id: "High School Freshman (Grade 9)", label: "Freshman", sub: "Grade 9" },
  { id: "High School Sophomore (Grade 10)", label: "Sophomore", sub: "Grade 10" },
  { id: "High School Junior (Grade 11)", label: "Junior", sub: "Grade 11 • AP/SAT Prep" },
  { id: "High School Senior (Grade 12)", label: "Senior", sub: "Grade 12 • College Prep" },
  { id: "College / Undergraduate", label: "College", sub: "Undergraduate STEM & Arts" },
  { id: "Graduate / Adult Learner", label: "Adult Learner", sub: "Professional Certification" },
];

const SUBJECT_OPTIONS = [
  "Calculus (AP / College)",
  "Algebra & Trigonometry",
  "Geometry & Pre-Calc",
  "Statistics & Data Analysis",
  "Physics (AP 1 / C Mechanics)",
  "Chemistry & Organic Synthesis",
  "Biology & Biochemistry",
  "Computer Science & Python",
  "SAT / ACT Standardized Prep",
  "English Literature & Writing",
  "World Languages",
  "Economics & Microeconomics",
];

const LEARNING_GOALS = [
  {
    id: "Exam Preparation & High Scores",
    title: "Exam Preparation & Test Mastery",
    desc: "Prepare for AP, SAT/ACT, midterms, or standardized tests with targeted problem-solving drills.",
    icon: Target,
  },
  {
    id: "Raise Grades & Homework Help",
    title: "Homework Support & Grade Recovery",
    desc: "Stay ahead in school coursework with weekly step-by-step guidance on challenging assignments.",
    icon: BookOpen,
  },
  {
    id: "Deep Conceptual Mastery",
    title: "Deep Conceptual Understanding",
    desc: "Build rock-solid intuition and fundamental mastery beyond rote memorization.",
    icon: Sparkles,
  },
  {
    id: "Accelerated & Advanced Study",
    title: "Academic Acceleration & Contests",
    desc: "Advance ahead of school curriculum or train for STEM competitions and olympiads.",
    icon: Compass,
  },
];

const MODALITY_OPTIONS = [
  {
    id: "VIRTUAL",
    title: "Google Meet Virtual Classroom",
    desc: "Live 1-on-1 and cohort sessions via dedicated Google Meet rooms with screen sharing.",
    icon: Video,
  },
  {
    id: "PHYSICAL",
    title: "Physical Learning Center",
    desc: "In-person sessions conducted at verified Levchary monitored partner study centers.",
    icon: MapPin,
  },
  {
    id: "BOTH",
    title: "Hybrid (Virtual & In-Person)",
    desc: "Maximum flexibility: attend online when busy or meet at learning centers when convenient.",
    icon: Laptop,
  },
];

const COMMITMENT_OPTIONS = [
  "1 – 2 hours / week (Paced)",
  "3 – 5 hours / week (Recommended)",
  "5+ hours / week (Intensive Prep)",
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding, studentProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Questionnaire form state
  const [gradeLevel, setGradeLevel] = useState(studentProfile?.grade_level || "High School Junior (Grade 11)");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    ((studentProfile?.preferences as any)?.subjects as string[]) || ["Calculus (AP / College)", "Physics (AP 1 / C Mechanics)"]
  );
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    ((studentProfile?.preferences as any)?.primary_goal as string) || "Exam Preparation & High Scores"
  );
  const [preferredFormat, setPreferredFormat] = useState<"VIRTUAL" | "PHYSICAL" | "BOTH">(
    ((studentProfile?.preferences as any)?.preferred_format as any) || "VIRTUAL"
  );
  const [weeklyCommitment, setWeeklyCommitment] = useState(
    ((studentProfile?.preferences as any)?.weekly_commitment as string) || "3 – 5 hours / week (Recommended)"
  );
  const [city, setCity] = useState(user?.city || "Boston");
  const [state, setState] = useState(user?.state || "MA");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState(
    ((studentProfile?.preferences as any)?.notes as string) || ""
  );

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !gradeLevel) {
      setError("Please select your current grade or academic standing.");
      return;
    }
    if (currentStep === 2 && selectedSubjects.length === 0) {
      setError("Please select at least one subject you want tutoring support in.");
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const success = await completeOnboarding({
      gradeLevel,
      subjects: selectedSubjects,
      primaryGoal,
      preferredFormat,
      weeklyCommitment,
      city,
      state,
      phone,
      notes,
    });

    if (success) {
      router.push("/student/dashboard");
    } else {
      setSubmitting(false);
      setError("Failed to save your questionnaire responses. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-[88vh] bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Personalized Learning Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950">
            Welcome to Levchary, {user?.first_name || "Student"}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Tell us about your learning objectives and academic needs so we can match you with verified, vetted educators.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Step {currentStep} of 5</span>
            <span className="text-primary font-bold">
              {currentStep === 1 && "Academic Standing"}
              {currentStep === 2 && "Subject Focus Areas"}
              {currentStep === 3 && "Objectives & Format"}
              {currentStep === 4 && "Contact & Venue"}
              {currentStep === 5 && "Review & Launch"}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Grade Level */}
        {currentStep === 1 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  <span>Question 1 of 4</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  What is your current academic grade level?
                </h2>
                <p className="text-xs text-slate-500">
                  This ensures classes and tutorial sessions match the curriculum depth of your coursework.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRADE_LEVELS.map((g) => {
                  const isSelected = gradeLevel === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGradeLevel(g.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-indigo-50/50 shadow-xs ring-2 ring-primary/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-navy-950">{g.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-xs text-slate-500 mt-1">{g.sub}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Subjects Focus */}
        {currentStep === 2 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Question 2 of 4</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  Which subjects do you need tutoring support in?
                </h2>
                <p className="text-xs text-slate-500">
                  Select all subjects you are currently studying or preparing for (select multiple).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SUBJECT_OPTIONS.map((subj) => {
                  const isSelected = selectedSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => toggleSubject(subj)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? "border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-600"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <span>{subj}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Goals & Modality */}
        {currentStep === 3 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>Question 3 of 4</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  What is your primary learning goal & preferred format?
                </h2>
                <p className="text-xs text-slate-500">
                  Choose what success looks like and how you learn most effectively.
                </p>
              </div>

              {/* Learning Goals */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Primary Objective</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LEARNING_GOALS.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = primaryGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setPrimaryGoal(goal.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all space-y-1 ${
                          isSelected
                            ? "border-primary bg-indigo-50/50 shadow-xs ring-1 ring-primary"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="font-bold text-xs text-navy-950">{goal.title}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{goal.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Format */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">Classroom Modality</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MODALITY_OPTIONS.map((m) => {
                    const Icon = m.icon;
                    const isSelected = preferredFormat === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPreferredFormat(m.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                          isSelected
                            ? "border-teal-600 bg-teal-50/60 shadow-xs ring-1 ring-teal-600"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className="w-4 h-4 text-teal-700" />
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
                        </div>
                        <p className="font-bold text-xs text-navy-950">{m.title}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Commitment */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">Desired Weekly Study Time</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {COMMITMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWeeklyCommitment(opt)}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                        weeklyCommitment === opt
                          ? "border-primary bg-indigo-50 font-bold text-primary"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Contact & Venue */}
        {currentStep === 4 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>Question 4 of 4</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  Location & Contact Preferences
                </h2>
                <p className="text-xs text-slate-500">
                  Your city and state help us suggest local tutors and nearby learning centers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">City</label>
                  <Input
                    placeholder="e.g. Boston, Seattle, Austin"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">State / Region</label>
                  <Input
                    placeholder="e.g. MA, WA, TX"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Mobile Phone Number (Optional)</label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <p className="text-[11px] text-slate-400">Used for class start SMS reminders and security verification.</p>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Specific Topics or Academic Challenges (Optional)</label>
                  <Textarea
                    placeholder="e.g. I need focused help preparing for AP Calculus integrals and derivatives ahead of the May AP exam..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-xs min-h-[90px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review & Confirmation */}
        {currentStep === 5 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Ready to Launch</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  Review Your Academic Profile
                </h2>
                <p className="text-xs text-slate-500">
                  Here is a summary of your learning preferences. You can update these anytime from your student profile.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium">Student Name:</span>
                    <p className="font-bold text-navy-950">{user?.first_name} {user?.last_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Email:</span>
                    <p className="font-bold text-navy-950">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Academic Level:</span>
                    <p className="font-bold text-navy-950">{gradeLevel}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Location:</span>
                    <p className="font-bold text-navy-950">{city || "Not specified"}, {state || ""}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Selected Subjects:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedSubjects.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-semibold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium">Primary Goal:</span>
                    <p className="font-bold text-navy-950">{primaryGoal}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Modality:</span>
                    <p className="font-bold text-navy-950">
                      {preferredFormat === "VIRTUAL" ? "Virtual (Google Meet)" : preferredFormat === "PHYSICAL" ? "Physical Learning Venue" : "Hybrid Virtual & Physical"}
                    </p>
                  </div>
                </div>

                {notes && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-slate-400 font-medium">Learning Focus Notes:</span>
                    <p className="text-slate-700 italic mt-0.5">{notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={submitting}
              className="text-xs h-9 gap-1.5 border-slate-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="text-xs h-9 bg-primary hover:bg-primary/90 text-white gap-1.5 ml-auto shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white font-bold gap-1.5 ml-auto shadow-sm"
            >
              {submitting ? (
                <span>Setting Up Your Portal...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Onboarding & Enter Portal</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
