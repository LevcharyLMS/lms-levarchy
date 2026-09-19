"use client";

import React, { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { StatCard } from "@/components/ui/stat-card";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ShieldCheck,
  UserX,
  MessageSquare,
  Clock,
  Filter,
} from "lucide-react";

export default function AdminMessageFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadFlags = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/flags");
      const data = await res.json();
      setFlags(data.flags || []);
    } catch (err) {
      console.error("Failed to load flags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleAction = async (flagId: string, status: "DISMISSED" | "WARNED" | "RESTRICTED" | "ACTIONED") => {
    try {
      const res = await fetch("/api/admin/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flagId,
          status,
          adminNotes: `Action ${status} applied by Admin at ${new Date().toISOString()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Flag updated: Marked as ${status}.`);
        if (selectedFlag && selectedFlag.id === flagId) {
          setSelectedFlag({ ...selectedFlag, status });
        }
        await loadFlags();
      }
    } catch (err) {
      console.error("Failed to action flag:", err);
    }
  };

  const filteredFlags = flags.filter((f) => {
    if (severityFilter !== "ALL" && f.severity !== severityFilter) return false;
    if (statusFilter !== "ALL" && f.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const detected = (f.detected_text || "").toLowerCase();
      const type = (f.flag_type || "").toLowerCase();
      const sender = `${f.sender_first_name || ""} ${f.sender_last_name || ""}`.toLowerCase();
      return detected.includes(q) || type.includes(q) || sender.includes(q);
    }
    return true;
  });

  const pendingCount = flags.filter((f) => f.status === "PENDING_REVIEW").length;
  const highSeverityCount = flags.filter((f) => f.severity === "HIGH").length;
  const actionedCount = flags.filter((f) => f.status !== "PENDING_REVIEW").length;

  const columns: Column<any>[] = [
    {
      key: "incident_type",
      header: "Incident Type",
      render: (f: any) => (
        <div className="space-y-0.5">
          <span className="font-bold text-navy-950 block">
            {f.flag_type ? f.flag_type.replace(/_/g, " ") : "FLAGGED CONTENT"}
          </span>
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
              f.severity === "HIGH"
                ? "bg-red-100 text-red-800"
                : f.severity === "MEDIUM"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {f.severity} SEVERITY
          </span>
        </div>
      ),
    },
    {
      key: "detected_text",
      header: "Detected Snippet",
      render: (f: any) => (
        <div className="max-w-xs">
          <p className="font-mono text-xs text-slate-900 bg-amber-50/70 border border-amber-200/60 p-1.5 rounded truncate">
            &ldquo;{f.detected_text}&rdquo;
          </p>
        </div>
      ),
    },
    {
      key: "sender",
      header: "Sender",
      render: (f: any) => (
        <div>
          <p className="font-medium text-slate-900 text-xs">
            {f.sender_first_name ? `${f.sender_first_name} ${f.sender_last_name}` : "System User"}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold">{f.sender_role || "PARTICIPANT"}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Flagged At",
      render: (f: any) => (
        <span className="text-slate-500 text-xs">
          {new Date(f.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (f: any) => <StatusBadge status={f.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (f: any) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:bg-indigo-50 flex items-center gap-1"
            onClick={() => setSelectedFlag(f)}
          >
            <Eye className="w-3 h-3" />
            <span>Inspect</span>
          </Button>
          {f.status === "PENDING_REVIEW" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                onClick={() => handleAction(f.id, "WARNED")}
              >
                Warn
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleAction(f.id, "RESTRICTED")}
              >
                Restrict
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Message Safety & Moderation Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
              Rule 19 Automated Safety Filter
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Proactive automated detection and interception of off-platform phone numbers, emails, and payment solicitations.
          </p>
        </div>

        <Button
          onClick={loadFlags}
          variant="outline"
          size="sm"
          className="h-8 text-xs border-slate-200"
          disabled={loading}
        >
          Refresh Queue
        </Button>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Pending Action"
          value={pendingCount}
          subtitle="Requires compliance review"
          icon={ShieldAlert}
          variant="indigo"
        />
        <StatCard
          title="High Severity Alerts"
          value={highSeverityCount}
          subtitle="Off-platform payment or phone exchange"
          icon={AlertTriangle}
          variant="gold"
        />
        <StatCard
          title="Actioned Incidents"
          value={actionedCount}
          subtitle="Dismissed, warned, or restricted"
          icon={ShieldCheck}
          variant="emerald"
        />
      </div>

      {/* Filter Chips */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Severity:</span>
            </span>
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSeverityFilter(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  severityFilter === lvl
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lvl}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {["ALL", "PENDING_REVIEW", "WARNED", "RESTRICTED", "DISMISSED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search detected text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredFlags}
        columns={columns}
        searchKey="detected_text"
        searchPlaceholder="Filter flagged messages..."
        emptyTitle="No moderation flags found"
        emptyDescription="All marketplace conversations comply with platform policies. Suspicious patterns will trigger alerts automatically."
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedFlag}
        onClose={() => setSelectedFlag(null)}
        title="Moderation Incident Details"
        subtitle={`Flag ID: ${selectedFlag?.id || ""}`}
      >
        {selectedFlag && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Violation Category</span>
                <span className="font-bold text-navy-950">{selectedFlag.flag_type?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Severity Tier</span>
                <span className="font-bold text-red-700">{selectedFlag.severity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Current Status</span>
                <StatusBadge status={selectedFlag.status} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-navy-950 block">Intercepted Content Snippet</label>
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 text-amber-950 rounded-xl font-mono text-xs leading-relaxed">
                &ldquo;{selectedFlag.detected_text}&rdquo;
              </div>
              <p className="text-[11px] text-slate-400">
                Rule 19 checks for telephone numbers, email addresses, crypto wallets, and external URLs.
              </p>
            </div>

            {selectedFlag.message_body && (
              <div className="space-y-2">
                <label className="font-bold text-navy-950 block">Full Message Context</label>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs">
                  {selectedFlag.message_body}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-bold text-navy-950 block">Sender Information</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                <p>
                  <strong className="text-navy-950">Name:</strong> {selectedFlag.sender_first_name} {selectedFlag.sender_last_name}
                </p>
                <p>
                  <strong className="text-navy-950">Role:</strong> {selectedFlag.sender_role}
                </p>
                <p>
                  <strong className="text-navy-950">Timestamp:</strong> {new Date(selectedFlag.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedFlag.status === "PENDING_REVIEW" ? (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <span className="font-bold text-navy-950 block">Execute Moderation Decision</span>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="h-8 text-xs border-slate-200"
                    onClick={() => handleAction(selectedFlag.id, "DISMISSED")}
                  >
                    Dismiss Flag
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                    onClick={() => handleAction(selectedFlag.id, "WARNED")}
                  >
                    Send Warning
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-8 text-xs"
                    onClick={() => handleAction(selectedFlag.id, "RESTRICTED")}
                  >
                    Restrict User
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>This incident has been actioned: <strong>{selectedFlag.status}</strong></span>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
