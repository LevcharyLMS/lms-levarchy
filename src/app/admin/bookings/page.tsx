"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { StatCard } from "@/components/ui/stat-card";
import {
  BookOpen,
  Calendar,
  Video,
  MapPin,
  Eye,
  DollarSign,
  CheckCircle2,
  Lock,
  ExternalLink,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (formatFilter !== "ALL" && b.format !== formatFilter) return false;
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (b.booking_number || "").toLowerCase();
        const title = (b.class_item?.title || "").toLowerCase();
        const student = `${b.student?.first_name || ""} ${b.student?.last_name || ""}`.toLowerCase();
        const tutor = `${b.tutor?.first_name || ""} ${b.tutor?.last_name || ""}`.toLowerCase();
        return num.includes(q) || title.includes(q) || student.includes(q) || tutor.includes(q);
      }
      return true;
    });
  }, [bookings, formatFilter, statusFilter, searchQuery]);

  const totalGrossCents = bookings.reduce(
    (sum, b) => sum + (b.financial_snapshot?.gross_amount || 0),
    0
  );
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;

  const columns: Column<any>[] = [
    {
      key: "booking_number",
      header: "Reference",
      sortable: true,
      render: (b) => (
        <span className="font-mono font-bold text-navy-950 text-xs">
          {b.booking_number}
        </span>
      ),
    },
    {
      key: "class",
      header: "Class Session",
      render: (b) => (
        <div className="max-w-xs space-y-0.5">
          <p className="font-bold text-navy-950 truncate text-xs">
            {b.class_item?.title || "Class Session"}
          </p>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={b.format} />
            <span className="text-[10px] text-slate-400 font-medium">
              {b.class_item?.duration_minutes || 60} min
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "student",
      header: "Student",
      render: (b) => (
        <div>
          <p className="font-medium text-slate-900 text-xs">
            {b.student?.first_name} {b.student?.last_name}
          </p>
          <p className="text-[11px] text-slate-400">{b.student?.email}</p>
        </div>
      ),
    },
    {
      key: "tutor",
      header: "Tutor",
      render: (b) => (
        <div>
          <p className="font-medium text-slate-900 text-xs">
            {b.tutor?.first_name} {b.tutor?.last_name}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">Verified Instructor</span>
        </div>
      ),
    },
    {
      key: "session_date",
      header: "Date & Time",
      sortable: true,
      render: (b) => (
        <div className="space-y-0.5">
          <p className="text-slate-800 font-medium text-xs">
            {new Date(b.start_time).toLocaleDateString()}
          </p>
          <p className="text-[10px] text-slate-400">
            {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ),
    },
    {
      key: "gross_amount",
      header: "Tuition",
      sortable: true,
      render: (b) => (
        <div className="font-bold text-navy-950 text-xs">
          {b.financial_snapshot ? (
            <MoneyDisplay cents={b.financial_snapshot.gross_amount} />
          ) : (
            "—"
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (b) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-primary hover:bg-indigo-50 flex items-center gap-1 ml-auto"
          onClick={() => setSelectedBooking(b)}
        >
          <Eye className="w-3 h-3" />
          <span>Inspect</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Marketplace Bookings Master Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
              Rule 11 Immutable Snapshots
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Audit-grade record of student session reservations, locked financial snapshots, and meeting credentials.
          </p>
        </div>

        <Button
          onClick={loadBookings}
          variant="outline"
          size="sm"
          className="h-8 text-xs border-slate-200"
          disabled={loading}
        >
          Refresh Ledger
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          subtitle="All-time marketplace records"
          icon={BookOpen}
          variant="indigo"
        />
        <StatCard
          title="Gross Booked Volume"
          value={<MoneyDisplay cents={totalGrossCents} />}
          subtitle="Locked financial snapshots"
          icon={DollarSign}
          variant="teal"
        />
        <StatCard
          title="Confirmed Upcoming"
          value={confirmedCount}
          subtitle="Ready for instruction"
          icon={Calendar}
          variant="purple"
        />
        <StatCard
          title="Completed Classes"
          value={completedCount}
          subtitle="Tutor payout eligible"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Format:</span>
            {[
              { id: "ALL", label: "All Formats" },
              { id: "ONLINE_1ON1", label: "Online 1-on-1" },
              { id: "ONLINE_GROUP", label: "Online Group" },
              { id: "PHYSICAL_STUDENT_HOME", label: "Student Home" },
              { id: "PHYSICAL_CENTER", label: "Learning Center" },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormatFilter(fmt.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  formatFilter === fmt.id
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {fmt.label}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search reference, student, or tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredBookings}
        columns={columns}
        searchKey="booking_number"
        emptyTitle="No bookings found"
        emptyDescription="No sessions match the selected filters. When students book classes, they will be registered here."
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Ledger Inspection"
        subtitle={`Reference: ${selectedBooking?.booking_number || ""}`}
      >
        {selectedBooking && (
          <div className="space-y-6 text-xs">
            {/* Session Overview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Status</span>
                <StatusBadge status={selectedBooking.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Format</span>
                <StatusBadge status={selectedBooking.format} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Scheduled Start</span>
                <span className="font-medium text-navy-950">
                  {new Date(selectedBooking.start_time).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Scheduled End</span>
                <span className="font-medium text-navy-950">
                  {new Date(selectedBooking.end_time).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Financial Snapshot (Rule 11) */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Locked Financial Snapshot (Rule 11)</span>
              </div>
              <p className="text-[11px] text-indigo-700">
                Financial parameters are frozen at the exact moment of checkout and remain immutable.
              </p>

              {selectedBooking.financial_snapshot ? (
                <div className="space-y-2 pt-2 border-t border-indigo-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Gross Tuition Paid:</span>
                    <span className="font-bold text-navy-950">
                      <MoneyDisplay cents={selectedBooking.financial_snapshot.gross_amount} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Platform Commission (20%):</span>
                    <span className="font-bold text-purple-700">
                      <MoneyDisplay cents={selectedBooking.financial_snapshot.platform_fee_amount} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Net Tutor Payout (80%):</span>
                    <span className="font-bold text-emerald-700">
                      <MoneyDisplay cents={selectedBooking.financial_snapshot.tutor_earnings} />
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">No financial snapshot recorded for this booking.</p>
              )}
            </div>

            {/* Participants */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Student</span>
                <p className="font-bold text-navy-950">
                  {selectedBooking.student?.first_name} {selectedBooking.student?.last_name}
                </p>
                <p className="text-[11px] text-slate-500">{selectedBooking.student?.email}</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tutor</span>
                <p className="font-bold text-navy-950">
                  {selectedBooking.tutor?.first_name} {selectedBooking.tutor?.last_name}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold">Verified Faculty</p>
              </div>
            </div>

            {/* Location / Meeting Room */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-navy-950 block">Classroom Venue</span>
              {selectedBooking.format.includes("ONLINE") ? (
                <div className="flex items-center justify-between p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-navy-950 text-xs">Google Meet Session</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {selectedBooking.meeting_link || "https://meet.google.com/lv-2026-meet"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selectedBooking.meeting_link || "https://meet.google.com/lv-2026-meet"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-navy-950 text-xs">
                      {selectedBooking.location?.name || "Physical Learning Venue"}
                    </p>
                    <p className="text-[10px] text-slate-500">In-person classroom address</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
