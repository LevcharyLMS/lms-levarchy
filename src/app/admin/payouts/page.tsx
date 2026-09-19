"use client";

import React from "react";
import { db } from "@/lib/data-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { CreditCard, DollarSign } from "lucide-react";

export default function AdminPayoutsPage() {
  const payouts = [
    {
      id: "po-101",
      tutorName: "Dr. Marcus Chen",
      tutorId: "usr-tut-1",
      amountCents: 12800,
      stripeTransferId: "tr_mock_chase_4291",
      status: "COMPLETED",
      date: "2026-09-16",
    },
    {
      id: "po-102",
      tutorName: "Prof. Elena Rostova",
      tutorId: "usr-tut-2",
      amountCents: 14000,
      stripeTransferId: "tr_mock_bofa_8820",
      status: "COMPLETED",
      date: "2026-09-14",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Tutor Payout Distributions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated Stripe Connect transfers disbursed following completed class sessions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                  <td className="p-4 font-semibold text-navy-950">
                    {p.tutorName}
                  </td>
                  <td className="p-4 font-bold text-emerald-700">
                    <MoneyDisplay cents={p.amountCents} />
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    {p.stripeTransferId}
                  </td>
                  <td className="p-4 text-slate-500">
                    {p.date}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={p.status} />
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
