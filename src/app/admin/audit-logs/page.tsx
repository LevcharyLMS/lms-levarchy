"use client";

import React from "react";
import { db } from "@/lib/data-store";
import { Card } from "@/components/ui/card";
import { History, ShieldCheck, Lock } from "lucide-react";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminAuditLogsPage() {
  const logs = db.getAuditLogs();

  const settingsTabs = [
    { label: "Configuration", href: "/admin/settings" },
    { label: "Audit Trail", href: "/admin/audit-logs" },
    { label: "Marketplace Analytics", href: "/admin/analytics" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Settings & Audit Hub"
        badgeText="Append-Only Security Log"
        description="Immutable security ledger capturing all administrative actions, verification transitions, and financial events."
        tabs={settingsTabs}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Timestamp (UTC)</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Metadata Payload</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-navy-950 block">
                      {log.actor_role || "SYSTEM"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.actor_id}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-purple-900">
                    {log.action}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800 block">
                      {log.entity_type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.entity_id}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs truncate font-mono text-[11px] text-slate-600 bg-slate-50/50 rounded">
                    {JSON.stringify(log.metadata)}
                  </td>
                  <td className="p-4 text-slate-500 font-mono">
                    {log.ip_address || "127.0.0.1"}
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
