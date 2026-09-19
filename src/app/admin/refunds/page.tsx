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
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  Eye,
  Clock,
  Check,
} from "lucide-react";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null);
  const [overrideNotice, setOverrideNotice] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/refunds");
      const data = await res.json();
      setRefunds(data.refunds || []);
    } catch (err) {
      console.error("Failed to load refunds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleProcessRefund = async (refundId: string) => {
    try {
      setProcessing(true);
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundId,
          adminNotes: "Stripe reversal executed by Admin override.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOverrideNotice(
          `Refund #${refundId} executed successfully via Stripe (Reversal ID: ${data.stripeRefundId}).`
        );
        if (selectedRefund && selectedRefund.id === refundId) {
          setSelectedRefund({ ...selectedRefund, status: "REFUNDED" });
        }
        await loadRefunds();
      }
    } catch (err) {
      console.error("Failed to process refund:", err);
    } finally {
      setProcessing(false);
    }
  };

  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const id = (r.id || "").toLowerCase();
        const bRef = (r.booking_number || "").toLowerCase();
        const reason = (r.reason || "").toLowerCase();
        const student = `${r.student_first_name || ""} ${r.student_last_name || ""}`.toLowerCase();
        return id.includes(q) || bRef.includes(q) || reason.includes(q) || student.includes(q);
      }
      return true;
    });
  }, [refunds, statusFilter, searchQuery]);

  const totalRefundedCents = refunds
    .filter((r) => r.status === "REFUNDED" || r.status === "APPROVED")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const pendingCount = refunds.filter((r) => r.status === "REQUESTED").length;
  const processedCount = refunds.filter((r) => r.status === "REFUNDED").length;

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "Refund ID",
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold text-navy-950 text-xs">
          {r.id}
        </span>
      ),
    },
    {
      key: "booking_number",
      header: "Booking Ref",
      render: (r) => (
        <span className="font-mono text-slate-600 text-xs">
          {r.booking_number || r.booking_id}
        </span>
      ),
    },
    {
      key: "student",
      header: "Student",
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900 text-xs">
            {r.student_first_name ? `${r.student_first_name} ${r.student_last_name}` : "Student"}
          </p>
          <p className="text-[11px] text-slate-400">{r.student_email}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Tuition Amount",
      sortable: true,
      render: (r) => (
        <span className="font-bold text-navy-950 text-xs">
          <MoneyDisplay cents={r.amount} />
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason / Policy Notes",
      render: (r) => (
        <p className="text-xs text-slate-600 truncate max-w-xs">{r.reason}</p>
      ),
    },
    {
      key: "requested_at",
      header: "Requested Date",
      sortable: true,
      render: (r) => (
        <span className="text-slate-500 text-xs">
          {new Date(r.requested_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:bg-indigo-50 flex items-center gap-1"
            onClick={() => setSelectedRefund(r)}
          >
            <Eye className="w-3 h-3" />
            <span>Inspect</span>
          </Button>
          {r.status !== "REFUNDED" && (
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleProcessRefund(r.id)}
              disabled={processing}
            >
              Refund
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Refund & Cancellation Management
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              Rule 10 24-Hour Policy
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Review student cancellation requests and execute automated or manual Stripe payment reversals with full audit logs.
          </p>
        </div>

        <Button
          onClick={loadRefunds}
          variant="outline"
          size="sm"
          className="h-8 text-xs border-slate-200"
          disabled={loading}
        >
          Refresh Refunds
        </Button>
      </div>

      {overrideNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{overrideNotice}</span>
          </div>
          <button onClick={() => setOverrideNotice(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Total Reversals Executed"
          value={<MoneyDisplay cents={totalRefundedCents} />}
          subtitle="Processed via Stripe"
          icon={DollarSign}
          variant="indigo"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          subtitle="Student cancellation requests"
          icon={Clock}
          variant="gold"
        />
        <StatCard
          title="Settled Refunds"
          value={processedCount}
          subtitle="Reversed to original card"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {["ALL", "REQUESTED", "APPROVED", "REFUNDED", "REJECTED"].map((st) => (
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
              placeholder="Search refund ID or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredRefunds}
        columns={columns}
        searchKey="id"
        emptyTitle="No refund requests found"
        emptyDescription="When students cancel bookings or request compensation, records will appear here for admin review."
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        title="Refund Request Inspection"
        subtitle={`ID: ${selectedRefund?.id || ""}`}
      >
        {selectedRefund && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Refund Status</span>
                <StatusBadge status={selectedRefund.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Booking Reference</span>
                <span className="font-mono text-navy-950 font-bold">
                  {selectedRefund.booking_number || selectedRefund.booking_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Refund Amount</span>
                <span className="font-bold text-navy-950 text-sm">
                  <MoneyDisplay cents={selectedRefund.amount} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Requested Timestamp</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedRefund.requested_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Rule 10 Policy Compliance Box */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Rule 10 Cancellation Policy Compliance</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Cancellations made &gt;24 hours before class start are entitled to a full 100% refund.
                Cancellations within 24 hours require administrative approval.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-navy-950 block">Student Stated Reason</span>
              <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-800 leading-relaxed">
                {selectedRefund.reason || "Scheduling conflict requested."}
              </p>
            </div>

            {selectedRefund.status !== "REFUNDED" ? (
              <div className="pt-3 border-t border-slate-200">
                <Button
                  variant="destructive"
                  className="w-full h-9 text-xs"
                  onClick={() => handleProcessRefund(selectedRefund.id)}
                  disabled={processing}
                >
                  {processing ? "Executing Stripe Reversal..." : "Execute Full Refund via Stripe"}
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>This refund has been completed and disbursed to the student card.</span>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
