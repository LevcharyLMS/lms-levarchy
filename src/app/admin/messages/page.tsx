"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { ShieldAlert } from "lucide-react";

export default function AdminMessagesPage() {
  const messages = db.state.messages;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          In-App Message Supervision & Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited log of student-tutor messaging with policy flag indicators.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Message ID</th>
                <th className="p-4">Sender ID</th>
                <th className="p-4">Message Content</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Flag Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-medium text-navy-950">{m.id}</td>
                  <td className="p-4 font-mono text-slate-600">{m.sender_id}</td>
                  <td className="p-4 max-w-md text-slate-800 font-sans">
                    {m.body}
                  </td>
                  <td className="p-4 text-slate-500">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="p-4">
                    {m.has_flag ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                        <ShieldAlert className="w-3 h-3" /> Flagged
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Clear
                      </span>
                    )}
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
