"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Search,
  Calendar,
  BookOpen,
  MessageSquare,
  CreditCard,
  Star,
  Bell,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user ? `${user.first_name} ${user.last_name}` : "Student Account";
  const firstName = user?.first_name || "Student";
  const initials = user ? `${user.first_name?.[0] || "S"}${user.last_name?.[0] || "T"}` : "ST";

  // Exact 11 items specified in Section 8 of PRD
  const studentNav = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Find Tutors", href: "/student/tutors", icon: Users },
    { label: "Classes", href: "/student/classes", icon: Search },
    { label: "Bookings", href: "/student/bookings", icon: Calendar },
    { label: "Calendar", href: "/student/calendar", icon: BookOpen },
    { label: "Messages", href: "/student/messages", icon: MessageSquare, badge: 1 },
    { label: "Payments", href: "/student/payments", icon: CreditCard },
    { label: "Reviews", href: "/student/reviews", icon: Star },
    { label: "Notifications", href: "/student/notifications", icon: Bell, badge: 2 },
    { label: "Profile", href: "/student/profile", icon: User },
    { label: "Settings", href: "/student/settings", icon: Settings },
  ];

  // Derive breadcrumb title
  const currentItem = studentNav.find((item) => pathname.startsWith(item.href)) || { label: "Portal" };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Desktop Persistent Sidebar (250px) */}
      <aside className="hidden lg:flex flex-col w-[250px] border-r border-slate-200/80 bg-white p-4 justify-between shrink-0">
        <div className="space-y-5">
          {/* Workspace Pill */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Workspace
              </span>
              <h2 className="text-xs font-bold text-navy-950">Student Portal</h2>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5">
            {studentNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/student/dashboard" && pathname.startsWith(item.href));
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
          <Link href="/student/profile" className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
            <Avatar className="w-8 h-8 ring-2 ring-indigo-50">
              {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-navy-950 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">Student Account</p>
            </div>
          </Link>
          <button onClick={logout} className="text-slate-400 hover:text-slate-600 p-1" title="Sign Out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Breadcrumb, Search & User Menu) */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Student</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-semibold text-navy-950">{currentItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/messages"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Messages"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
            </Link>

            <Link
              href="/student/notifications"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <Link href="/student/profile" className="flex items-center gap-2">
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
            {studentNav.map((item) => {
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
