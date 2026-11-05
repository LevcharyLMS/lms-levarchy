"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
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
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide navbar on full-page auth screens and logged-in dashboard / classroom workspaces
  const PORTAL_OR_AUTH_PREFIXES = [
    "/login",
    "/register",
    "/tutor/application",
    "/student",
    "/tutor",
    "/admin",
    "/classroom",
  ];
  if (PORTAL_OR_AUTH_PREFIXES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo showBadge badgeText="LMS" imageClassName="h-9" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/find-tutors"
            className={`transition-colors hover:text-teal-600 ${
              pathname === "/find-tutors" ? "text-teal-600 font-semibold" : ""
            }`}
          >
            Find Instructors
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
            Become an Instructor
          </Link>
        </nav>

        {/* Portal Shortcuts & Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs">
                <Link
                  href={
                    user.role === "STUDENT"
                      ? "/student/dashboard"
                      : user.role === "TUTOR"
                      ? "/tutor/dashboard"
                      : "/admin/dashboard"
                  }
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{user.first_name}&apos;s Portal</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-xs border-slate-200 text-slate-600 hover:text-slate-900"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
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
              Find Instructors
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
              Become an Instructor
            </Link>
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
