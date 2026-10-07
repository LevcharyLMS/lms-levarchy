"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import {
  Mail,
  MailCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (!token || !email) return;

    let isMounted = true;

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });

        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Verification failed. The link may have expired.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage("Network error while verifying email. Please try again.");
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, email]);

  // Auto-redirect on success
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, router]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendStatus(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus("A fresh verification link has been dispatched to your inbox!");
      } else {
        setErrorMessage(data.error || "Failed to resend verification email.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #0d9488, transparent)" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="flex justify-center">
          <Logo imageClassName="h-9" showBadge badgeText="LMS" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm text-center space-y-6">
          {/* STATE 1: Verifying */}
          {status === "verifying" && (
            <div className="space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto ring-8 ring-indigo-50/50">
                <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Verifying Your Email...</h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Please wait while we confirm your email token with our secure authentication servers.
              </p>
            </div>
          )}

          {/* STATE 2: Success */}
          {status === "success" && (
            <div className="space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold text-slate-800">Email Verified Successfully!</h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your account is now activated. You have full access to Levchary tutors and classes.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                Redirecting to Sign In in <span className="font-bold">{countdown}</span> seconds...
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full h-10 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #0d9488, #0f766e)",
                    boxShadow: "0 4px 14px rgba(13,148,136,0.35)",
                  }}
                >
                  Proceed to Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* STATE 3: Error */}
          {status === "error" && (
            <div className="space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold text-slate-800">Verification Link Invalid</h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {errorMessage || "The verification link may have expired or is invalid."}
                </p>
              </div>

              {resendStatus && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium">
                  {resendStatus}
                </div>
              )}

              <div className="pt-2 space-y-2">
                {email && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full h-10 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                    }}
                  >
                    {resending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending New Link...
                      </>
                    ) : (
                      "Request New Verification Link"
                    )}
                  </button>
                )}

                <Link
                  href="/login"
                  className="w-full h-10 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STATE 4: Idle / Check your inbox (directly after signup) */}
          {status === "idle" && (
            <div className="space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto ring-8 ring-teal-50/50">
                <Mail className="w-8 h-8 text-teal-600" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold text-slate-800">Check Your Inbox</h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We sent a confirmation link to:
                </p>
                {email ? (
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                    {email}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">your registered email address</span>
                )}
                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  Click the link inside to verify your account and activate your Levchary profile.
                </p>
              </div>

              {resendStatus && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium">
                  {resendStatus}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2 space-y-2.5">
                {email && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full h-10 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                  >
                    {resending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Dispatching...
                      </>
                    ) : (
                      "Didn't get the email? Resend link"
                    )}
                  </button>
                )}

                <Link
                  href="/login"
                  className="w-full h-10 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #0d9488, #0f766e)",
                    boxShadow: "0 4px 14px rgba(13,148,136,0.35)",
                  }}
                >
                  Proceed to Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Powered by Brevo Secure Email Delivery
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
