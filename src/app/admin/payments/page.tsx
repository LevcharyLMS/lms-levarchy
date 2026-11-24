"use client";

import React from "react";
import { db } from "@/lib/data-store";
import { MoneyDisplay } from "@/components/ui/money-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminPaymentsPage() {
  const transactions = db.state.transactions;

  const financeTabs = [
    { label: "Payments", href: "/admin/payments" },
    { label: "Transactions", href: "/admin/transactions" },
    { label: "Payouts", href: "/admin/payouts" },
    { label: "Refunds", href: "/admin/refunds" },
    { label: "Commissions", href: "/admin/commissions" },
    { label: "Pricing", href: "/admin/pricing" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Financial Operations Hub"
        badgeText="Stripe Integrations"
        description="Comprehensive financial ledgers, Stripe charges, automated instructor payouts, refund queues, and platform take-rates."
        tabs={financeTabs}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Payment Charge ID</th>
                <th className="p-4">Booking</th>
                <th className="p-4">Amount Processed</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-medium text-navy-950">{tx.stripe_charge_id || `ch_test_${tx.id}`}</td>
                  <td className="p-4 font-mono text-slate-600">{tx.booking_id}</td>
                  <td className="p-4 font-bold text-navy-950"><MoneyDisplay cents={tx.gross_amount} /></td>
                  <td className="p-4"><StatusBadge status={tx.status} /></td>
                  <td className="p-4 text-slate-500">{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
