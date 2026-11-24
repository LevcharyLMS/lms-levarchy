"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { isStudentOnboarded } from "@/lib/utils";
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
  Briefcase,
  Upload,
  FileCheck,
  LocateFixed,
  Phone,
  Building,
  Loader2,
  Check,
} from "lucide-react";

export interface GradeItem {
  id: string;
  name: string;
  level: number;
  description?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
}

export interface SubjectItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}

// Fallback grades if loading or offline
const FALLBACK_GRADES: GradeItem[] = [
  { id: "Middle School (Grades 6-8)", name: "Middle School", level: 1, description: "Grades 6 – 8" },
  { id: "High School (Grades 9-10)", name: "High School (Freshman/Sophomore)", level: 2, description: "Grades 9 – 10" },
  { id: "High School (Grades 11-12)", name: "High School (Junior/Senior)", level: 3, description: "Grades 11 – 12 • AP / Exam Prep" },
  { id: "Undergraduate / College", name: "Undergraduate / College", level: 4, description: "College & University Degree Prep" },
  { id: "Adult & Professional", name: "Adult & Continuing Education", level: 5, description: "Career Upskilling & Certifications" },
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
  {
    id: "For Professionals and Businesses",
    title: "For Professionals & Businesses",
    desc: "Workplace upskilling, corporate technical training, executive communication, and professional certifications.",
    icon: Briefcase,
  },
];

