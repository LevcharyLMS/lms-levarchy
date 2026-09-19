"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, AlertCircle, KeyRound, ChevronDown, ChevronUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);

    if (!result.success || !result.user) {
      setError(result.error || "Invalid email or password. Please verify your credentials.");
      setLoading(false);
      return;
    }

    const user = result.user;
    const studentProfile = result.studentProfile;

    // Role-based routing with onboarding check
    if (user.role === "STUDENT") {
      const isOnboarded = (studentProfile?.preferences as any)?.onboarding_completed;
      if (!isOnboarded) {
        router.push("/student/onboarding");
      } else {
        router.push("/student/dashboard");
      }
    } else if (user.role === "TUTOR") {
      router.push("/tutor/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
  };

  const fillCredentials = (fillEmail: string) => {
    setEmail(fillEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow">
              <GraduationCap className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Sign In to Levchary LMS
          </h1>
          <p className="text-xs text-slate-500">
            Access your verified classes, schedules, and learning materials.
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-teal-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full font-semibold bg-teal-600 hover:bg-teal-700 text-white"
                disabled={loading}
              >
                {loading ? "Verifying Credentials..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don&apos;t have an account yet?{" "}
                <Link href="/register" className="text-teal-600 font-semibold hover:underline">
                  Create a student or tutor account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Developer / Seed Accounts Quick Helper (Collapsible) */}
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            className="w-full px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Seeded Accounts for Testing</span>
            </span>
            {showDemoCredentials ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showDemoCredentials && (
            <div className="p-4 border-t border-slate-100 space-y-2 text-xs">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Click any account to populate credentials, or use your newly registered account:
              </p>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => fillCredentials("student@levchary.local")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 flex items-center justify-between text-[11px] transition-colors"
                >
                  <span className="font-semibold text-slate-700">🎓 Student: student@levchary.local</span>
                  <span className="text-slate-400">Use</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("marcus.chen@tutor.levchary.local")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 flex items-center justify-between text-[11px] transition-colors"
                >
                  <span className="font-semibold text-slate-700">👨‍🏫 Tutor: marcus.chen@tutor.levchary.local</span>
                  <span className="text-slate-400">Use</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("admin@levchary.local")}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 flex items-center justify-between text-[11px] transition-colors"
                >
                  <span className="font-semibold text-slate-700">🛡️ Admin: admin@levchary.local</span>
                  <span className="text-slate-400">Use</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
