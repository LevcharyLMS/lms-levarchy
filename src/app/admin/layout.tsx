"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  ShieldAlert,
  Bell,
  Megaphone,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Shield,
  Search,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingFlagsCount, setPendingFlagsCount] = useState(0);

  const displayName = user ? `${user.first_name} ${user.last_name}` : "Platform Administrator";
  const firstName = user?.first_name || "Administrator";
  const initials = user ? `${user.first_name?.[0] || "A"}${user.last_name?.[0] || "D"}` : "AD";

  // Real-time unread notifications and pending flags polling
  useEffect(() => {
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

    fetch(`/api/admin/flag-words`)
      .then((res) => res.json())
      .then((data) => {
        if (data.flags && Array.isArray(data.flags)) {
          setPendingFlagsCount(data.flags.filter((f: any) => f.status === "PENDING" || !f.status).length);
        }
      })
      .catch(() => {});
  }, [user?.id, pathname]);

  // Modern 9-Hub Consolidation Architecture (Option B)
  const navHubs = [
    {
      groupTitle: "CORE HUBS",
      hubs: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          subRoutes: ["/admin/dashboard"],
          description: "KPIs & Operations Command",
        },
        {
          label: "Classes & Bookings",
          href: "/admin/classes",
          icon: Calendar,
          subRoutes: [
            "/admin/classes",
            "/admin/locations",
            "/admin/bookings",
          ],
          description: "Classes, Physical Venues & Bookings",
        },
        {
          label: "Academics",
          href: "/admin/categories",
          icon: BookOpen,
          subRoutes: [
            "/admin/categories",
            "/admin/subjects",
            "/admin/grades",
            "/admin/assignments",
            "/admin/suggestions",
            "/admin/post-class-reports",
          ],
          description: "Curriculum, Subjects & Syllabus",
        },
        {
          label: "People & Accounts",
          href: "/admin/users",
          icon: Users,
          subRoutes: [
            "/admin/users",
            "/admin/students",
            "/admin/instructors",
            "/admin/instructor-applications",
            "/admin/tutor-applications",
            "/admin/tutors",
            "/admin/verifications",
          ],
          description: "Students, Faculty & Approvals",
        },
      ],
    },
    {
      groupTitle: "FINANCES & INTEGRITY",
      hubs: [
        {
          label: "Financials",
          href: "/admin/payments",
          icon: CreditCard,
          subRoutes: [
            "/admin/payments",
            "/admin/transactions",
            "/admin/payouts",
            "/admin/refunds",
            "/admin/commissions",
            "/admin/pricing",
          ],
          description: "Ledgers, Payouts & Commissions",
        },
        {
          label: "Moderation Queue",
          href: "/admin/flags",
          icon: ShieldAlert,
          subRoutes: [
            "/admin/flags",
            "/admin/reviews",
            "/admin/reports",
          ],
          badge: pendingFlagsCount > 0 ? pendingFlagsCount : undefined,
          description: "Rule 19 Flags & Approvals",
        },
        {
          label: "Communications",
          href: "/admin/messages",
          icon: Bell,
          subRoutes: [
            "/admin/messages",
            "/admin/notifications",
            "/admin/support",
          ],
          badge: unreadNotifications > 0 ? unreadNotifications : undefined,
          description: "Announcements & Support Tickets",
        },
      ],
    },
    {
      groupTitle: "GROWTH & PLATFORM",
      hubs: [
        {
          label: "Marketing",
          href: "/admin/adverts",
          icon: Megaphone,
          subRoutes: [
            "/admin/adverts",
            "/admin/analytics",
          ],
          description: "Adverts & Marketplace Intelligence",
        },
        {
          label: "Settings & Audit",
          href: "/admin/settings",
          icon: Settings,
          subRoutes: [
            "/admin/settings",
            "/admin/audit-logs",
          ],
          description: "Rules, Logs & Platform Config",
        },
      ],
    },
  ];

  // Active Hub and Sub-Item Label Determination
  const activeHub = useMemo(() => {
    for (const g of navHubs) {
      for (const hub of g.hubs) {
        if (
          pathname === hub.href ||
          hub.subRoutes.some(
            (sr) => pathname === sr || (sr !== "/admin/dashboard" && pathname.startsWith(sr + "/"))
          )
        ) {
          return hub;
        }
      }
    }
    return null;
  }, [pathname, navHubs]);

  // Filtered hubs based on quick-search input
  const filteredNavGroups = useMemo(() => {
    if (!searchQuery.trim()) return navHubs;
    const q = searchQuery.toLowerCase();
    return navHubs
      .map((g) => ({
        ...g,
        hubs: g.hubs.filter(
          (h) =>
            h.label.toLowerCase().includes(q) ||
            h.description.toLowerCase().includes(q) ||
            h.subRoutes.some((sr) => sr.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.hubs.length > 0);
  }, [searchQuery, navHubs]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Persistent Admin Sidebar (260px) */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-slate-200/80 bg-white justify-between shrink-0 h-screen sticky top-0">
        {/* Top Header & Search Area */}
        <div className="p-4 space-y-3.5 overflow-hidden flex flex-col flex-1">
          {/* Workspace Pill */}
          <div className="p-3 bg-teal-50/70 border border-teal-100/80 rounded-xl flex items-center justify-between shrink-0">
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

          {/* Quick Hub Filter Input */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Quick search hubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-2.5 text-[11px] bg-slate-50 border border-slate-200/90 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-primary focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 9 Consolidated Navigation Hubs */}
          <div className="overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredNavGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.groupTitle}
                </p>
                <div className="space-y-0.5">
                  {group.hubs.map((hub) => {
                    const Icon = hub.icon;
                    const isActive =
                      activeHub?.href === hub.href ||
                      hub.subRoutes.some(
                        (sr) => pathname === sr || (sr !== "/admin/dashboard" && pathname.startsWith(sr + "/"))
                      );

                    return (
                      <Link
                        key={hub.href}
                        href={hub.href}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-xs font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? "text-white" : "text-slate-400"
                            }`}
                          />
                          <span className="truncate">{hub.label}</span>
                        </div>
                        {hub.badge && !isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 shrink-0">
                            {hub.badge}
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
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-7 h-7 ring-2 ring-teal-50 shrink-0">
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
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
            title="Sign Out"
          >
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
              <span className="font-medium text-slate-400">Admin Hub</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-semibold text-navy-950">
                {activeHub?.label || "Operations"}
              </span>
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
                {/* Drawer Header */}
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

                {/* Mobile Hub Navigation */}
                <div className="space-y-4">
                  {navHubs.map((group) => (
                    <div key={group.groupTitle} className="space-y-1">
                      <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {group.groupTitle}
                      </p>
                      <div className="space-y-0.5">
                        {group.hubs.map((hub) => {
                          const Icon = hub.icon;
                          const isActive =
                            activeHub?.href === hub.href ||
                            hub.subRoutes.some(
                              (sr) => pathname === sr || (sr !== "/admin/dashboard" && pathname.startsWith(sr + "/"))
                            );

                          return (
                            <Link
                              key={hub.href}
                              href={hub.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                                isActive
                                  ? "bg-primary text-white shadow-xs font-semibold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon
                                  className={`w-4 h-4 ${
                                    isActive ? "text-white" : "text-slate-400"
                                  }`}
                                />
                                <span>{hub.label}</span>
                              </div>
                              {hub.badge && !isActive && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                  {hub.badge}
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
