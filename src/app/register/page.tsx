"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/ui/logo";
import {
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  User,
  Mail,
  Lock,
  Sparkles,
} from "lucide-react";

const ROLE_OPTIONS = [
  {
    id: "STUDENT" as const,
    label: "I'm a Student",
    desc: "Find vetted tutors, book sessions & track progress",
    icon: GraduationCap,
    gradient: "from-blue-500 to-indigo-600",
    ring: "ring-indigo-500",
    badge: "bg-indigo-100 text-indigo-700",
    perks: ["Browse 100+ verified tutors", "Book live virtual classrooms", "Personalized study roadmap"],
  },
  {
    id: "TUTOR" as const,
    label: "I'm a Tutor",
    desc: "Teach students, manage your schedule & earn",
    icon: BookOpen,
    gradient: "from-teal-500 to-emerald-600",
    ring: "ring-teal-500",
    badge: "bg-teal-100 text-teal-700",
    perks: ["Set your own rates & availability", "Credential verification badge", "Earnings dashboard & payouts"],
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<"STUDENT" | "TUTOR">("STUDENT");
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][strength];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await register({ firstName, lastName, email, password, role });

    if (!result.success) {
      setError(result.error || "Failed to create account. Please try again.");
      setLoading(false);
      return;
    }

    if ((result as any).requiresVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      return;
    }

    if (role === "STUDENT") {
      router.push("/student/onboarding");
    } else {
      router.push("/tutor/application");
    }
  };

  const selectedRole = ROLE_OPTIONS.find((r) => r.id === role)!;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f4c81 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #14b8a6, transparent)", animation: "pulse 4s ease-in-out infinite 1s" }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10">
          <Logo variant="dark" imageClassName="h-9" showBadge badgeText="LMS" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Join thousands of learners & educators
          </div>

          {/* Dynamic role info */}
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              {role === "STUDENT" ? "Accelerate Your" : "Share Your"}{" "}
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: role === "STUDENT" ? "linear-gradient(90deg, #5eead4, #818cf8)" : "linear-gradient(90deg, #5eead4, #34d399)" }}>
                {role === "STUDENT" ? "Academic Growth" : "Expertise"}
              </span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {role === "STUDENT"
                ? "Get matched with verified educators tailored to your grade level, subjects, and learning goals."
                : "Apply to join our verified tutor network — set your rates, manage your schedule, and teach students who need you."}
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-2.5">
            {selectedRole.perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2.5 text-white/70 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="relative z-10 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <p className="text-white/50 text-[11px] leading-relaxed">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-300 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-slate-50">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <Logo imageClassName="h-9" showBadge badgeText="LMS" />
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="text-sm text-slate-500">
              Already registered?{" "}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = role === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setRole(opt.id); setError(null); }}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                    isActive
                      ? "border-indigo-500 bg-white shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-2.5 right-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    </span>
                  )}
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${opt.gradient} flex items-center justify-center mb-2.5`}>
                    <Icon className="w-4.5 h-4.5 text-white w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step progress */}
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-all ${
                  step >= s ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {s === 1 ? "Your Name" : "Credentials"}
                </span>
                {s < 2 && <div className={`flex-1 h-px ${step > 1 ? "bg-indigo-400" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full pl-8 pr-3 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-3 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="jane.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-9 pr-10 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-slate-200"}`} />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500">Password strength: <span className="font-semibold">{strengthLabel}</span></p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-10 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-red-500">Passwords do not match</p>
                  )}
                </div>

                {/* Info */}
                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  role === "TUTOR"
                    ? "bg-teal-50 border-teal-200 text-teal-800"
                    : "bg-indigo-50 border-indigo-200 text-indigo-800"
                }`}>
                  {role === "TUTOR" ? (
                    <><strong>Tutor Verification:</strong> After registration, you&apos;ll submit your credentials and government ID for review by our compliance team (24h turnaround).</>
                  ) : (
                    <><CheckCircle2 className="inline w-3.5 h-3.5 mr-1 text-indigo-500" /><strong>Student Onboarding:</strong> You&apos;ll complete a 5-step questionnaire to personalize your learning experience.</>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button type="button" onClick={() => setStep(1)}
                    className="h-10 px-4 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all">
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-10 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                      boxShadow: loading ? "none" : "0 4px 14px rgba(99,102,241,0.4)"
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        {role === "TUTOR" ? "Register & Apply" : "Register & Start Onboarding"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400">
            By registering, you agree to the{" "}
            <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
