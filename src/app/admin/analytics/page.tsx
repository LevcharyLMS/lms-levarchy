import React from "react";
import { SupabaseDbService } from "@/lib/supabase-db";
import { StatCard } from "@/components/ui/stat-card";
import { MoneyDisplay } from "@/components/ui/money-display";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Video,
  MapPin,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  let stats: any = {};
  let bookings: any[] = [];

  try {
    stats = await SupabaseDbService.getAdminKPIs();
  } catch (err) {
    console.error("Error fetching admin KPIs:", err);
  }

  try {
    bookings = await SupabaseDbService.getBookings();
  } catch (err) {
    console.error("Error fetching bookings for analytics:", err);
  }

  // Class format breakdown — derived from real booking records
  const virtualCount = bookings.filter((b) => b.format === "VIRTUAL").length;
  const physicalCount = bookings.filter((b) => b.format === "PHYSICAL").length;
  const totalCount = bookings.length || 1;
  const virtualPct = Math.round((virtualCount / totalCount) * 100);
  const physicalPct = 100 - virtualPct;

  // Real fill rate: completed / total bookings (never hardcoded)
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const fillRatePct =
    bookings.length > 0 ? Math.round((completedCount / bookings.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Marketplace Intelligence & Growth Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time aggregations calculated from authoritative Supabase database records.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={<MoneyDisplay cents={stats.grossRevenueCents ?? 0} />}
          subtitle="Total marketplace settlement"
          icon={DollarSign}
        />
        <StatCard
          title="Platform Commission"
          value={<MoneyDisplay cents={stats.platformCommissionCents ?? 0} />}
          subtitle="Net platform margin"
          icon={TrendingUp}
          variant="teal"
        />
        <StatCard
          title="Completion Rate"
          value={bookings.length > 0 ? `${fillRatePct}%` : "—"}
          subtitle={bookings.length > 0 ? "Completed vs total bookings" : "No bookings yet"}
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Active Classes"
          value={stats.activeClasses ?? 0}
          subtitle="Published & open enrolment"
          icon={BookOpen}
          variant="indigo"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings Status Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-navy-950">Booking Volume by Status</h2>
              <p className="text-xs text-slate-500">Live breakdown of all marketplace booking records</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
              {bookings.length} total
            </span>
          </div>

          {bookings.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No booking data yet"
              description="Booking analytics will populate here once students start booking classes."
            />
          ) : (
            <div className="space-y-3">
              {(["CONFIRMED", "COMPLETED", "PENDING", "CANCELLED", "REFUNDED"] as const).map((status) => {
                const count = bookings.filter((b) => b.status === status).length;
                const pct = Math.round((count / bookings.length) * 100);
                const colorMap: Record<string, string> = {
                  CONFIRMED: "bg-teal-500",
                  COMPLETED: "bg-emerald-600",
                  PENDING: "bg-amber-400",
                  CANCELLED: "bg-red-400",
                  REFUNDED: "bg-slate-400",
                };
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span className="capitalize">{status.toLowerCase()}</span>
                      <span className="text-slate-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`${colorMap[status]} h-full rounded-full transition-all`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Format Distribution (Virtual vs Physical) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-sm text-navy-950">Format Distribution</h2>
              <span className="text-xs text-slate-400">Class share</span>
            </div>

            {bookings.length === 0 ? (
              <p className="text-xs text-slate-400 mt-6 text-center">No booking data yet.</p>
            ) : (
              <div className="mt-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5 text-navy-950">
                      <Video className="w-3.5 h-3.5 text-teal-600" /> Virtual
                    </span>
                    <span>
                      {virtualPct}% ({virtualCount} sessions)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div style={{ width: `${virtualPct}%` }} className="bg-teal-600 h-full rounded-full" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5 text-navy-950">
                      <MapPin className="w-3.5 h-3.5 text-purple-700" /> Physical
                    </span>
                    <span>
                      {physicalPct}% ({physicalCount} sessions)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div style={{ width: `${physicalPct}%` }} className="bg-purple-700 h-full rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-lg font-bold text-navy-950">{stats.totalStudents ?? 0}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                <Users className="w-3 h-3" /> Students
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-lg font-bold text-navy-950">{stats.approvedTutors ?? 0}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Active Tutors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
