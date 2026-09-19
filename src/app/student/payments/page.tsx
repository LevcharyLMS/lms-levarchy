"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MoneyDisplay } from "@/components/ui/money-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { StatCard } from "@/components/ui/stat-card";
import {
  CreditCard,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  DollarSign,
  Receipt,
  Printer,
  Calendar,
} from "lucide-react";

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/bookings?studentId=usr-stu-1");
        const data = await res.json();
        setPayments(data.bookings || []);
      } catch (err) {
        console.error("Failed to load payments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalTuitionCents = payments.reduce(
    (sum, p) => sum + (p.financial_snapshot?.gross_amount || 0),
    0
  );

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const num = (p.booking_number || "").toLowerCase();
      const title = (p.class_item?.title || "").toLowerCase();
      const tutor = `${p.tutor?.first_name || ""} ${p.tutor?.last_name || ""}`.toLowerCase();
      return num.includes(q) || title.includes(q) || tutor.includes(q);
    });
  }, [payments, searchQuery]);

  const columns: Column<any>[] = [
    {
      key: "booking_number",
      header: "Invoice / Booking Ref",
      sortable: true,
      render: (p) => (
        <span className="font-mono font-bold text-navy-950 text-xs">
          {p.booking_number}
        </span>
      ),
    },
    {
      key: "class",
      header: "Class & Instructor",
      render: (p) => (
        <div className="max-w-xs space-y-0.5">
          <p className="font-bold text-navy-950 truncate text-xs">
            {p.class_item?.title || "Mentorship Session"}
          </p>
          <p className="text-[11px] text-slate-500">
            Tutor: {p.tutor?.first_name} {p.tutor?.last_name}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date of Payment",
      sortable: true,
      render: (p) => (
        <span className="text-slate-600 text-xs">
          {new Date(p.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "gross_amount",
      header: "Tuition Amount",
      sortable: true,
      render: (p) => (
        <span className="font-bold text-navy-950 text-xs">
          {p.financial_snapshot ? (
            <MoneyDisplay cents={p.financial_snapshot.gross_amount} />
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Settlement Status",
      render: (p) => (
        <StatusBadge status={p.status === "COMPLETED" ? "SUCCEEDED" : p.status} />
      ),
    },
    {
      key: "actions",
      header: "Receipt",
      className: "text-right",
      render: (p) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs border-slate-200 hover:bg-slate-50 gap-1 ml-auto"
          onClick={() => setSelectedReceipt(p)}
        >
          <Receipt className="w-3 h-3" />
          <span>View</span>
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
              Payment History & Locked Invoices
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-teal-600" />
              <span>Stripe Escrow Settled</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable snapshots and tax-compliant receipts for all your educational tuition payments.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Total Tuition Invested"
          value={<MoneyDisplay cents={totalTuitionCents} />}
          subtitle="Processed via Stripe"
          icon={DollarSign}
          variant="indigo"
        />
        <StatCard
          title="Settled Invoices"
          value={payments.length}
          subtitle="Immutable financial records"
          icon={Receipt}
          variant="teal"
        />
        <StatCard
          title="Platform Escrow Protection"
          value="100% Protected"
          subtitle="Rule 10 24h refund guarantee"
          icon={ShieldCheck}
          variant="emerald"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={filtered}
        columns={columns}
        searchKey="booking_number"
        searchPlaceholder="Search invoice reference or instructor..."
        emptyTitle="No payment records found"
        emptyDescription="When you book a tutoring session or class cohort, your official receipt will appear here."
      />

      {/* Detail Drawer - Official Receipt */}
      <DetailDrawer
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Payment Receipt"
        subtitle={`Invoice Ref: ${selectedReceipt?.booking_number || ""}`}
      >
        {selectedReceipt && (
          <div className="space-y-6 text-xs">
            {/* Header Receipt Card */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-sm text-navy-950">Levchary LMS Inc.</h3>
                  <p className="text-[11px] text-slate-400">Educational Services Receipt</p>
                </div>
                <StatusBadge status={selectedReceipt.status === "COMPLETED" ? "SUCCEEDED" : selectedReceipt.status} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Invoice Number:</span>
                  <span className="font-mono font-bold text-navy-950">{selectedReceipt.booking_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Date:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedReceipt.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-medium text-slate-800">Credit Card via Stripe</span>
                </div>
              </div>
            </div>

            {/* Line Item Breakdown */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-navy-950 block">Item Description</span>
              <div className="flex items-center justify-between py-2 border-y border-slate-100">
                <div>
                  <p className="font-bold text-navy-950 text-xs">
                    {selectedReceipt.class_item?.title || "Academic Tutoring Session"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Instructor: {selectedReceipt.tutor?.first_name} {selectedReceipt.tutor?.last_name} ({selectedReceipt.format})
                  </p>
                </div>
                <span className="font-bold text-navy-950 text-sm">
                  {selectedReceipt.financial_snapshot && (
                    <MoneyDisplay cents={selectedReceipt.financial_snapshot.gross_amount} />
                  )}
                </span>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>
                    {selectedReceipt.financial_snapshot && (
                      <MoneyDisplay cents={selectedReceipt.financial_snapshot.gross_amount} />
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Taxes / Processing:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex items-center justify-between text-navy-950 font-bold text-sm pt-2 border-t border-slate-100">
                  <span>Total Paid:</span>
                  <span className="text-primary font-extrabold">
                    {selectedReceipt.financial_snapshot && (
                      <MoneyDisplay cents={selectedReceipt.financial_snapshot.gross_amount} />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Immutability guarantee */}
            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Rule 11 Immutable Snapshot Verified</span>
              </div>
              <p className="text-[11px] text-teal-800">
                Tuition rates are locked at booking time and cannot be retroactively adjusted.
              </p>
            </div>

            <Button
              className="w-full h-9 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Invoice</span>
            </Button>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
