"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { SupportTicket } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { LifeBuoy, CheckCircle2 } from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(db.getSupportTickets());
  const [notice, setNotice] = useState<string | null>(null);

  const resolveTicket = (tktId: string) => {
    const t = tickets.find((x) => x.id === tktId);
    if (t) {
      t.status = "RESOLVED";
      t.updated_at = new Date().toISOString();
      setTickets([...db.getSupportTickets()]);
      setNotice(`Ticket #${tktId} marked as RESOLVED.`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Student & Tutor Support Queue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Address inquiries regarding physical facility parking, rescheduling, and technical questions.
        </p>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-medium text-navy-950">
                    {t.id}
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-navy-950">{t.subject}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {t.category}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === "URGENT" || t.priority === "HIGH"
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="p-4 text-right">
                    {t.status !== "RESOLVED" && t.status !== "CLOSED" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => resolveTicket(t.id)}
                      >
                        Mark Resolved
                      </Button>
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
