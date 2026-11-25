"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { db } from "@/lib/data-store";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  CreditCard,
  ShieldAlert,
  Bell,
  Megaphone,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Search,
  Shield,
  ExternalLink,
  Tag,
  ArrowRight
} from "lucide-react";

export interface HubTabItem {
  label: string;
  href: string;
  description?: string;
  badge?: string | number;
}

export interface NavHubConfig {
  label: string;
  href: string;
  icon: any;
  subRoutes: string[];
  description: string;
  badge?: string | number;
  tabs: HubTabItem[];
}

export interface NavGroupConfig {
  groupTitle: string;
  hubs: NavHubConfig[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Badge counters for dynamic hubs
  const [pendingFlagsCount, setPendingFlagsCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const updateCounters = () => {
      const flags = db.state.message_flags.filter((f) => f.status === "PENDING_REVIEW").length;
      setPendingFlagsCount(flags);

      if (user?.id) {
        const unread = db.state.notifications.filter(
          (n) => n.user_id === user.id && !n.is_read
        ).length;
        setUnreadNotifications(unread);
      }
    };

    updateCounters();
    const interval = setInterval(updateCounters, 5000);
    return () => clearInterval(interval);
  }, [user?.id, pathname]);

  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Comprehensive 9-Hub Architecture with all underlying tabs defined
  const navHubs: NavGroupConfig[] = useMemo(() => [
    {
      groupTitle: "CORE HUBS",
      hubs: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          subRoutes: ["/admin/dashboard"],
          description: "KPIs & Operations Command",
          tabs: [
            { label: "Executive Overview", href: "/admin/dashboard", description: "Marketplace performance and KPI radar" }
          ],
        },
        {
          label: "Classes & Bookings",
          href: "/admin/classes",
          icon: Calendar,
          subRoutes: ["/admin/classes", "/admin/locations", "/admin/bookings"],
          description: "Classes, Physical Venues & Bookings",
          tabs: [
            { label: "Classes & Approvals", href: "/admin/classes", description: "Review and publish live tutor class listings" },
            { label: "Physical Venues", href: "/admin/locations", description: "Offline venues, classroom capacities, and facilities" },
            { label: "Bookings Ledger", href: "/admin/bookings", description: "Audit individual and group cohort class enrollments" }
          ],
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
          tabs: [
            { label: "Categories", href: "/admin/categories", description: "Academic disciplines and educational domains" },
            { label: "Subjects", href: "/admin/subjects", description: "Course taxonomy and study subjects" },
            { label: "Grades", href: "/admin/grades", description: "Student targeting brackets and school tiers" },
            { label: "Assignment Oversight", href: "/admin/assignments", description: "Review post-class assignments and student submissions" },
            { label: "Curriculum Suggestions", href: "/admin/suggestions", description: "Proposals from instructors for new subjects/grades" },
            { label: "Post-Class Reports", href: "/admin/post-class-reports", description: "Teacher session feedback and attendance validation" }
          ],
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
            "/admin/verifications",
          ],
          description: "Students, Faculty & Approvals",
          tabs: [
            { label: "All Users", href: "/admin/users", description: "Global user directory and RBAC access controls" },
            { label: "Students", href: "/admin/students", description: "Enrolled learners, grade levels, and guardian contacts" },
            { label: "Instructors", href: "/admin/instructors", description: "Active faculty, taught subjects, and teaching authority" },
            { label: "Applications", href: "/admin/instructor-applications", description: "Prospective tutor onboarding submissions" },
            { label: "Verifications", href: "/admin/verifications", description: "ID & academic credential document inspection" }
          ],
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
          tabs: [
            { label: "Payments", href: "/admin/payments", description: "Payment gateway status and transaction logs" },
            { label: "Transactions", href: "/admin/transactions", description: "Itemized revenue and tuition records" },
            { label: "Payouts", href: "/admin/payouts", description: "Instructor earnings disbursement tracking" },
            { label: "Refunds", href: "/admin/refunds", description: "Student cancellation and refund processing" },
            { label: "Commissions", href: "/admin/commissions", description: "Platform rake and commission splits" },
            { label: "Pricing Rules", href: "/admin/pricing", description: "Marketplace price floors, caps, and surge rules" }
          ],
        },
        {
          label: "Moderation Queue",
          href: "/admin/flags",
          icon: ShieldAlert,
          subRoutes: ["/admin/flags", "/admin/reviews", "/admin/reports"],
          badge: pendingFlagsCount > 0 ? pendingFlagsCount : undefined,
          description: "Rule 19 Flags & Approvals",
          tabs: [
            { label: "Safety Flags", href: "/admin/flags", description: "Automated off-platform contact and fraud detection" },
            { label: "Review Approvals", href: "/admin/reviews", description: "Student feedback ratings and publication audits" },
            { label: "Reports", href: "/admin/reports", description: "Sanitized CSV data exports and system audits" }
          ],
        },
        {
          label: "Communications",
          href: "/admin/messages",
          icon: Bell,
          subRoutes: ["/admin/messages", "/admin/notifications", "/admin/support"],
          badge: unreadNotifications > 0 ? unreadNotifications : undefined,
          description: "Announcements & Support Tickets",
          tabs: [
            { label: "Broadcasts", href: "/admin/messages", description: "Platform-wide email and announcement center" },
            { label: "Notifications", href: "/admin/notifications", description: "Automated event alerts and system triggers" },
            { label: "Support Tickets", href: "/admin/support", description: "User dispute resolution and inquiry tickets" }
          ],
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
          subRoutes: ["/admin/adverts", "/admin/analytics"],
          description: "Adverts & Marketplace Intelligence",
          tabs: [
            { label: "Adverts", href: "/admin/adverts", description: "Hero banners, spotlight tutors, and promotions" },
            { label: "Marketplace Analytics", href: "/admin/analytics", description: "Traffic, funnel conversion, and search queries" }
          ],
        },
        {
          label: "Settings & Audit",
          href: "/admin/settings",
          icon: Settings,
          subRoutes: ["/admin/settings", "/admin/audit-logs"],
          description: "Rules, Logs & Platform Config",
          tabs: [
            { label: "Platform Settings", href: "/admin/settings", description: "System configuration, brand tokens, and maintenance" },
            { label: "Audit Logs", href: "/admin/audit-logs", description: "Immutable chronological admin security trail" }
          ],
        },
      ],
    },
  ], [pendingFlagsCount, unreadNotifications]);

  // Active Hub determination
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

  // Active Tab determination within current hub
  const activeTab = useMemo(() => {
    if (!activeHub) return null;
    return activeHub.tabs.find((t) => pathname === t.href || pathname.startsWith(t.href + "/"));
  }, [pathname, activeHub]);

  // Dual search: Search across both Hubs and their Underlying Tabs
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { matchingHubs: [], matchingTabs: [] };
    const q = searchQuery.toLowerCase().trim();

    const matchingHubs: { hub: NavHubConfig; groupTitle: string }[] = [];
    const matchingTabs: { tab: HubTabItem; parentHub: NavHubConfig; groupTitle: string }[] = [];

    navHubs.forEach((g) => {
      g.hubs.forEach((hub) => {
        const hubMatches =
          hub.label.toLowerCase().includes(q) ||
          hub.description.toLowerCase().includes(q);

        if (hubMatches) {
          matchingHubs.push({ hub, groupTitle: g.groupTitle });
        }

        hub.tabs.forEach((tab) => {
          const tabMatches =
            tab.label.toLowerCase().includes(q) ||
            (tab.description && tab.description.toLowerCase().includes(q));

          if (tabMatches) {
            matchingTabs.push({ tab, parentHub: hub, groupTitle: g.groupTitle });
          }
        });
      });
    });

    return { matchingHubs, matchingTabs };
  }, [searchQuery, navHubs]);

  // Filtered sidebar hubs list (when query is typed)
  const filteredNavGroups = useMemo(() => {
    if (!searchQuery.trim()) return navHubs;
    const q = searchQuery.toLowerCase().trim();
    return navHubs
      .map((g) => ({
        ...g,
        hubs: g.hubs.filter(
          (h) =>
            h.label.toLowerCase().includes(q) ||
            h.description.toLowerCase().includes(q) ||
            h.tabs.some((t) => t.label.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.hubs.length > 0);
  }, [searchQuery, navHubs]);

  const handleSelectSearchResult = (href: string) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    router.push(href);
  };

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

          {/* Quick Hub & Tab Unified Search Input */}
          <div ref={searchContainerRef} className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hubs and tabs..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full h-8 pl-8 pr-7 text-[11px] bg-slate-50 border border-slate-200/90 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchFocused(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Live Instant Search Dropdown (Hubs + Underlying Tabs) */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {/* Hub Matches */}
                {searchResults.matchingHubs.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                      Main Hubs ({searchResults.matchingHubs.length})
                    </span>
                    {searchResults.matchingHubs.map(({ hub }) => {
                      const Icon = hub.icon;
                      return (
                        <button
                          key={hub.href}
                          onClick={() => handleSelectSearchResult(hub.href)}
                          className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-teal-50/80 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="font-semibold text-navy-950 truncate">{hub.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 group-hover:text-teal-700 flex items-center gap-0.5">
                            Hub <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tab Matches */}
                {searchResults.matchingTabs.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                      Underlying Tabs ({searchResults.matchingTabs.length})
                    </span>
                    {searchResults.matchingTabs.map(({ tab, parentHub }) => (
                      <button
                        key={tab.href}
                        onClick={() => handleSelectSearchResult(tab.href)}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-start justify-between group transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-medium text-slate-800 group-hover:text-navy-950 flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-purple-600 shrink-0" />
                            <span className="truncate">{tab.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate pl-4.5">
                            in {parentHub.label} • {tab.description}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-purple-700 shrink-0 mt-0.5 flex items-center gap-0.5">
                          Open <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.matchingHubs.length === 0 && searchResults.matchingTabs.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-[11px]">
                    No hubs or tabs match "{searchQuery}"
                  </div>
                )}
              </div>
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
                            ? "bg-teal-700 text-white shadow-xs font-semibold"
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

        {/* Bottom Profile & Session */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-navy-950 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.first_name?.[0] || "A"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-navy-950 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Admin Console</span>
            <span className="font-mono">v2.4.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-200/80 bg-white px-4 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400">Hubs</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-navy-950">
                {activeHub?.label || "Admin Console"}
              </span>
              {activeTab && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    {activeTab.label}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>View Live Marketplace</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
