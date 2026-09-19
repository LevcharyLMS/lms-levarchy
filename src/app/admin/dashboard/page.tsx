import React from "react";
import Link from "next/link";
import { SupabaseDbService } from "@/lib/supabase-db";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Users,
  ShieldCheck,
  BookOpen,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldAlert,
  Clock,
  ArrowRight,
  FileCheck,
  Inbox,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await SupabaseDbService.getAdminKPIs();
  const bookings = await SupabaseDbService.getBookings();
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Operations Command Center
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              Marketplace Authority
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time financial ledgers, compliance verification queue, and automated scheduling controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200">
            <Link href="/admin/reports">Export CSV</Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white">
            <Link href="/admin/classes">Manage Classes</Link>
          </Button>
        </div>
      </div>

      {/* Critical Alert Bar for Pending Items */}
      {(stats.pendingVerifications > 0 || stats.pendingFlagsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {stats.pendingVerifications > 0 && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  {stats.pendingVerifications}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-950">Verification Documents Pending</h3>
                  <p className="text-[11px] text-amber-800">Review government IDs and degree transcripts</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="h-7 text-xs border-amber-300 hover:bg-amber-100 bg-white">
                <Link href="/admin/verifications">Inspect</Link>
              </Button>
            </div>
          )}

          {stats.pendingFlagsCount > 0 && (
            <div className="p-3.5 bg-red-50/80 border border-red-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-900 flex items-center justify-center font-bold text-xs">
                  {stats.pendingFlagsCount}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-950">Flagged Messages Requiring Action</h3>
                  <p className="text-[11px] text-red-800">Off-platform payment / phone number alerts</p>
                </div>
              </div>
              <Button asChild size="sm" variant="destructive" className="h-7 text-xs">
                <Link href="/admin/flags">Review</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Primary Financial & Operational KPIs */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Overview (Real Database Aggregations)
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Live PostgreSQL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            title="Gross Marketplace Volume"
            value={<MoneyDisplay cents={stats.grossRevenueCents} />}
            subtitle={stats.grossRevenueCents > 0 ? "Locked transaction snapshots" : "No payments processed yet"}
            icon={DollarSign}
            variant="indigo"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            subtitle={stats.totalBookings > 0 ? `${stats.completedClasses} completed sessions` : "No bookings recorded"}
            icon={BookOpen}
            variant="teal"
          />
          <StatCard
            title="Enrolled Students"
            value={stats.totalStudents}
            subtitle="Verified student profiles"
            icon={Users}
            variant="purple"
          />
          <StatCard
            title="Verified Faculty"
            value={stats.approvedTutors}
            subtitle={`Out of ${stats.totalTutors} registered tutors`}
            icon={ShieldCheck}
            variant="emerald"
          />
        </div>
      </div>

      {/* Secondary Financial Breakdown Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Platform Commission (20%)</span>
          <div className="text-xl font-bold text-navy-950">
            <MoneyDisplay cents={stats.platformCommissionCents} />
          </div>
          <p className="text-[11px] text-slate-500">Company revenue after tutor payouts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Tutor Earnings Allocated</span>
          <div className="text-xl font-bold text-navy-950">
            <MoneyDisplay cents={stats.tutorEarningsCents} />
          </div>
          <p className="text-[11px] text-slate-500">Stripe Connect 80% instructor shares</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Active Published Classes</span>
          <div className="text-xl font-bold text-navy-950">
            {stats.activeClasses}
          </div>
          <p className="text-[11px] text-slate-500">Available across virtual & physical venues</p>
        </div>
      </div>

      {/* Recent Activity & Administrative Actions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Ledger */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-navy-950">Recent Marketplace Bookings</h3>
              <p className="text-xs text-slate-500">Latest reservations and locked financial records</p>
            </div>
            <Link href="/admin/bookings" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No bookings recorded yet"
              description="Once students reserve 1-on-1 sessions or enroll in group classes, their locked records will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentBookings.map((b: any) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-navy-950">{b.booking_number}</span>
                      <StatusBadge status={b.status} />
                      <StatusBadge status={b.format} />
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{b.class_item?.title || "Class Session"}</p>
                    <p className="text-[11px] text-slate-500">
                      Student: {b.student?.first_name} {b.student?.last_name} • Tutor: {b.tutor?.first_name} {b.tutor?.last_name}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {b.financial_snapshot && (
                      <div className="font-bold text-navy-950">
                        <MoneyDisplay cents={b.financial_snapshot.gross_amount} />
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Net: ${((b.financial_snapshot?.tutor_earnings || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Administrative Shortcuts Box */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-navy-950">Administrative Actions</h3>
            <p className="text-xs text-slate-500">Fast access to compliance and controls</p>
          </div>

          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-between text-xs h-9 border-slate-200">
              <Link href="/admin/verifications" className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Review Documents</span>
                </span>
                {stats.pendingVerifications > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                    {stats.pendingVerifications}
                  </span>
                )}
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-between text-xs h-9 border-slate-200">
              <Link href="/admin/flags" className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Message Flags</span>
                </span>
                {stats.pendingFlagsCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-800">
                    {stats.pendingFlagsCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start text-xs h-9 border-slate-200">
              <Link href="/admin/commissions" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Adjust Commission Tier</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start text-xs h-9 border-slate-200">
              <Link href="/admin/audit-logs" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>System Audit Trail</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start text-xs h-9 border-slate-200">
              <Link href="/admin/locations" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Manage Physical Venues</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
