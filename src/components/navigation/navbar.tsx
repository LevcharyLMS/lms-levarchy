"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Menu,
  X,
  Shield,
  BookOpen,
  UserCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Calendar,
  MessageSquare,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<"STUDENT" | "TUTOR" | "ADMIN" | "GUEST">("GUEST");
  const pathname = usePathname();

  // Infer active portal from pathname
  const isAdmin = pathname.startsWith("/admin");
  const isTutor = pathname.startsWith("/tutor");
  const isStudent = pathname.startsWith("/student");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-navy-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-navy-950 flex items-center gap-1.5">
              LEVCHARY
              <span className="text-[10px] uppercase font-bold tracking-widest bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200/50">
                LMS
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium -mt-1">
              Verified Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/find-tutors"
            className={`transition-colors hover:text-teal-600 ${
              pathname === "/find-tutors" ? "text-teal-600 font-semibold" : ""
            }`}
          >
            Find Tutors
          </Link>
          <Link
            href="/classes"
            className={`transition-colors hover:text-teal-600 ${
              pathname === "/classes" ? "text-teal-600 font-semibold" : ""
            }`}
          >
            Explore Classes
          </Link>
          <Link
            href="/how-it-works"
            className={`transition-colors hover:text-teal-600 ${
              pathname === "/how-it-works" ? "text-teal-600 font-semibold" : ""
            }`}
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            className={`transition-colors hover:text-teal-600 ${
              pathname === "/pricing" ? "text-teal-600 font-semibold" : ""
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/become-a-tutor"
            className={`transition-colors hover:text-teal-600 ${
              pathname === "/become-a-tutor" ? "text-teal-600 font-semibold" : ""
            }`}
          >
            Become a Tutor
          </Link>
        </nav>

        {/* Portal Shortcuts & Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Quick Demo Role Navigation Bar */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <Link
              href="/student/dashboard"
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                isStudent ? "bg-white text-navy-950 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Student Portal
            </Link>
            <Link
              href="/tutor/dashboard"
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                isTutor ? "bg-white text-navy-950 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tutor Portal
            </Link>
            <Link
              href="/admin/dashboard"
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                isAdmin ? "bg-white text-purple-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shield className="w-3 h-3 text-purple-600" />
              Admin
            </Link>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 shadow-lg animate-accordion-down">
          <div className="flex flex-col space-y-2 pt-2">
            <Link
              href="/find-tutors"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Find Tutors
            </Link>
            <Link
              href="/classes"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore Classes
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Pricing
            </Link>
            <Link
              href="/become-a-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Become a Tutor
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Portals (Quick Access)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
              >
                Student
              </Link>
              <Link
                href="/tutor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-2 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium"
              >
                Tutor
              </Link>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            </Button>
            <Button asChild variant="default" className="w-full">
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
