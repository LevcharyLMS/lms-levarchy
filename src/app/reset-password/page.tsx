"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setIsVerifying(false);
      setTokenValid(false);
      setTokenError("Missing token or email parameters. Please request a new reset link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(
            token
          )}&email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setTokenError(data.error || "This password reset link is invalid or has expired.");
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError("Failed to verify authorization token.");
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while resetting password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding & Security */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f4c81 100%)",
        }}
      >
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
            Credential Authorization
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Create Your New <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #5eead4, #818cf8)" }}
              >
                Account Password
              </span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Establish a fresh, secure password to resume access to your classes, learning resources, and educator sessions.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Minimum 8 Characters Required", dot: "bg-teal-400" },
              { label: "Encrypted Zero-Knowledge Storage", dot: "bg-indigo-400" },
              { label: "Single-Use Reset Token Invalidation", dot: "bg-purple-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-white/70 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dot}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Trust badge */}
        <div className="relative z-10">
          <div className="p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Protected Environment</p>
              <p className="text-white/50 text-[11px]">Sessions are verified with cryptographic hash algorithms.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Interactive Reset Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 bg-slate-50">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile Logo */}
          <div className="flex justify-center lg:hidden">
            <Logo imageClassName="h-9" showBadge badgeText="LMS" />
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Set new password
            </h1>
            <p className="text-sm text-slate-500">
              Enter your new credentials below to finalize account recovery.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            {isVerifying ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-xs font-medium text-slate-500">
                  Verifying reset authorization link...
                </p>
              </div>
            ) : !tokenValid ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    Invalid or Expired Link
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {tokenError ||
                      "This password reset link has expired or has already been used. Please request a new one."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/forgot-password"
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                  >
                    Request New Reset Link <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    Password Successfully Updated!
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Your password has been changed securely. You can now log into your Levchary LMS account.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                  >
                    Sign In to Account <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    Resetting for account: <strong className="text-slate-900">{email}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting}
                      className="w-full pl-9 pr-10 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting}
                      className="w-full pl-9 pr-3.5 h-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Save New Password <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
