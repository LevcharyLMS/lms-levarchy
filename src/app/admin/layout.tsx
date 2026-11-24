"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  FileCheck,
  ShieldCheck,
  BookOpen,
  Tag,
  BookMarked,
  Layers,
  MapPin,
  Calendar,
  CreditCard,
  Receipt,
  RotateCcw,
  DollarSign,
  Percent,
  Calculator,
  MessageSquare,
  ShieldAlert,
  Star,
  Bell,
  LifeBuoy,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Shield,
  Megaphone,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingFlagsCount, setPendingFlagsCount] = useState(0);

  const displayName = user ? `${user.first_name} ${user.last_name}` : "Platform Administrator";
  const firstName = user?.first_name || "Administrator";
  const initials = user ? `${user.first_name?.[0] || "A"}${user.last_name?.[0] || "D"}` : "AD";

  // Real-time unread notifications and pending flags polling
  useEffect(() => {
    // 1. Fetch unread notifications for admin
    if (user?.id) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const notifs = data.notifications || [];
          const unread = notifs.filter((n: any) => !n.is_read).length;
          setUnreadNotifications(unread);
        })
        .catch(() => {});
    }

    // 2. Fetch pending moderation flags count
    fetch(`/api/admin/flag-words`)
      .then((res) => res.json())
      .then((data) => {
        if (data.flags && Array.isArray(data.flags)) {
          setPendingFlagsCount(data.flags.filter((f: any) => f.status === "PENDING" || !f.status).length);
        }
      })
      .catch(() => {});
  }, [user?.id, pathname]);

  // Complete 27 Admin Items Grouped Logically (Section 8 of PRD)
  const navGroups = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Reports", href: "/admin/reports", icon: FileSpreadsheet },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
      ],
    },
    {
      title: "USERS & VERIFICATION",
      items: [
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Students", href: "/admin/students", icon: GraduationCap },
        { label: "Instructors", href: "/admin/instructors", icon: UserCheck },
        { label: "Instructor Applications", href: "/admin/instructor-applications", icon: FileCheck },
        { label: "Verification", href: "/admin/verifications", icon: ShieldCheck, badge: "1" },
      ],
    },
    {
      title: "ACADEMICS & VENUES",
      items: [
        { label: "Classes", href: "/admin/classes", icon: BookOpen },
        { label: "Categories", href: "/admin/categories", icon: Tag },
        { label: "Subjects", href: "/admin/subjects", icon: BookMarked },
        { label: "Grades", href: "/admin/grades", icon: Layers },
        { label: "Locations", href: "/admin/locations", icon: MapPin },
      ],
    },
    {
      title: "OPERATIONS & FINANCIALS",
      items: [
        { label: "Bookings", href: "/admin/bookings", icon: Calendar },
        { label: "Adverts", href: "/admin/adverts", icon: Megaphone },
        { label: "Payments", href: "/admin/payments", icon: CreditCard },
        { label: "Transactions", href: "/admin/transactions", icon: Receipt },
        { label: "Refunds", href: "/admin/refunds", icon: RotateCcw },
        { label: "Payouts", href: "/admin/payouts", icon: DollarSign },
        { label: "Commissions", href: "/admin/commissions", icon: Percent },
        { label: "Pricing", href: "/admin/pricing", icon: Calculator },
      ],
    },
    {
      title: "MODERATION & SUPPORT",
      items: [
        { label: "Assignments", href: "/admin/assignments", icon: FileCheck },
        { label: "Messages", href: "/admin/messages", icon: MessageSquare },
        { label: "Flags", href: "/admin/flags", icon: ShieldAlert, badge: "1" },
        { label: "Reviews", href: "/admin/reviews", icon: Star },
        { label: "Notifications", href: "/admin/notifications", icon: Bell },
        { label: "Support", href: "/admin/support", icon: LifeBuoy },
        { label: "Suggestions", href: "/admin/suggestions", icon: Sparkles },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  // Find current label
  let activeLabel = "Control Center";
  for (const g of navGroups) {
    const found = g.items.find((i) => pathname === i.href || (i.href !== "/admin/dashboard" && pathname.startsWith(i.href)));
    if (found) {
      activeLabel = found.label;
      break;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Persistent Admin Sidebar (260px) */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-slate-200/80 bg-white justify-between shrink-0 h-screen sticky top-0">
        {/* Scrollable Nav Area */}
        <div className="p-4 overflow-y-auto space-y-5">
          {/* Workspace Pill */}
          <div className="p-3 bg-teal-50/70 border border-teal-100/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Authority
                </span>
                <h2 className="text-xs font-bold text-navy-950">Company Admin</h2>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          </div>

          {/* Grouped Navigation */}
          <div className="space-y-4">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-xs font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && !isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin User Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-7 h-7 ring-2 ring-teal-50">
              {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-navy-950 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">Platform Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-slate-600 p-1" title="Sign Out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Admin</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-semibold text-navy-950">{activeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/flags"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors relative"
              title="Moderation Flags"
            >
              <ShieldAlert className="w-4 h-4" />
              {pendingFlagsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </Link>

            <Link
              href="/admin/notifications"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
              )}
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <Link href="/admin/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="w-7 h-7 ring-2 ring-teal-50">
                {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-navy-950 hidden sm:inline-block">{firstName}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer with Backdrop */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-out drawer container */}
            <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-300">
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Drawer Header matching desktop sidebar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex-1 p-2.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                        Admin Workspace
                      </span>
                      <h2 className="text-xs font-bold text-white">Levchary Operations</h2>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-500/20 text-teal-300 rounded-full">
                      Root
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                    title="Close navigation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Nav Groups */}
                <div className="space-y-4">
                  {navGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                      <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {group.title}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                                isActive
                                  ? "bg-primary text-white shadow-xs font-semibold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon
                                  className={`w-3.5 h-3.5 ${
                                    isActive ? "text-white" : "text-slate-400"
                                  }`}
                                />
                                <span>{item.label}</span>
                              </div>
                              {item.badge && !isActive && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-8 h-8 ring-2 ring-teal-50">
                    {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-950 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">Platform Administrator</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
