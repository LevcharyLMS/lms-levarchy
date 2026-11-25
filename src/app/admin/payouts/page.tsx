"use client";

import React, { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { CreditCard, Building, RefreshCw } from "lucide-react";
import { PageTransition, FadeIn } from "@/components/animations";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { Button } from "@/components/ui/button";

interface PayoutRecord {
  id: string;
  tutor_first_name?: string;
  tutor_last_name?: string;
  tutor_email?: string;
  tutor_id: string;
  amount: number;
  stripe_transfer_id?: string;
  status: string;
  created_at: string;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayouts = () => {
    setLoading(true);
    fetch("/api/admin/payouts")
      .then((res) => res.json())
      .then((data) => {
        setPayouts(data.payouts || []);
      })
      .catch((err) => console.error("Error loading payouts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const financeTabs = [
    { label: "Payments", href: "/admin/payments" },
    { label: "Transactions", href: "/admin/transactions" },
    { label: "Payouts", href: "/admin/payouts" },
    { label: "Refunds", href: "/admin/refunds" },
    { label: "Commissions", href: "/admin/commissions" },
    { label: "Pricing", href: "/admin/pricing" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <AdminHubHeader
          title="Financial Operations Hub"
          badgeText="Instructor Payouts"
          description="Automated Stripe Connect transfers disbursed following completed class sessions and verified attendance."
          tabs={financeTabs}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={loadPayouts}
              disabled={loading}
              className="h-8 text-xs border-slate-200 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          }
        />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {!loading && payouts.length === 0 ? (
            <FadeIn>
              <div className="p-16 text-center">
                <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-sm text-navy-950">No payouts disbursed yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  When instructors complete scheduled sessions, automated Stripe Connect transfers will be recorded and displayed here.
                </p>
              </div>
            </FadeIn>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Payout ID</th>
                    <th className="p-4">Tutor</th>
                    <th className="p-4">Net Payout Amount</th>
                    <th className="p-4">Stripe Transfer ID</th>
                    <th className="p-4">Disbursed Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-medium text-navy-950">
                        {p.id}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-navy-950">
                          {p.tutor_first_name} {p.tutor_last_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.tutor_email || p.tutor_id}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-navy-950">
                        <MoneyDisplay cents={p.amount} />
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-600">
                        {p.stripe_transfer_id || "Direct Deposit"}
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={p.status} />
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
