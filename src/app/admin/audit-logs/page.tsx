"use client";

import React, { useState, useMemo } from "react";
import { db } from "@/lib/data-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/shared/filter-bar";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import {
  History,
  ShieldCheck,
  Lock,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  FileCode,
  Globe
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const logs = db.getAuditLogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter logs by search text and category chips
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filtering
      if (categoryFilter !== "ALL") {
        if (categoryFilter === "USER" && !log.action.includes("USER") && !log.action.includes("APPLICATION"))
          return false;
        if (categoryFilter === "FINANCIAL" && !log.action.includes("REFUND") && !log.action.includes("PAYMENT") && !log.action.includes("COMMISSION"))
          return false;
        if (categoryFilter === "MODERATION" && !log.action.includes("FLAG") && !log.action.includes("REPORT") && !log.action.includes("REVIEW"))
          return false;
        if (categoryFilter === "CONFIG" && !log.action.includes("CONFIG") && !log.action.includes("SETTING"))
          return false;
      }

      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const actionMatch = (log.action || "").toLowerCase().includes(q);
        const actorMatch = (log.actor_id || "").toLowerCase().includes(q);
        const entityMatch = (log.entity_type || "").toLowerCase().includes(q);
        const metadataMatch = JSON.stringify(log.metadata || {}).toLowerCase().includes(q);
        return actionMatch || actorMatch || entityMatch || metadataMatch;
      }

      return true;
    });
  }, [logs, categoryFilter, searchQuery]);

  const openLogDetail = (log: any) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const exportAuditCSV = () => {
    let csvContent = "TimestampUTC,ActorRole,ActorID,Action,EntityType,EntityID,IPAddress,Metadata\n";
    filteredLogs.forEach((l) => {
      const meta = JSON.stringify(l.metadata || {}).replace(/"/g, '""');
      csvContent += `"${l.created_at}","${l.actor_role || "SYSTEM"}","${l.actor_id}","${l.action}","${l.entity_type}","${l.entity_id || ""}","${l.ip_address || "127.0.0.1"}","${meta}"\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `levchary_audit_trail_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const settingsTabs = [
    { label: "Configuration", href: "/admin/settings" },
    { label: "Audit Trail", href: "/admin/audit-logs" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Settings & Audit Hub"
        badgeText="Append-Only Security Log"
        description="Immutable forensic ledger recording every administrative decision, verification transition, and configuration update."
        tabs={settingsTabs}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={exportAuditCSV}
            className="h-8 text-xs border-slate-200 gap-1.5 text-navy-950 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 text-purple-700" />
            <span>Export Audit CSV</span>
          </Button>
        }
      />

      {/* Filter Bar with Search and Action Categories */}
      <FilterBar
        searchPlaceholder="Search audit trail by actor, action name, or target entity..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        categories={[
          { id: "USER", label: "User & Roles" },
          { id: "FINANCIAL", label: "Financials & Refunds" },
          { id: "MODERATION", label: "Moderation & Safety" },
          { id: "CONFIG", label: "System Config" },
        ]}
        selectedCategory={categoryFilter}
        onCategorySelect={setCategoryFilter}
        onReset={() => {
          setSearchQuery("");
          setCategoryFilter("ALL");
        }}
        totalCount={filteredLogs.length}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No audit log entries found matching the active search or category filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Timestamp (UTC)</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Event Details</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
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
                    <td className="p-4 font-mono font-bold text-teal-800">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">
                        {log.entity_type}
                      </span>
                      {log.entity_id && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.entity_id}
                        </span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs truncate text-[11px] text-slate-600 font-mono bg-slate-50/50 rounded">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-slate-200 text-slate-600 gap-1"
                        onClick={() => openLogDetail(log)}
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>Inspect</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Detail Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedLog ? selectedLog.action : "Audit Event"}
        subtitle={selectedLog ? `Recorded on ${new Date(selectedLog.created_at).toLocaleString()}` : ""}
        widthClass="max-w-lg"
      >
        {selectedLog && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header Event Summary Card */}
            <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-navy-950 font-mono">
                  {selectedLog.action}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                  {selectedLog.entity_type}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Action recorded in compliance with Rule 80 security audit retention standards.
              </p>
            </div>

            {/* Actor & Execution Context */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-navy-950 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-400">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Actor Credentials</span>
              </span>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Actor Role:</span>
                  <span className="font-bold text-navy-950">{selectedLog.actor_role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Actor UUID:</span>
                  <span className="font-mono text-slate-700">{selectedLog.actor_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">IP Address:</span>
                  <span className="font-mono text-slate-700">{selectedLog.ip_address || "127.0.0.1"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Entity ID:</span>
                  <span className="font-mono text-slate-700">{selectedLog.entity_id || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Structured Metadata Payload Display */}
            <div className="space-y-2">
              <span className="font-bold text-navy-950 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-400">
                <FileCode className="w-3.5 h-3.5 text-purple-700" />
                <span>Event Metadata Payload</span>
              </span>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto shadow-inner">
                <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-200"
                onClick={() => setIsDrawerOpen(false)}
              >
                Close Drawer
              </Button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
