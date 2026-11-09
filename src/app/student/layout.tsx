"use client";

import React, { useState, useEffect } from "react";
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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const displayName = user ? `${user.first_name} ${user.last_name}` : "Student Account";
  const firstName = user?.first_name || "Student";
  const initials = user ? `${user.first_name?.[0] || "S"}${user.last_name?.[0] || "T"}` : "ST";

  // Fetch real unread counts for messages and notifications
  useEffect(() => {
    if (!user?.id) return;

    // 1. Check real messages
    fetch(`/api/messages?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const convs = data.conversations || [];
        const totalUnread = convs.reduce((acc: number, c: any) => acc + (c.unread_count || 0), 0);
        setUnreadMessages(totalUnread);
      })
      .catch(() => {});

    // 2. Check real notifications
    fetch(`/api/notifications?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const notifs = data.notifications || [];
        const unreadCount = notifs.filter((n: any) => !n.is_read).length;
        setUnreadNotifications(unreadCount);
      })
      .catch(() => {});
  }, [user?.id, pathname]);

  // Student Navigation Items in exact requested sequence
  const studentNav = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Find Instructors", href: "/student/instructors", icon: Users },
    { label: "Classes", href: "/student/classes", icon: Search },
    { label: "Bookings", href: "/student/bookings", icon: Calendar },
    { label: "Payments", href: "/student/payments", icon: CreditCard },
    { label: "Calendar", href: "/student/calendar", icon: BookOpen },
    {
      label: "Messages",
      href: "/student/messages",
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      label: "Notifications",
      href: "/student/notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    { label: "Reviews", href: "/student/reviews", icon: Star },
    { label: "Settings", href: "/student/settings", icon: Settings },
  ];

  // Derive breadcrumb title
  const currentItem = studentNav.find((item) => pathname.startsWith(item.href)) || { label: "Portal" };

  // When on onboarding, render focused full-screen wizard without sidebar or headers
  if (pathname === "/student/onboarding") {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Persistent Sidebar (250px) */}
      <aside className="hidden lg:flex flex-col w-[250px] border-r border-slate-200/80 bg-white p-4 justify-between shrink-0 h-screen sticky top-0">
        <div className="space-y-5">
          {/* Workspace Pill */}
          <div className="p-3 bg-teal-50/70 border border-teal-100/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
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
                      ? "bg-teal-600 text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-700">
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
          <Link href="/student/settings" className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
            <Avatar className="w-8 h-8 ring-2 ring-teal-50">
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
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
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
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-500" />
              )}
            </Link>

            <Link
              href="/student/notifications"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <Link href="/student/settings" className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-navy-950 hidden sm:inline-block">{firstName}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Slide-Over Drawer with Backdrop */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-out drawer container */}
            <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-300">
              <div className="space-y-5">
                {/* Workspace Pill inside drawer matching desktop */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 p-3 bg-teal-50/70 border border-teal-100/80 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                        Workspace
                      </span>
                      <h2 className="text-xs font-bold text-navy-950">Student Portal</h2>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                    title="Close navigation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="space-y-0.5">
                  {studentNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/student/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-teal-600 text-white shadow-xs font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && !isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-700">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/student/settings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="w-8 h-8 ring-2 ring-teal-50">
                    {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-950 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">Student Account</p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
