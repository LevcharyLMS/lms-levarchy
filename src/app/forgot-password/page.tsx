"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process password reset request");
      }

      setSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding & Security Trust */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f4c81 100%)",
        }}
      >
        {/* Animated ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{
              background: "radial-gradient(circle, #14b8a6, transparent)",
              animation: "pulse 4s ease-in-out infinite 1s",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 blur-2xl"
            style={{
              background: "radial-gradient(circle, #a855f7, transparent)",
              animation: "pulse 5s ease-in-out infinite 2s",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Logo variant="dark" imageClassName="h-9" showBadge badgeText="LMS" />
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm">
            <KeyRound className="w-3.5 h-3.5 text-teal-300" />
            Account Security & Recovery
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Safeguard Your <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #5eead4, #818cf8)" }}
              >
                Learning Access
              </span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Reset your credentials securely with encrypted one-time verification tokens sent directly to your registered email.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-2.5">
            {[
              { label: "Encrypted 1-Hour Expiration Tokens", dot: "bg-teal-400" },
              { label: "Anti-Enumeration Email Security", dot: "bg-indigo-400" },
              { label: "Instant Transactional Delivery via Brevo", dot: "bg-purple-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-white/70 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dot}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Security Badge */}
        <div className="relative z-10">
          <div className="p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Strict Privacy Assurance</p>
              <p className="text-white/50 text-[11px]">No credentials or passwords are ever exposed in plain text.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Interactive Recovery Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-slate-50">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile Logo */}
          <div className="flex justify-center lg:hidden">
            <Logo imageClassName="h-9" showBadge badgeText="LMS" />
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reset your password
            </h1>
            <p className="text-sm text-slate-500">
              Remembered your credentials?{" "}
              <Link href="/login" className="text-teal-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            {sent ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    Reset Instructions Sent
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    If an account matches <strong>{email}</strong>, a secure link has been sent to your inbox. Please check your promotions or spam folder if it doesn&apos;t appear shortly.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                  >
                    Return to Sign In <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                    className="w-full text-xs text-slate-500 hover:text-slate-800 py-2 transition-colors font-medium"
                  >
                    Send to a different email address
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-9 pr-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Enter the email associated with your student or instructor account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Instructions...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
