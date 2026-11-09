"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/ui/logo";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  DollarSign,
  FileText,
  Upload,
  ShieldCheck,
  Sparkles,
  Video,
  MapPin,
  Laptop,
  Clock,
  User,
  Mail,
} from "lucide-react";

const SUBJECTS = [
  "Mathematics", "Calculus & Advanced Math", "Physics", "Chemistry",
  "Biology", "Computer Science", "English Literature", "History",
  "SAT / ACT Prep", "AP Courses", "Economics", "World Languages",
];

const FORMATS = [
  { id: "VIRTUAL", label: "Virtual Only", desc: "Live sessions via Jitsi classroom", icon: Video },
  { id: "PHYSICAL", label: "In-Person Only", desc: "At verified learning centers", icon: MapPin },
  { id: "BOTH", label: "Hybrid", desc: "Flexible virtual & in-person", icon: Laptop },
];

const STEPS = [
  { id: 1, label: "Professional Info", icon: User },
  { id: 2, label: "Subjects & Format", icon: BookOpen },
  { id: 3, label: "Rates & Schedule", icon: DollarSign },
  { id: 4, label: "Documents", icon: Upload },
  { id: 5, label: "Review & Submit", icon: ShieldCheck },
];

export default function TutorApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [experienceYears, setExperienceYears] = useState("3");

  // Step 2
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [format, setFormat] = useState<"VIRTUAL" | "PHYSICAL" | "BOTH">("VIRTUAL");

  // Step 3
  const [hourlyRate, setHourlyRate] = useState("60");
  const [hoursPerWeek, setHoursPerWeek] = useState("10");

  // Step 4
  const [idDocument, setIdDocument] = useState("");
  const [degreeDocument, setDegreeDocument] = useState("");

  const toggleSubject = (s: string) =>
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const handleNext = () => {
    setError(null);
    if (step === 1 && (!headline.trim() || !bio.trim() || !qualifications.trim())) {
      setError("Please fill in all required fields.");
      return;
    }
    if (step === 2 && selectedSubjects.length === 0) {
      setError("Please select at least one subject you can teach.");
      return;
    }
    if (step === 4 && (!idDocument.trim() || !degreeDocument.trim())) {
      setError("Please provide both document references before submitting.");
      return;
    }
    if (step < 5) setStep((s) => s + 1 as any);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/instructors/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          headline,
          bio,
          qualifications,
          experienceYears: parseInt(experienceYears),
          subjects: selectedSubjects,
          preferredFormat: format,
          hourlyRate: parseFloat(hourlyRate),
          hoursPerWeek: parseInt(hoursPerWeek),
          idDocument,
          degreeDocument,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit application. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Application Submitted!</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your credentials and application have been placed in our{" "}
              <strong className="text-slate-700">Admin Verification Queue</strong>. Our compliance team
              reviews all applications within <strong className="text-slate-700">24 hours</strong>.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left space-y-3">
            {[
              { label: "Application Status", value: "PENDING_REVIEW", color: "text-amber-600 bg-amber-50 border-amber-200" },
              { label: "Review Timeline", value: "Within 24 hours", color: "text-blue-600 bg-blue-50 border-blue-200" },
              { label: "Notification", value: "Email upon decision", color: "text-green-600 bg-green-50 border-green-200" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{item.label}</span>
                <span className={`px-2.5 py-1 rounded-full font-semibold border ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/instructor/dashboard")}
            className="w-full h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}
          >
            Go to Tutor Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo imageClassName="h-8" showBadge badgeText="LMS" />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" />
              Verified Educator Application
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Join as a Verified Tutor</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Complete all 5 steps to submit your application for admin credential review.
            </p>
          </div>
        </div>

        {/* Step progress */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between relative">
            {/* connector line */}
            <div className="absolute left-0 right-0 top-4 h-px bg-slate-100 mx-8" />
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isDone = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="relative flex flex-col items-center gap-1.5 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 ${
                    isDone
                      ? "bg-teal-600 border-indigo-600"
                      : isActive
                      ? "bg-white border-indigo-500"
                      : "bg-white border-slate-200"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight ${isActive ? "text-teal-600" : isDone ? "text-slate-600" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%`, background: "linear-gradient(90deg, #4f46e5, #6366f1)" }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wide">
              <User className="w-4 h-4" />
              Step 1 — Professional Info
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Professional Headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford M.S. Computer Science — AP Calculus & Physics Specialist"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Verified Degrees & Credentials <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D. Applied Mathematics (MIT), B.S. Physics (Caltech)"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full px-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Teaching Experience (Years)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Educator Biography & Teaching Philosophy <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Detail your instructional approach, areas of expertise, and exam preparation methodologies..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wide">
              <BookOpen className="w-4 h-4" />
              Step 2 — Subjects & Format
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Subjects You Can Teach <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map((subj) => {
                  const sel = selectedSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => toggleSubject(subj)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                        sel
                          ? "border-teal-500 bg-teal-50 text-teal-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span>{subj}</span>
                      {sel ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">Preferred Teaching Format</label>
              <div className="grid grid-cols-3 gap-2.5">
                {FORMATS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id as any)}
                      className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                        format === f.id
                          ? "border-indigo-500 bg-teal-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${format === f.id ? "text-teal-600" : "text-slate-400"}`} />
                      <p className="text-xs font-bold text-slate-800">{f.label}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{f.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wide">
              <DollarSign className="w-4 h-4" />
              Step 3 — Rates & Availability
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Hourly Rate (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    min={25}
                    max={500}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full pl-7 pr-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Minimum $25/hr · Platform takes 20%</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Hours Available Per Week
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    className="w-full pl-8 pr-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Earnings preview */}
            <div className="p-4 rounded-xl border border-teal-100 bg-teal-50 space-y-2">
              <p className="text-xs font-bold text-teal-800">Estimated Monthly Earnings</p>
              <div className="flex items-center justify-between text-xs text-teal-700">
                <span>Gross (${hourlyRate}/hr × {hoursPerWeek}hrs/wk × 4)</span>
                <span className="font-bold">${(parseFloat(hourlyRate || "0") * parseInt(hoursPerWeek || "0") * 4).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-teal-700">
                <span>After 20% platform fee</span>
                <span className="font-bold text-green-700">${(parseFloat(hourlyRate || "0") * parseInt(hoursPerWeek || "0") * 4 * 0.8).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wide">
              <Upload className="w-4 h-4" />
              Step 4 — Verification Documents
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
              <strong>Why we need these:</strong> Levchary verifies all tutors&apos; degrees and identity to ensure student safety and quality assurance. Documents are stored securely in private compliance storage.
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Government-Issued Photo ID Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. passport_john_doe.pdf · Driver's License or Passport"
                  value={idDocument}
                  onChange={(e) => setIdDocument(e.target.value)}
                  className="w-full px-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                />
                <p className="text-[11px] text-slate-400">Accepted: PDF, JPG, PNG — Max 10MB</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Degree Transcript / Diploma Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. mit_math_phd_transcript_2019.pdf"
                  value={degreeDocument}
                  onChange={(e) => setDegreeDocument(e.target.value)}
                  className="w-full px-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                />
                <p className="text-[11px] text-slate-400">Official university transcript or diploma scan</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              Step 5 — Review & Submit
            </div>

            <div className="space-y-3 text-xs">
              {/* Applicant info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-600 uppercase tracking-wide text-[11px]">Applicant</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{user?.first_name} {user?.last_name}</p>
                    <p className="text-slate-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <p className="font-bold text-slate-600 uppercase tracking-wide text-[11px]">Professional Details</p>
                <div><span className="text-slate-400">Headline:</span> <span className="font-semibold text-slate-800">{headline}</span></div>
                <div><span className="text-slate-400">Credentials:</span> <span className="font-semibold text-slate-800">{qualifications}</span></div>
                <div><span className="text-slate-400">Experience:</span> <span className="font-semibold text-slate-800">{experienceYears} years</span></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <p className="font-bold text-slate-600 uppercase tracking-wide text-[11px]">Teaching Preferences</p>
                <div>
                  <span className="text-slate-400">Subjects:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSubjects.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold text-[11px]">{s}</span>
                    ))}
                  </div>
                </div>
                <div><span className="text-slate-400">Format:</span> <span className="font-semibold text-slate-800">{format}</span></div>
                <div><span className="text-slate-400">Rate:</span> <span className="font-semibold text-slate-800">${hourlyRate}/hr</span></div>
                <div><span className="text-slate-400">Availability:</span> <span className="font-semibold text-slate-800">{hoursPerWeek} hrs/week</span></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <p className="font-bold text-slate-600 uppercase tracking-wide text-[11px]">Documents Submitted</p>
                <div><span className="text-slate-400">Photo ID:</span> <span className="font-semibold text-slate-800">{idDocument}</span></div>
                <div><span className="text-slate-400">Degree:</span> <span className="font-semibold text-slate-800">{degreeDocument}</span></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 leading-relaxed">
              <ShieldCheck className="inline w-3.5 h-3.5 mr-1" />
              By submitting, you confirm all provided information and documents are authentic. False submissions result in permanent account suspension.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => { setError(null); setStep((s) => s - 1 as any); }}
              className="flex items-center gap-1.5 h-10 px-5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-bold text-white transition-all ml-auto"
              style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-bold text-white transition-all ml-auto disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: submitting ? "none" : "0 4px 14px rgba(16,185,129,0.4)" }}
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
