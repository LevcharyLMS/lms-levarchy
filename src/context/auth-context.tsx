"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, StudentProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile; studentProfile?: StudentProfile }>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "STUDENT" | "TUTOR";
  }) => Promise<{ success: boolean; error?: string; user?: UserProfile; studentProfile?: StudentProfile }>;
  logout: () => Promise<void>;
  updateStudentProfile: (data: any) => Promise<boolean>;
  completeOnboarding: (data: any) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from /api/auth/me and fallback to localStorage cache
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setStudentProfile(data.studentProfile || null);
          try {
            localStorage.setItem("levchary_user", JSON.stringify(data.user));
            if (data.studentProfile) {
              localStorage.setItem("levchary_student_profile", JSON.stringify(data.studentProfile));
            }
          } catch {}
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch current user session:", err);
    }

    // If fetch failed or returned null user, check localStorage cache
    try {
      const cached = localStorage.getItem("levchary_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        const cachedStudent = localStorage.getItem("levchary_student_profile");
        if (cachedStudent) setStudentProfile(JSON.parse(cachedStudent));
        return;
      }
    } catch {}

    setUser(null);
    setStudentProfile(null);
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Authentication failed." };
      }

      setUser(data.user);
      setStudentProfile(data.studentProfile || null);

      try {
        localStorage.setItem("levchary_user", JSON.stringify(data.user));
        if (data.studentProfile) {
          localStorage.setItem("levchary_student_profile", JSON.stringify(data.studentProfile));
        }
      } catch {}

      return { success: true, user: data.user, studentProfile: data.studentProfile };
    } catch (err: any) {
      return { success: false, error: err?.message || "Network error. Please try again." };
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "STUDENT" | "TUTOR";
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to create account." };
      }

      setUser(resData.user);
      setStudentProfile(resData.studentProfile || null);

      try {
        localStorage.setItem("levchary_user", JSON.stringify(resData.user));
        if (resData.studentProfile) {
          localStorage.setItem("levchary_student_profile", JSON.stringify(resData.studentProfile));
        }
      } catch {}

      return { success: true, user: resData.user, studentProfile: resData.studentProfile };
    } catch (err: any) {
      return { success: false, error: err?.message || "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}

    setUser(null);
    setStudentProfile(null);
    try {
      localStorage.removeItem("levchary_user");
      localStorage.removeItem("levchary_student_profile");
    } catch {}

    router.push("/login");
  };

  const updateStudentProfile = async (updates: any): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...updates }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("levchary_user", JSON.stringify(data.user));
        }
        if (data.studentProfile) {
          setStudentProfile(data.studentProfile);
          localStorage.setItem("levchary_student_profile", JSON.stringify(data.studentProfile));
        }
        return true;
      }
    } catch (err) {
      console.error("Failed to update student profile:", err);
    }
    return false;
  };

  const completeOnboarding = async (onboardingData: any): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch("/api/student/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...onboardingData }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("levchary_user", JSON.stringify(data.user));
        }
        if (data.studentProfile) {
          setStudentProfile(data.studentProfile);
          localStorage.setItem("levchary_student_profile", JSON.stringify(data.studentProfile));
        }
        return true;
      }
    } catch (err) {
      console.error("Failed to complete student onboarding:", err);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateStudentProfile,
        completeOnboarding,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
