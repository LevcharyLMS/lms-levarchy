"use client";

import React from "react";
import { db } from "@/lib/data-store";
import { Card } from "@/components/ui/card";
import { History, ShieldCheck, Lock } from "lucide-react";

export default function AdminAuditLogsPage() {
  const logs = db.getAuditLogs();

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            System Activity Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-only security ledger capturing administrative, verification, and financial events.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-purple-700" />
          <span>Append-Only Enforced</span>
        </div>
      </div>

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
