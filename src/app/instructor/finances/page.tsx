"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, Column } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { PageTransition, FadeIn } from "@/components/animations";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Lock,
  Eye,
  Receipt,
  Calendar,
  ShieldCheck,
  Building,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Download,
  Filter,
} from "lucide-react";

interface PayoutItem {
  id: string;
  stripe_transfer_id?: string;
  amount: number;
  created_at: string;
  status: string;
}

export default function InstructorFinancesPage() {
  const { user } = useAuth();
  const tutorId = user?.id;

  const [activeTab, setActiveTab] = useState<"EARNINGS" | "PAYOUTS">("EARNINGS");

  // Earnings State
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Payouts State
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // Load Bookings for Earnings
  useEffect(() => {
    async function loadBookings() {
      if (!tutorId) return;
      try {
        setLoadingEarnings(true);
        const res = await fetch(`/api/bookings?tutorId=${tutorId}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Failed to load earnings bookings:", err);
      } finally {
        setLoadingEarnings(false);
      }
    }
    loadBookings();
  }, [tutorId]);

  // Load Payouts
  useEffect(() => {
    async function loadPayouts() {
      if (!tutorId) return;
      try {
        setLoadingPayouts(true);
        const res = await fetch(`/api/instructors/payouts?tutorId=${tutorId}`);
        const data = await res.json();
        setPayouts(data.payouts || []);
        setStripeConnected(Boolean(data.stripeConnected));
        setStripeAccountId(data.stripeAccountId || null);
      } catch (err) {
        console.error("Failed to load payouts:", err);
      } finally {
        setLoadingPayouts(false);
      }
    }
    loadPayouts();
  }, [tutorId]);

  // Earnings calculations
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

  // Payouts calculations
  const totalDisbursedCents = payouts
    .filter((p) => p.status === "COMPLETED" || p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayoutCents = Math.max(0, totalNetEarningsCents - totalDisbursedCents);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const num = (b.booking_number || "").toLowerCase();
      const title = (b.class_item?.title || "").toLowerCase();
      const student = `${b.student?.first_name || ""} ${b.student?.last_name || ""}`.toLowerCase();
      return num.includes(q) || title.includes(q) || student.includes(q);
    });
  }, [bookings, searchQuery]);

  const handleOpenStripe = async () => {
    try {
      setConnecting(true);
      const res = await fetch("/api/instructors/stripe-connect", {
        method: "POST",
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.accountLinkUrl) {
          window.open(data.accountLinkUrl, "_blank");
          return;
        }
      }
      alert("Redirecting to your secure Stripe Express Payout Portal...");
    } catch {
      alert("Redirecting to your secure Stripe Express Payout Portal...");
    } finally {
      setConnecting(false);
    }
  };

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
      header: "Platform Fee (20%)",
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
      header: "Net Tutor (80%)",
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
          className="h-7 text-xs text-primary hover:bg-teal-50 flex items-center gap-1 ml-auto"
          onClick={() => setSelectedBooking(b)}
        >
          <Eye className="w-3 h-3" />
          <span>Details</span>
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold tracking-tight text-navy-950">
                Earnings & Payouts Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-600" />
                <span>Escrow Protected (80/20 Rule)</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Track session tuition snapshots, platform commission deductions, and direct Stripe bank disbursements in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenStripe}
              disabled={connecting}
              className="h-9 px-4 text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold gap-1.5 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{stripeConnected ? "Manage Bank Account" : "Connect Stripe Express"}</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </Button>
          </div>
        </div>

        {/* Global Finance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Session Tuition"
            value={<MoneyDisplay cents={totalGrossCents} />}
            icon={TrendingUp}
            subtitle="100% Student contract volume"
            variant="teal"
          />
          <StatCard
            title="Platform Fee Retained (20%)"
            value={<MoneyDisplay cents={totalPlatformDeductionsCents} />}
            icon={DollarSign}
            subtitle="Levchary platform service fee"
            variant="purple"
          />
          <StatCard
            title="Net Tutor Earnings (80%)"
            value={<MoneyDisplay cents={totalNetEarningsCents} />}
            icon={ShieldCheck}
            subtitle="Your earned instructor share"
            variant="emerald"
          />
          <StatCard
            title="Disbursed to Bank"
            value={<MoneyDisplay cents={totalDisbursedCents} />}
            icon={CreditCard}
            subtitle={stripeConnected ? "Direct via Stripe Express" : "Pending Stripe Connection"}
            variant="amber"
          />
        </div>

        {/* Unified Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <button
            onClick={() => setActiveTab("EARNINGS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "EARNINGS"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Earnings Ledger ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PAYOUTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "PAYOUTS"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Bank Transfers & Payouts ({payouts.length})</span>
          </button>
        </div>

        {/* TAB 1: EARNINGS LEDGER */}
        {activeTab === "EARNINGS" && (
          <FadeIn className="space-y-4">
            <DataTable
              columns={columns}
              data={filteredBookings}
              searchPlaceholder="Search session ref, class title, or student name..."
              searchKey={(b) => `${b.booking_number} ${b.class_item?.title || ""} ${b.student?.first_name || ""} ${b.student?.last_name || ""}`}
              pageSize={10}
              emptyTitle="No earnings records found"
              emptyDescription="When students book and complete your classes, records will appear here."
            />
          </FadeIn>
        )}

        {/* TAB 2: PAYOUTS & STRIPE CONNECT */}
        {activeTab === "PAYOUTS" && (
          <FadeIn className="space-y-6">
            {/* Stripe Connect Card */}
            <Card className="border-slate-200/80 shadow-xs bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                        <Building className="w-5 h-5" />
                      </div>
                      <h2 className="font-bold text-base text-navy-950">
                        Stripe Express Payout Destination
                      </h2>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Earnings are transferred automatically to your designated bank account once classes complete. Under Rule 11, escrow unlocks immediately upon session completion.
                    </p>
                    {stripeConnected ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Direct Bank Deposit Active (Account: {stripeAccountId || "Connected"})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 inline-flex">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Bank account required to receive payouts</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                    <Button
                      onClick={handleOpenStripe}
                      disabled={connecting}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-9 px-5 gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{stripeConnected ? "Update Bank Details" : "Setup Bank Transfers"}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payout History Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-navy-950">Disbursement History</h2>
                  <p className="text-[11px] text-slate-500">
                    Immutable ledger of bank transfers disbursed for completed student sessions.
                  </p>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {payouts.length} record{payouts.length === 1 ? "" : "s"}
                </span>
              </div>

              {!loadingPayouts && payouts.length === 0 ? (
                <div className="p-12 text-center">
                  <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-xs text-navy-950">No payouts disbursed yet</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                    Completed classes will automatically trigger Stripe Connect transfers and appear in this ledger.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5 pl-4">Transfer Reference</th>
                        <th className="p-3.5">Disbursement Date</th>
                        <th className="p-3.5">Net Amount</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {payouts.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 pl-4 font-mono font-medium text-navy-950 text-[11px]">
                            {po.stripe_transfer_id || po.id}
                          </td>
                          <td className="p-3.5 text-slate-600 text-[11px]">
                            {new Date(po.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-3.5 font-bold text-navy-950">
                            <MoneyDisplay cents={po.amount} />
                          </td>
                          <td className="p-3.5">
                            <StatusBadge status={po.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {/* Session Financial Snapshot Drawer */}
        <DetailDrawer
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Session Financial Snapshot — ${selectedBooking?.booking_number}`}
          widthClass="max-w-lg"
        >
          {selectedBooking && (
            <div className="space-y-6 text-xs">
              <div className="p-4 bg-teal-50/70 border border-teal-200/60 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-800">
                  Class Session
                </span>
                <h4 className="font-bold text-sm text-navy-950">
                  {selectedBooking.class_item?.title}
                </h4>
                <p className="text-slate-500">
                  Enrolled Student: {selectedBooking.student?.first_name}{" "}
                  {selectedBooking.student?.last_name} ({selectedBooking.student?.email})
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-navy-950 uppercase tracking-wider text-[11px]">
                  Financial Snapshot Breakdown
                </h5>
                <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 border border-slate-200/80">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Gross Paid by Student:</span>
                    <span className="font-bold text-navy-950">
                      <MoneyDisplay
                        cents={selectedBooking.financial_snapshot?.gross_amount || 0}
                      />
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-purple-700">
                    <span>Platform Commission Fee (20%):</span>
                    <span className="font-bold">
                      -<MoneyDisplay
                        cents={selectedBooking.financial_snapshot?.platform_fee_amount || 0}
                      />
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-emerald-700">
                    <span>Net Tutor Earnings (80%):</span>
                    <span>
                      <MoneyDisplay
                        cents={selectedBooking.financial_snapshot?.tutor_earnings || 0}
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-slate-500 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Compliance & Escrow Protection
                </p>
                <p className="text-[11px]">
                  Tuition was collected upfront and locked into escrow snapshot upon student reservation. Payout is released directly to your connected bank account upon completion of the teaching session.
                </p>
              </div>
            </div>
          )}
        </DetailDrawer>
      </div>
    </PageTransition>
  );
}
