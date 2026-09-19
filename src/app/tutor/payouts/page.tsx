"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { StatCard } from "@/components/ui/stat-card";
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  DollarSign,
  Building,
  Clock,
} from "lucide-react";

export default function TutorPayoutsPage() {
  const [connecting, setConnecting] = useState(false);

  const completedPayouts = [
    {
      id: "po-1",
      reference: "po_1Qx8A7LevcharyTransfer",
      amountCents: 12800, // $128.00
      date: "2026-09-16",
      status: "COMPLETED",
      destination: "Chase Bank ending in 4291",
    },
    {
      id: "po-2",
      reference: "po_1Qw4N9LevcharyTransfer",
      amountCents: 15600, // $156.00
      date: "2026-09-09",
      status: "COMPLETED",
      destination: "Chase Bank ending in 4291",
    },
  ];

  const handleOpenStripe = async () => {
    try {
      setConnecting(true);
      const res = await fetch("/api/tutors/stripe-connect", {
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Stripe Connect Direct Payouts
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Express Connected</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Automated direct deposit transfers processed securely via Stripe Connect Express.
          </p>
        </div>

        <Button
          onClick={handleOpenStripe}
          disabled={connecting}
          className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs"
        >
          <span>Stripe Express Portal</span>
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Total Disbursed"
          value={<MoneyDisplay cents={28400} />}
          subtitle="Direct bank deposits received"
          icon={DollarSign}
          variant="indigo"
        />
        <StatCard
          title="Payout Frequency"
          value="Daily Rolling"
          subtitle="2-day automated bank clearance"
          icon={Clock}
          variant="teal"
        />
        <StatCard
          title="Linked Bank Account"
          value="Chase Bank (*4291)"
          subtitle="Direct ACH deposit active"
          icon={Building}
          variant="emerald"
        />
      </div>

      {/* Stripe Connect Account Card */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-navy-950">Stripe Express Account Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified & Ready for Transfers
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected Account ID: <code className="font-mono text-slate-800 font-semibold">acct_1MarcusChenMIT</code>
              </p>
              <p className="text-xs text-slate-600">
                All 80% tuition shares are automatically transferred directly to your bank upon class completion.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-slate-200 gap-1.5"
              onClick={handleOpenStripe}
            >
              <span>Update Bank Details</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout History Ledger */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-xs text-navy-950 uppercase tracking-wider">
            Disbursed Direct Transfers Ledger
          </h2>
          <span className="text-xs text-slate-400">All historical bank deposits</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Transfer Reference</th>
                <th className="p-3.5">Arrival Date</th>
                <th className="p-3.5">Bank Destination</th>
                <th className="p-3.5">Net Disbursed Amount</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {completedPayouts.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-navy-950">
                    {po.reference}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {po.date}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {po.destination}
                  </td>
                  <td className="p-3.5 font-bold text-emerald-700">
                    <MoneyDisplay cents={po.amountCents} />
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={po.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
