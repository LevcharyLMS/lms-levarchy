"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { StatCard } from "@/components/ui/stat-card";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
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
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
  Search,
  Filter,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [cancelNote, setCancelNote] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

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
        <div className="max-w-xs space-y-1">
          <p className="font-bold text-navy-950 truncate text-xs">
            {b.class_item?.title || "Class Session"}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={b.format || "VIRTUAL"} />
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
      header: "Instructor",
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
      render: (b) => {
        const gross = b.financial_snapshot?.gross_amount ?? b.class_item?.price;
        return (
          <div className="font-bold text-navy-950 text-xs">
            {gross ? <MoneyDisplay cents={gross} /> : "$35.00"}
          </div>
        );
      },
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
          className="h-7 text-xs text-primary hover:bg-teal-50 flex items-center gap-1 ml-auto"
          onClick={() => setSelectedBooking(b)}
        >
          <Eye className="w-3 h-3" />
          <span>Inspect</span>
        </Button>
      ),
    },
  ];

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    try {
      setCancelling(true);
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          status: "CANCELLED",
          note: cancelNote || "Administrative cancellation override",
        }),
      });

      if (res.ok) {
        setActionAlert(`Booking #${selectedBooking.booking_number} cancelled and recorded in audit trail.`);
        setSelectedBooking((prev: any) => ({ ...prev, status: "CANCELLED" }));
        setCancelNote("");
        await loadBookings();
        setTimeout(() => setActionAlert(null), 4000);
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    } finally {
      setCancelling(false);
    }
  };

  const bookingTabs = [
    { label: "Classes & Approvals", href: "/admin/classes" },
    { label: "Physical Venues", href: "/admin/locations" },
    { label: "Bookings Ledger", href: "/admin/bookings" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Classes & Bookings Hub"
        badgeText="Rule 11 Snapshots"
        description="Audit-grade ledger of student reservations, locked financial snapshots, meeting credentials, and class catalog approvals."
        tabs={bookingTabs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={loadBookings}
              variant="outline"
              size="sm"
              className="h-8 text-xs border-slate-200 gap-1.5"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Ledger</span>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5 text-teal-700 hover:bg-teal-50">
              <Link href="/admin/reports">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Bookings CSV in Reports</span>
              </Link>
            </Button>
          </div>
        }
      />

      {actionAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          subtitle="All-time marketplace records"
          icon={BookOpen}
          variant="teal"
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
          subtitle="Instructor payout eligible"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Compact & Clean Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking #, student, instructor, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-navy-950 font-medium"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Format Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Format:</span>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-semibold"
            >
              <option value="ALL">All Formats</option>
              <option value="VIRTUAL">Virtual Class</option>
              <option value="PHYSICAL">In-Person (Learning Center)</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {(formatFilter !== "ALL" || statusFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setFormatFilter("ALL");
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              className="text-xs text-teal-700 hover:underline px-2 py-1 font-semibold"
            >
              Reset
            </button>
          )}
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
            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-3">
              <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Locked Financial Snapshot (Rule 11)</span>
              </div>
              <p className="text-[11px] text-teal-700">
                Financial parameters are frozen at the exact moment of checkout and remain immutable.
              </p>

              {selectedBooking.financial_snapshot ? (
                <div className="space-y-2 pt-2 border-t border-teal-100">
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
                    <span className="text-slate-600">Net Instructor Payout (80%):</span>
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
                <span className="text-[10px] uppercase font-bold text-slate-400">Instructor</span>
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
                <div className="flex items-center justify-between p-2.5 bg-teal-50/60 rounded-lg border border-teal-100">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-teal-600" />
                    <div>
                      <p className="font-semibold text-navy-950 text-xs">Virtual Classroom (Jitsi)</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {selectedBooking.meeting_link || `/classroom/Levchary-${selectedBooking.id}`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={selectedBooking.meeting_link || `/classroom/Levchary-${selectedBooking.id}`}
                    className="p-1.5 bg-white rounded border border-teal-200 text-teal-600 hover:bg-teal-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
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

            {/* Administrative Action Section */}
            {selectedBooking.status !== "CANCELLED" && (
              <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-100 space-y-3">
                <span className="font-bold text-rose-950 block text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Administrative Cancellation Override</span>
                </span>
                <p className="text-[11px] text-rose-700">
                  Cancel this session on behalf of participants. This immediately frees classroom resources and records an immutable audit ledger entry.
                </p>
                <input
                  type="text"
                  placeholder="Reason for administrative cancellation (e.g. Instructor emergency request)..."
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  className="w-full text-xs h-8 px-3 border border-rose-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={cancelling}
                  onClick={handleCancelBooking}
                  className="w-full h-8 text-xs gap-1.5 font-semibold"
                >
                  {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>Cancel Booking</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
