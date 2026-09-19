"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MoneyDisplay } from "@/components/ui/money-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { StatCard } from "@/components/ui/stat-card";
import {
  CreditCard,
  Lock,
  DollarSign,
  TrendingUp,
  Receipt,
  Eye,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/transactions");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && tx.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const id = (tx.id || "").toLowerCase();
        const charge = (tx.stripe_charge_id || "").toLowerCase();
        const student = `${tx.student_first_name || ""} ${tx.student_last_name || ""}`.toLowerCase();
        const tutor = `${tx.tutor_first_name || ""} ${tx.tutor_last_name || ""}`.toLowerCase();
        return id.includes(q) || charge.includes(q) || student.includes(q) || tutor.includes(q);
      }
      return true;
    });
  }, [transactions, typeFilter, statusFilter, searchQuery]);

  const totalGrossCents = transactions.reduce((sum, tx) => sum + (tx.gross_amount || 0), 0);
  const totalFeesCents = transactions.reduce((sum, tx) => sum + (tx.fee_amount || 0), 0);
  const totalNetCents = transactions.reduce((sum, tx) => sum + (tx.net_amount || 0), 0);

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "Transaction ID",
      sortable: true,
      render: (tx) => (
        <span className="font-mono font-bold text-navy-950 text-xs">
          {tx.id}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (tx) => <StatusBadge status={tx.type} />,
    },
    {
      key: "gross_amount",
      header: "Gross Tuition",
      sortable: true,
      render: (tx) => (
        <span className="font-bold text-navy-950 text-xs">
          <MoneyDisplay cents={tx.gross_amount} />
        </span>
      ),
    },
    {
      key: "fee_amount",
      header: "Platform (20%)",
      sortable: true,
      render: (tx) => (
        <span className="font-semibold text-purple-800 text-xs">
          <MoneyDisplay cents={tx.fee_amount} />
        </span>
      ),
    },
    {
      key: "net_amount",
      header: "Tutor Share (80%)",
      sortable: true,
      render: (tx) => (
        <span className="font-bold text-emerald-700 text-xs">
          <MoneyDisplay cents={tx.net_amount} />
        </span>
      ),
    },
    {
      key: "stripe_charge_id",
      header: "Stripe Charge Ref",
      render: (tx) => (
        <span className="font-mono text-[11px] text-slate-500 truncate max-w-[140px] block">
          {tx.stripe_charge_id || "ch_test_default"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (tx) => <StatusBadge status={tx.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (tx) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-primary hover:bg-indigo-50 flex items-center gap-1 ml-auto"
          onClick={() => setSelectedTx(tx)}
        >
          <Eye className="w-3 h-3" />
          <span>Inspect</span>
        </Button>
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
              Financial Transactions Master Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-teal-600" />
              <span>Append-Only Ledger</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable settlement record tracking gross tuition, 20% platform commission, and 80% net instructor payouts.
          </p>
        </div>

        <Button
          onClick={loadTransactions}
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
          title="Total Gross Volume"
          value={<MoneyDisplay cents={totalGrossCents} />}
          subtitle="Processed through gateway"
          icon={DollarSign}
          variant="indigo"
        />
        <StatCard
          title="Platform Commission"
          value={<MoneyDisplay cents={totalFeesCents} />}
          subtitle="20% platform revenue"
          icon={TrendingUp}
          variant="purple"
        />
        <StatCard
          title="Tutor Earnings Disbursed"
          value={<MoneyDisplay cents={totalNetCents} />}
          subtitle="80% net instructor volume"
          icon={CreditCard}
          variant="emerald"
        />
        <StatCard
          title="Total Settlements"
          value={transactions.length}
          subtitle="Immutable records"
          icon={Receipt}
          variant="teal"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Type:</span>
            {["ALL", "PAYMENT", "REFUND", "PAYOUT"].map((tp) => (
              <button
                key={tp}
                onClick={() => setTypeFilter(tp)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  typeFilter === tp
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tp}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {["ALL", "COMPLETED", "PENDING", "FAILED"].map((st) => (
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
              placeholder="Search transaction or charge ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredTransactions}
        columns={columns}
        searchKey="id"
        emptyTitle="No transactions recorded"
        emptyDescription="Once students complete checkout, immutable transaction ledger records will appear here."
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title="Transaction Ledger Breakdown"
        subtitle={`ID: ${selectedTx?.id || ""}`}
      >
        {selectedTx && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Type</span>
                <StatusBadge status={selectedTx.type} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Settlement Status</span>
                <StatusBadge status={selectedTx.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Stripe Charge Reference</span>
                <span className="font-mono text-navy-950 font-bold">
                  {selectedTx.stripe_charge_id || "ch_test_default"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Logged At</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedTx.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Financial Split */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-navy-950 block">Audited Split Calculation</span>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">Gross Processed Amount</span>
                  <span className="font-bold text-navy-950 text-sm">
                    <MoneyDisplay cents={selectedTx.gross_amount} />
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                  <div>
                    <span className="font-semibold text-purple-900">Platform Commission (20%)</span>
                    <p className="text-[10px] text-purple-700">Levchary marketplace revenue</p>
                  </div>
                  <span className="font-bold text-purple-900 text-sm">
                    <MoneyDisplay cents={selectedTx.fee_amount} />
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div>
                    <span className="font-semibold text-emerald-900">Tutor Net Disbursed (80%)</span>
                    <p className="text-[10px] text-emerald-700">Stripe Connect transfer allocation</p>
                  </div>
                  <span className="font-bold text-emerald-900 text-sm">
                    <MoneyDisplay cents={selectedTx.net_amount} />
                  </span>
                </div>
              </div>
            </div>

            {/* Immutability Verification Badge */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-teal-900">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Cryptographic & Database Immutability Guaranteed</span>
              </div>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                This transaction record is locked by PostgreSQL row level security and append-only database triggers. It cannot be altered, recalculated, or deleted.
              </p>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
