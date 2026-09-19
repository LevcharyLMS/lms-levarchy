"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, Layers, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminCommissionsPage() {
  const [currentTier, setCurrentTier] = useState("20.00");
  const [minFee, setMinFee] = useState("5.00");
  const [tierName, setTierName] = useState("Standard Marketplace Tier 2026");
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const [history, setHistory] = useState([
    {
      id: "rule-1",
      name: "Standard Platform Tier (20%)",
      percent: 20.0,
      effectiveFrom: "2026-01-01",
      isActive: true,
      createdBy: "Alexander Vance",
    },
    {
      id: "rule-legacy",
      name: "Inaugural Launch Tier (15%)",
      percent: 15.0,
      effectiveFrom: "2025-06-01",
      isActive: false,
      createdBy: "Alexander Vance",
    },
  ]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    const newRule = {
      id: `rule-${Date.now()}`,
      name: tierName,
      percent: parseFloat(currentTier),
      effectiveFrom: new Date().toISOString().split("T")[0],
      isActive: true,
      createdBy: "Alexander Vance",
    };

    setHistory([newRule, ...history.map((h) => ({ ...h, isActive: false }))]);

    db.logAudit({
      actor_id: "usr-admin-1",
      actor_role: "ADMIN",
      action: "COMMISSION_RULE_VERSIONED",
      entity_type: "COMMISSION_RULE",
      entity_id: newRule.id,
      metadata: { new_percent: currentTier, tier_name: tierName },
    });

    setSavedSuccess(`Commission policy versioned to ${currentTier}%. Historical bookings remain locked.`);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Platform Pricing & Commission Engine
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Versioned platform commission rates and immutable historical snapshot enforcement.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedSuccess}</span>
          </div>
          <button onClick={() => setSavedSuccess(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Immutability Alert */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-3">
        <Lock className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Rule 12 Integrity Architecture:</strong>
          Any change saved below applies exclusively to FUTURE bookings. Past bookings retain their immutable locked gross, fee, and tutor payout values forever.
        </div>
      </div>

      {/* Edit Tier Form */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-purple-700" /> Version New Platform Commission Rule
          </h2>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commission Policy Name
                </label>
                <Input
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Fee (%)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="5"
                  max="40"
                  value={currentTier}
                  onChange={(e) => setCurrentTier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Tutor receives: <strong>{(100 - parseFloat(currentTier || "0")).toFixed(1)}%</strong> of gross class tuition
              </span>
              <Button type="submit" variant="default" className="font-semibold bg-purple-900 hover:bg-purple-800">
                Publish Versioned Rule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Historical Versions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-navy-950">Commission Rule History</h3>
          <span className="text-xs text-slate-400">Append-Only Version Audit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Version / Tier Name</th>
                <th className="p-4">Platform Fee</th>
                <th className="p-4">Tutor Share</th>
                <th className="p-4">Effective Date</th>
                <th className="p-4">Published By</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {history.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-semibold text-navy-950">
                    {rule.name}
                  </td>
                  <td className="p-4 font-bold text-purple-900">
                    {rule.percent.toFixed(1)}%
                  </td>
                  <td className="p-4 font-bold text-teal-700">
                    {(100 - rule.percent).toFixed(1)}%
                  </td>
                  <td className="p-4 text-slate-500">
                    {rule.effectiveFrom}
                  </td>
                  <td className="p-4 text-slate-600">
                    {rule.createdBy}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {rule.isActive ? "ACTIVE TIER" : "SUPERSEDED"}
                    </span>
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