const MODALITY_OPTIONS = [
  {
    id: "VIRTUAL",
    title: "Interactive Virtual Classroom",
    desc: "Live 1-on-1 and cohort sessions via embedded video classrooms with screen sharing.",
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
  "3 – 5 hours / week (Standard)",
  "6+ hours / week (Intensive)",
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, studentProfile, refreshUser, isLoading } = useAuth();

  // Redirect guard: if user is not a student, or if already onboarded, navigate to appropriate dashboard
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== "STUDENT") {
        router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/instructor/dashboard");
        return;
      }
      if (isStudentOnboarded(studentProfile, user)) {
        router.replace("/student/dashboard");
      }
    }
  }, [user, studentProfile, isLoading, router]);

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Metadata loaded from DB / Admin settings
  const [metaLoading, setMetaLoading] = useState(true);
  const [gradesList, setGradesList] = useState<GradeItem[]>(FALLBACK_GRADES);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [subjectsList, setSubjectsList] = useState<SubjectItem[]>([]);

  // Selected Category tab in Step 2
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  // Step 1: Grade Level
  const [gradeLevel, setGradeLevel] = useState<string>("");

  // Step 2: Subjects Focus
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Step 3: Goals & Modality
  const [primaryGoal, setPrimaryGoal] = useState<string>("Exam Preparation & High Scores");
  const [preferredFormat, setPreferredFormat] = useState<"VIRTUAL" | "PHYSICAL" | "BOTH">("VIRTUAL");
  const [weeklyCommitment, setWeeklyCommitment] = useState<string>("3 – 5 hours / week (Standard)");

  // Step 4: Contact & Venue
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [country, setCountry] = useState(user?.country || "US");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [locating, setLocating] = useState(false);

  // Step 4: Student ID Upload
  const [studentIdFile, setStudentIdFile] = useState<{
    fileName: string;
    fileSize: number;
    mimeType: string;
  } | null>(null);

  // Load live admin-configured Grades, Categories, and Subjects
  useEffect(() => {
    async function loadMeta() {
      try {
        setMetaLoading(true);
        const res = await fetch("/api/student/onboarding-meta");
        if (res.ok) {
          const data = await res.json();
          if (data.grades && data.grades.length > 0) {
            setGradesList(data.grades);
          }
          if (data.categories && data.categories.length > 0) {
            setCategoriesList(data.categories);
            setActiveCategoryId(data.categories[0].id);
          }
          if (data.subjects && data.subjects.length > 0) {
            setSubjectsList(data.subjects);
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic onboarding meta, using fallbacks:", err);
      } finally {
        setMetaLoading(false);
      }
    }
    loadMeta();
  }, []);

  // Set default grade once grades are loaded
  useEffect(() => {
    if (!gradeLevel && gradesList.length > 0) {
      setGradeLevel(gradesList[0].name || gradesList[0].id);
    }
  }, [gradesList, gradeLevel]);

  // Filter subjects for the currently active Category in Step 2
  const currentCategorySubjects = subjectsList.filter(
    (s) => s.category_id === activeCategoryId && s.is_active !== false
  );

  const toggleSubject = (subjectName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  // Device Geolocation Auto-Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode using OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const detectedCity = addr.city || addr.town || addr.village || addr.suburb || "";
            const detectedState = addr.state || addr.region || "";
            const detectedCountry = addr.country_code ? addr.country_code.toUpperCase() : "US";

            if (detectedCity) setCity(detectedCity);
            if (detectedState) setState(detectedState);
            if (detectedCountry) setCountry(detectedCountry);
          }
        } catch {
          setError("Could not automatically resolve address. Please type your city and state.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setError("Location permission denied or unavailable. Please enter your address manually.");
      },
      { timeout: 8000 }
    );
  };

  // Simulated Document Upload for Student ID
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit. Please upload a smaller document.");
      return;
    }

    setStudentIdFile({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
    });
    setError(null);
  };

  // Form Validation per step
  const handleNext = () => {
    setError(null);

    if (currentStep === 1) {
      if (!gradeLevel) {
        setError("Please select your academic grade level before continuing.");
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedSubjects.length === 0) {
        setError("Please choose at least one subject area to tailor your recommendations.");
        return;
      }
    }

    if (currentStep === 4) {
      // Mandatory WhatsApp Phone validation
      const cleanedPhone = phone.trim().replace(/[\s\-\(\)]/g, "");
      if (!cleanedPhone || cleanedPhone.length < 7) {
        setError("A valid mobile phone number is required to receive WhatsApp class reminders & scheduling alerts.");
        return;
      }

      // Mandatory Address & Location check
      if (!city.trim() || !state.trim()) {
        setError("Please provide your city and state to locate compatible local instructors and learning centers.");
        return;
      }

      // Student ID file upload requirement
      if (!studentIdFile) {
        setError("Please upload your Student ID (school ID, college card, or enrollment letter) for verification.");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Submit
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/student/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          gradeLevel,
          subjects: selectedSubjects,
          primaryGoal,
          preferredFormat,
          weeklyCommitment,
          address,
          city,
          state,
          country,
          phone,
          notes,
          studentIdDocument: studentIdFile,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete onboarding.");
      }

      await refreshUser();
      router.push("/student/dashboard");
    } catch (err: any) {
      console.error("Onboarding submission failed:", err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6 w-full">
        {/* Navigation Escape for returning students */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/dashboard"
            className="text-xs text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold transition-colors"
          >
            &larr; Back to Student Dashboard
          </Link>
          <span className="text-[11px] text-slate-400">
            Signed in as {user?.email}
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Academic Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            Welcome to Levchary, {user?.first_name || "Student"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Configure your curriculum, learning pace, and verified credentials to customize your student portal.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Step {currentStep} of 5</span>
            <span className="text-primary font-bold">
              {currentStep === 1 && "Academic Grade Level"}
              {currentStep === 2 && "Categories & Subjects"}
              {currentStep === 3 && "Objectives & Modality"}
              {currentStep === 4 && "Contact & Student Verification"}
              {currentStep === 5 && "Review & Confirmation"}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-teal-700 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* Step 1: Grade Level (Direct from Admin Configuration) */}
        {currentStep === 1 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  <span>Step 1 of 5 • Grade Level</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  What is your current academic grade level?
                </h2>
                <p className="text-xs text-slate-500">
                  Admin-aligned curriculum benchmarks ensure all mentorship matches your current academic standing.
                </p>
              </div>

              {metaLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading approved academic levels...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gradesList.map((g) => {
                    const gradeKey = g.name || g.id;
                    const isSelected = gradeLevel === gradeKey;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGradeLevel(gradeKey)}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-primary bg-teal-50/50 shadow-xs ring-2 ring-primary/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-navy-950">{g.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                        {g.description && (
                          <span className="text-xs text-slate-500 mt-1">{g.description}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Two-Tier Categories & Subjects Selection */}
        {currentStep === 2 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Step 2 of 5 • Categories & Subjects</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  Select your learning category and subjects
                </h2>
                <p className="text-xs text-slate-500">
                  First choose an approved academic category, then pick the specific subject areas you need support in.
                </p>
              </div>

              {/* 1. Category Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Choose Category:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {categoriesList.map((cat) => {
                    const isActive = activeCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          isActive
                            ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Subjects inside selected Category */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Select Subjects in {categoriesList.find((c) => c.id === activeCategoryId)?.name || "Category"}:
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold">
                    {selectedSubjects.length} selected
                  </span>
                </div>

                {currentCategorySubjects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No approved subjects under this category yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentCategorySubjects.map((subj) => {
                      const isSelected = selectedSubjects.includes(subj.name);
                      return (
                        <button
                          key={subj.id}
                          type="button"
                          onClick={() => toggleSubject(subj.name)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? "border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-600"
                              : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="block truncate">{subj.name}</span>
                            {subj.description && (
                              <span className="block text-[10px] text-slate-400 font-normal truncate">
                                {subj.description}
                              </span>
                            )}
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Subjects Pill Tray */}
              {selectedSubjects.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Your Enrolled Subjects ({selectedSubjects.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubjects.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-semibold"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => toggleSubject(s)}
                          className="hover:text-red-600 text-xs font-bold leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Goals & Modality (With "For Professionals and Businesses") */}
        {currentStep === 3 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>Step 3 of 5 • Primary Objective</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  What is your primary learning goal & delivery preference?
                </h2>
                <p className="text-xs text-slate-500">
                  Tailors instructional roadmaps for academic mastery or professional workplace acceleration.
                </p>
              </div>

              {/* Primary Objective Options */}
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
                            ? "border-primary bg-teal-50/50 shadow-xs ring-1 ring-primary"
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
                          ? "border-primary bg-teal-50 font-bold text-primary"
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

        {/* Step 4: Contact, Geolocation, WhatsApp Mandate & Student ID Upload */}
        {currentStep === 4 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>Step 4 of 5 • Contact & Verification</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  Residential Location, WhatsApp & Student ID
                </h2>
                <p className="text-xs text-slate-500">
                  Mandatory contact details ensure you receive instant WhatsApp scheduling alerts, and Student ID confirms eligibility.
                </p>
              </div>

              {/* Geolocation Trigger */}
              <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LocateFixed className="w-4 h-4 text-teal-700 shrink-0" />
                  <p className="text-xs text-teal-900 font-medium">
                    Auto-suggest your location from your current device?
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="h-8 text-xs border-teal-300 bg-white hover:bg-teal-50 text-teal-800 font-semibold shrink-0"
                >
                  {locating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Detect Location"
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Street Address (Optional)
                  </label>
                  <Input
                    placeholder="e.g. 123 Academic Way, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Boston, Seattle, Austin"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    State / Region <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. MA, WA, TX"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                {/* Mandatory WhatsApp Mobile Number */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Phone Number <span className="text-red-500">*</span></span>
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      WhatsApp Alerts Enabled
                    </span>
                  </div>
                  <Input
                    placeholder="+1 (555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Mandatory for receiving real-time WhatsApp reminders when instructors start classes or confirm schedules.
                  </p>
                </div>

                {/* Mandatory Student ID File Upload */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Student ID Document <span className="text-red-500">*</span></span>
                    </label>
                    <span className="text-[10px] text-slate-400">Max 10MB (PDF, PNG, JPG)</span>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-xl p-5 text-center transition-colors bg-slate-50/50">
                    {studentIdFile ? (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-teal-200 shadow-xs">
                        <div className="flex items-center gap-2.5 text-left min-w-0">
                          <FileCheck className="w-5 h-5 text-teal-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-navy-950 truncate">
                              {studentIdFile.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {(studentIdFile.fileSize / 1024).toFixed(1)} KB • Uploaded for review
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStudentIdFile(null)}
                          className="text-xs text-red-600 hover:underline font-semibold ml-2 shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-2">
                        <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="font-bold text-teal-700 hover:underline">Click to upload Student ID</span> or drag and drop
                        </div>
                        <p className="text-[10px] text-slate-400">
                          School ID card, university badge, or enrollment confirmation letter
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="sm:col-span-2 space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-700">Specific Academic Focus or Needs (Optional)</label>
                  <Textarea
                    placeholder="e.g. Preparing for collegiate calculus competitions and differential equation finals..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-xs min-h-[70px]"
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
                  <span>Step 5 of 5 • Final Review</span>
                </div>
                <h2 className="text-lg font-bold text-navy-950">
                  Review Your Academic Profile & Credentials
                </h2>
                <p className="text-xs text-slate-500">
                  Confirm your curriculum, contact preferences, and uploaded Student ID verification before entering your portal.
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
                    <span className="text-slate-400 font-medium">Academic Grade Level:</span>
                    <p className="font-bold text-teal-800">{gradeLevel}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Location:</span>
                    <p className="font-bold text-navy-950">{city}, {state} ({country})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">WhatsApp Number:</span>
                    <p className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{phone}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Student ID Status:</span>
                    <p className="font-bold text-teal-800 flex items-center gap-1 mt-0.5">
                      <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>{studentIdFile?.fileName || "Document Attached"}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Enrolled Subjects:</span>
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
                      {preferredFormat === "VIRTUAL" ? "Virtual (Interactive Classroom)" : preferredFormat === "PHYSICAL" ? "Physical Learning Venue" : "Hybrid Virtual & Physical"}
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
