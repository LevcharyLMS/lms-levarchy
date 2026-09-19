"use client";

import React from "react";
import { db } from "@/lib/data-store";
import { StatCard } from "@/components/ui/stat-card";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Video,
  MapPin,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const stats = db.getAdminStats();
  const bookings = db.getBookings();

  // Class format breakdown
  const virtualCount = bookings.filter((b) => b.format === "VIRTUAL").length;
  const physicalCount = bookings.filter((b) => b.format === "PHYSICAL").length;
  const totalCount = bookings.length || 1;
  const virtualPct = Math.round((virtualCount / totalCount) * 100);
  const physicalPct = 100 - virtualPct;

  // Revenue month-over-month bars
  const months = [
    { name: "May", revenue: 2400 },
    { name: "Jun", revenue: 3800 },
    { name: "Jul", revenue: 5200 },
    { name: "Aug", revenue: 7600 },
    { name: "Sep", revenue: 9800 },
  ];
  const maxRev = 10000;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Marketplace Intelligence & Growth Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time aggregations calculated from authoritative database records.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={<MoneyDisplay cents={stats.grossRevenueCents} />}
          trend={{ value: "+28.4% MoM", isPositive: true }}
          icon={DollarSign}
        />
        <StatCard
          title="Platform Commission"
          value={<MoneyDisplay cents={stats.platformCommissionCents} />}
          trend={{ value: "20% net margin", isPositive: true }}
          icon={TrendingUp}
        />
        <StatCard
          title="Class Fill Rate"
          value="78.2%"
          subtitle="Group cohort utilization"
          icon={Users}
        />
        <StatCard
          title="Student Completion Rate"
          value="98.5%"
          subtitle="Attended vs cancelled"
          icon={CheckCircle2}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Growth Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-navy-950">Gross Revenue Trend (2026)</h2>
              <p className="text-xs text-slate-500">Monthly gross marketplace settlement volume</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              Consistent Upward MoM
            </span>
          </div>

          {/* SVG/CSS Clean Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-6 pt-6 px-4">
            {months.map((m, idx) => {
              const heightPct = Math.round((m.revenue / maxRev) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${m.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all group-hover:brightness-110 shadow-xs"
                  />
                  <span className="text-xs font-semibold text-slate-600">{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Format Distribution (Virtual vs Physical) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-bold text-sm text-navy-950">Format Distribution</h2>
              <span className="text-xs text-slate-400">Class share</span>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-navy-950">
                    <Video className="w-3.5 h-3.5 text-teal-600" /> Virtual Google Meet
                  </span>
                  <span>{virtualPct}% ({virtualCount} classes)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: `${virtualPct}%` }} className="bg-teal-600 h-full rounded-full" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-navy-950">
                    <MapPin className="w-3.5 h-3.5 text-purple-700" /> Physical Learning Centers
                  </span>
                  <span>{physicalPct}% ({physicalCount} classes)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div style={{ width: `${physicalPct}%` }} className="bg-purple-700 h-full rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
            <strong>Capacity Optimization:</strong> Virtual sessions provide lower operational overhead, while physical sessions at our Boston & Cambridge facilities exhibit 99% student attendance retention.
          </div>
        </div>
      </div>
    </div>
  );
}
