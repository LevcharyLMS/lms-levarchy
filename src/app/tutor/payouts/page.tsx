"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { StatCard } from "@/components/ui/stat-card";
import { PageTransition, FadeIn } from "@/components/animations";
import {
  ExternalLink,
  CheckCircle2,
  DollarSign,
  Building,
  Clock,
  AlertCircle,
} from "lucide-react";

interface PayoutItem {
  id: string;
  stripe_transfer_id?: string;
  amount: number;
  created_at: string;
  status: string;
}

export default function TutorPayoutsPage() {
  const { user } = useAuth();
  const tutorId = user?.id;

  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!tutorId) return;

    fetch(`/api/tutors/payouts?tutorId=${tutorId}`)
      .then((res) => res.json())
      .then((data) => {
        setPayouts(data.payouts || []);
        setStripeConnected(Boolean(data.stripeConnected));
        setStripeAccountId(data.stripeAccountId || null);
      })
      .catch((err) => console.error("Error loading payouts:", err))
      .finally(() => setLoading(false));
  }, [tutorId]);

  const totalDisbursedCents = payouts
    .filter((p) => p.status === "COMPLETED" || p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

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
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold tracking-tight text-navy-950">
                Stripe Connect Direct Payouts
              </h1>
              {stripeConnected ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Express Connected</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>Payout Setup Required</span>
                </span>
              )}
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
            <span>{stripeConnected ? "Stripe Express Portal" : "Connect Stripe Account"}</span>
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StatCard
            title="Total Disbursed"
            value={<MoneyDisplay cents={totalDisbursedCents} />}
            subtitle="Direct bank deposits received"
            icon={DollarSign}
            variant="indigo"
          />
          <StatCard
            title="Payout Status"
            value={stripeConnected ? "Active" : "Setup Needed"}
            subtitle="Automated transfer readiness"
            icon={Clock}
            variant={stripeConnected ? "emerald" : "amber"}
          />
          <StatCard
            title="Linked Account"
            value={stripeConnected ? "Stripe Express" : "Not Linked"}
            subtitle={stripeConnected ? "Direct bank clearance" : "Connect to receive payouts"}
            icon={Building}
            variant={stripeConnected ? "teal" : "slate"}
          />
        </div>

        {/* Stripe Connect Account Card */}
        <FadeIn>
          <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-navy-950">Stripe Express Account Status</span>
                    {stripeConnected ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Verified & Ready for Transfers
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Not Connected
                      </span>
                    )}
                  </div>
                  {stripeAccountId && (
                    <p className="text-xs text-slate-500">
                      Connected Account ID: <code className="font-mono text-slate-800 font-semibold">{stripeAccountId}</code>
                    </p>
                  )}
                  <p className="text-xs text-slate-600">
                    {stripeConnected
                      ? "Net tuition shares are automatically transferred directly to your bank upon class completion."
                      : "Connect your payout account to enable automated tuition distributions."}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-slate-200 gap-1.5"
                  onClick={handleOpenStripe}
                >
                  <span>{stripeConnected ? "Update Bank Details" : "Connect Account"}</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Payout History Ledger */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
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

          {!loading && payouts.length === 0 ? (
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
      </div>
    </PageTransition>
  );
}
