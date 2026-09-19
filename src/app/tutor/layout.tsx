"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  BookOpen,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  DollarSign,
  CreditCard,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user ? `${user.first_name} ${user.last_name}` : "Faculty Instructor";
  const firstName = user?.first_name || "Instructor";
  const initials = user ? `${user.first_name?.[0] || "T"}${user.last_name?.[0] || "I"}` : "TC";

  // Exact 12 items specified in Section 8 of PRD
  const tutorNav = [
    { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/tutor/profile", icon: User },
    { label: "Verification", href: "/tutor/verification", icon: ShieldCheck, statusBadge: "APPROVED" },
    { label: "Classes", href: "/tutor/classes", icon: BookOpen },
    { label: "Calendar", href: "/tutor/calendar", icon: Calendar },
    { label: "Availability", href: "/tutor/availability", icon: Clock },
    { label: "Students", href: "/tutor/students", icon: Users },
    { label: "Messages", href: "/tutor/messages", icon: MessageSquare, badge: 1 },
    { label: "Earnings", href: "/tutor/earnings", icon: DollarSign },
    { label: "Payouts", href: "/tutor/payouts", icon: CreditCard },
    { label: "Notifications", href: "/tutor/notifications", icon: Bell, badge: 1 },
    { label: "Settings", href: "/tutor/settings", icon: Settings },
  ];

  const currentItem = tutorNav.find((item) => pathname.startsWith(item.href)) || { label: "Portal" };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Desktop Persistent Sidebar (250px) */}
      <aside className="hidden lg:flex flex-col w-[250px] border-r border-slate-200/80 bg-white p-4 justify-between shrink-0">
        <div className="space-y-5">
          {/* Workspace Pill */}
          <div className="p-3 bg-purple-50/60 border border-purple-100/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Workspace
              </span>
              <h2 className="text-xs font-bold text-navy-950">Instructor Portal</h2>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> Approved
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5">
            {tutorNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/tutor/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link href="/tutor/profile" className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
            <Avatar className="w-8 h-8 ring-2 ring-indigo-50">
              {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-navy-950 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">Verified Instructor</p>
            </div>
          </Link>
          <button onClick={logout} className="text-slate-400 hover:text-slate-600 p-1" title="Sign Out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Tutor</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-semibold text-navy-950">{currentItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tutor/messages"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Messages"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
            </Link>

            <Link
              href="/tutor/notifications"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <Link href="/tutor/profile" className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-navy-950 hidden sm:inline-block">{firstName}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-3 space-y-1 shadow-md">
            {tutorNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive ? "bg-primary text-white font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Workspace Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
