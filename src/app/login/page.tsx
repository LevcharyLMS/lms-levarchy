"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Shield, User, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Dynamic role routing
    if (email.includes("admin")) {
      router.push("/admin/dashboard");
    } else if (email.includes("tutor")) {
      router.push("/tutor/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  };

  const handleQuickDemoLogin = (role: "STUDENT" | "TUTOR" | "ADMIN") => {
    if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (role === "TUTOR") {
      router.push("/tutor/dashboard");
    } else {
      router.push("/student/dashboard");
    }
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
            Welcome to Levchary LMS
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your verified classes, schedule, and messages.
          </p>
        </div>

        {/* Quick Demo Switcher Card */}
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Instant Role Access (Development / Testing)</span>
          </div>
          <p className="text-[11px] text-teal-800 leading-normal">
            Click any role to test its dedicated portal, RBAC access, and full features immediately:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin("STUDENT")}
              className="px-2 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-semibold text-xs hover:bg-teal-100 transition-colors shadow-xs"
            >
              🎓 Student
            </button>
            <button
              onClick={() => handleQuickDemoLogin("TUTOR")}
              className="px-2 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-semibold text-xs hover:bg-teal-100 transition-colors shadow-xs"
            >
              👨‍🏫 Tutor
            </button>
            <button
              onClick={() => handleQuickDemoLogin("ADMIN")}
              className="px-2 py-1.5 rounded-lg bg-white border border-teal-200 text-purple-900 font-semibold text-xs hover:bg-purple-50 transition-colors shadow-xs"
            >
              🛡️ Admin
            </button>
          </div>
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
                className="w-full font-semibold"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In with Email"}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don&apos;t have an account yet?{" "}
                <Link href="/register" className="text-teal-600 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
