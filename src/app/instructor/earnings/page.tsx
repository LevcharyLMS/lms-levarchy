"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { MoneyDisplay } from "@/components/ui/money-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable, Column } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Lock,
  Eye,
  Receipt,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function TutorEarningsPage() {
  const { user } = useAuth();
  const tutorId = user?.id;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings?tutorId=${tutorId}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Failed to load earnings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tutorId]);

  const totalGrossCents = bookings.reduce(
    (sum, b) => sum + (b.financial_snapshot?.gross_amount || 0),
    0
  );
  const totalPlatformDeductionsCents = bookings.reduce(
    (sum, b) => sum + (b.financial_snapshot?.platform_fee_amount || 0),
    0
  );
  const totalNetEarningsCents = bookings.reduce(
    (sum, b) => sum + (b.financial_snapshot?.tutor_earnings || 0),
    0
  );

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const num = (b.booking_number || "").toLowerCase();
      const title = (b.class_item?.title || "").toLowerCase();
      const student = `${b.student?.first_name || ""} ${b.student?.last_name || ""}`.toLowerCase();
      return num.includes(q) || title.includes(q) || student.includes(q);
    });
  }, [bookings, searchQuery]);

  const columns: Column<any>[] = [
    {
      key: "booking_number",
      header: "Session Ref",
      sortable: true,
      render: (b) => (
        <span className="font-mono font-bold text-navy-950 text-xs">
          {b.booking_number}
        </span>
      ),
    },
    {
      key: "class_title",
      header: "Class & Student",
      render: (b) => (
        <div className="max-w-xs space-y-0.5">
          <p className="font-bold text-navy-950 truncate text-xs">
            {b.class_item?.title || "Academic Session"}
          </p>
          <p className="text-[11px] text-slate-500">
            Student: {b.student?.first_name} {b.student?.last_name} ({b.format})
          </p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Session Date",
      sortable: true,
      render: (b) => (
        <span className="text-slate-600 text-xs">
          {new Date(b.start_time).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "gross_amount",
      header: "Gross Tuition",
      sortable: true,
      render: (b) => (
        <span className="font-semibold text-slate-700 text-xs">
          {b.financial_snapshot ? (
            <MoneyDisplay cents={b.financial_snapshot.gross_amount} />
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      key: "fee_amount",
      header: "Fee (20%)",
      render: (b) => (
        <span className="text-purple-700 text-xs font-semibold">
          {b.financial_snapshot ? (
            <span>-<MoneyDisplay cents={b.financial_snapshot.platform_fee_amount} /></span>
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      key: "net_amount",
      header: "Net Payout (80%)",
      sortable: true,
      render: (b) => (
        <span className="font-bold text-emerald-700 text-xs">
          {b.financial_snapshot ? (
            <MoneyDisplay cents={b.financial_snapshot.tutor_earnings} />
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: "actions",
      header: "Inspect",
      className: "text-right",
      render: (b) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-primary hover:bg-indigo-50 flex items-center gap-1 ml-auto"
          onClick={() => setSelectedBooking(b)}
        >
          <Eye className="w-3 h-3" />
          <span>Details</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Instructor Earnings Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-teal-600" />
              <span>Rule 12 Protected</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Authoritative financial settlement breakdown locked at booking time. Guaranteed 80% instructor payout.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Gross Student Tuition"
          value={<MoneyDisplay cents={totalGrossCents} />}
          subtitle="Total enrollment revenue"
          icon={DollarSign}
          variant="indigo"
        />
        <StatCard
          title="Platform Deductions (20%)"
          value={<MoneyDisplay cents={totalPlatformDeductionsCents} />}
          subtitle="Covers Stripe, hosting & facilities"
          icon={TrendingUp}
          variant="purple"
        />
        <StatCard
          title="Net Tutor Earnings (80%)"
          value={<MoneyDisplay cents={totalNetEarningsCents} />}
          subtitle="Deposited via Stripe Connect"
          icon={CreditCard}
          variant="emerald"
        />
      </div>

      {/* Immutability Guarantee Box */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-start gap-3 text-xs text-teal-900">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold">Rule 12 & Rule 21 Financial Immutability:</strong>
          Historical earnings are locked permanently in individual booking snapshots. Even if platform commissions change in the future, your past earnings are never recalculated.
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filtered}
        columns={columns}
        searchKey="booking_number"
        searchPlaceholder="Search session reference or student..."
        emptyTitle="No session earnings recorded"
        emptyDescription="When students reserve and attend your classes, itemized financial snapshots will be logged here."
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Session Earnings Breakdown"
        subtitle={`Booking Ref: ${selectedBooking?.booking_number || ""}`}
      >
        {selectedBooking && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Class Title:</span>
                <span className="font-bold text-navy-950">{selectedBooking.class_item?.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Student Name:</span>
                <span className="font-medium text-slate-800">
                  {selectedBooking.student?.first_name} {selectedBooking.student?.last_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Format:</span>
                <StatusBadge status={selectedBooking.format} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Status:</span>
                <StatusBadge status={selectedBooking.status} />
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-navy-950 block">Frozen Financial Snapshot</span>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Gross Tuition Paid by Student:</span>
                <span className="font-bold text-navy-950 text-sm">
                  {selectedBooking.financial_snapshot && (
                    <MoneyDisplay cents={selectedBooking.financial_snapshot.gross_amount} />
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-purple-700">
                <span>Platform Commission (20%):</span>
                <span className="font-semibold">
                  -{selectedBooking.financial_snapshot && (
                    <MoneyDisplay cents={selectedBooking.financial_snapshot.platform_fee_amount} />
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 text-emerald-800 font-bold text-sm border-t border-slate-100">
                <span>Your Net Disbursed Payout (80%):</span>
                <span>
                  {selectedBooking.financial_snapshot && (
                    <MoneyDisplay cents={selectedBooking.financial_snapshot.tutor_earnings} />
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
