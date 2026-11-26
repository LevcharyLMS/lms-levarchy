"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Globe,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";

// Formatter to produce natural, human-readable sentence summaries instead of raw JSON
function formatAuditSummary(action: string, entityType: string, meta: any): string {
  if (!meta || Object.keys(meta).length === 0) {
    return `${action.replace(/_/g, " ").toLowerCase()} performed on ${entityType.toLowerCase()}`;
  }

  if (action === "PLATFORM_INITIALIZED" || action === "SYSTEM_INITIALIZED") {
    return `System initialized in ${meta.environment || "production"} (v${meta.version || "1.0.0"})`;
  }
  if (action === "USER_STATUS_SUSPENDED") {
    return `Account suspended${meta.note ? `: "${meta.note}"` : ""}`;
  }
  if (action === "USER_STATUS_ACTIVE") {
    return `Account reactivated${meta.note ? `: "${meta.note}"` : " by administrator"}`;
  }
  if (action === "PLATFORM_CONFIG_UPDATED") {
    const parts = [];
    if (meta.cancel_hours !== undefined) parts.push(`Cancel window: ${meta.cancel_hours}h`);
    if (meta.maintenance_mode !== undefined) parts.push(`Maintenance: ${meta.maintenance_mode ? "ON" : "OFF"}`);
    if (meta.platform_name) parts.push(`Brand: ${meta.platform_name}`);
    return `Settings saved: ${parts.join(", ") || "Configuration parameters updated"}`;
  }
  if (action === "LEGAL_DOCUMENT_UPDATED") {
    return `Updated "${meta.title || "legal agreement"}" (${meta.sectionsCount || 0} sections)`;
  }
  if (action === "INSTRUCTOR_APPLICATION_APPROVED") {
    return `Approved instructor application and teaching credentials authorized`;
  }
  if (action === "INSTRUCTOR_APPLICATION_REJECTED") {
    return `Rejected instructor application${meta.rejection_reason ? `: "${meta.rejection_reason}"` : ""}`;
  }
  if (action === "REFUND_PROCESSED") {
    return `Refund of $${((meta.amount_cents || 0) / 100).toFixed(2)} processed for booking`;
  }
  if (action === "ADVERT_CREATED") {
    return `Published advert "${meta.title || "Promotional Media"}" (${meta.media_type || "IMAGE"})`;
  }
  if (action === "ADVERT_ACTIVATED") {
    return `Activated advert "${meta.title || "Promotional Media"}" on homepage dock`;
  }
  if (action === "ADVERT_DEACTIVATED") {
    return `Deactivated advert "${meta.title || "Promotional Media"}"`;
  }
  if (action === "ADVERT_DELETED") {
    return `Deleted promotional advert (${meta.id || "ID"})`;
  }
  if (action === "CLASS_APPROVED") {
    return `Approved class "${meta.title || "Class Session"}" for marketplace enrollment`;
  }
  if (action === "CLASS_STATUS_CANCELLED") {
    return `Cancelled class "${meta.title || "Class Session"}"${meta.note ? `: "${meta.note}"` : ""}`;
  }
  if (action === "BOOKING_ADMIN_CANCELLED") {
    return `Admin cancelled booking #${meta.booking_number || "Reference"}${meta.note ? `: "${meta.note}"` : ""}`;
  }
  if (action === "ACADEMIC_CATEGORY_CREATED") {
    return `Created academic discipline "${meta.name || "Category"}"`;
  }
  if (action === "ACADEMIC_CATEGORY_UPDATED") {
    return `Updated academic discipline "${meta.name || "Category"}"`;
  }
  if (action === "ACADEMIC_CATEGORY_DELETED") {
    return `Deleted academic discipline (${meta.id || "ID"})`;
  }
  if (action === "ACADEMIC_SUBJECT_CREATED") {
    return `Created subject "${meta.name || "Subject"}" in discipline #${meta.category_id || "Category"}`;
  }
  if (action === "ACADEMIC_SUBJECT_DELETED") {
    return `Deleted academic subject (${meta.id || "ID"})`;
  }
  if (action === "GRADE_TIER_CREATED") {
    return `Created grade tier "${meta.name || "Grade"}" (Level ${meta.level || "1"}, ${meta.instructor_type || "BOTH"})`;
  }
  if (action === "GRADE_TIER_UPDATED") {
    return `Updated grade tier "${meta.name || "Grade"}" (Level ${meta.level || "1"})`;
  }
  if (action === "GRADE_TIER_DELETED") {
    return `Deleted grade tier (${meta.id || "ID"})`;
  }

  // Fallback: extract the most informative key-value pairs
  const summaryEntries = Object.entries(meta)
    .filter(([k]) => !k.includes("token") && !k.includes("secret"))
    .slice(0, 2)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
    .join(" • ");

  return summaryEntries || action.replace(/_/g, " ").toLowerCase();
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      } else {
        setLogs(db.getAuditLogs());
      }
    } catch {
      setLogs(db.getAuditLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs by search text and category chips
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filtering
      if (categoryFilter !== "ALL") {
        if (categoryFilter === "USER" && !log.action?.includes("USER") && !log.action?.includes("APPLICATION"))
          return false;
        if (categoryFilter === "FINANCIAL" && !log.action?.includes("REFUND") && !log.action?.includes("PAYMENT") && !log.action?.includes("COMMISSION"))
          return false;
        if (categoryFilter === "MODERATION" && !log.action?.includes("FLAG") && !log.action?.includes("REPORT") && !log.action?.includes("REVIEW"))
          return false;
        if (categoryFilter === "CONFIG" && !log.action?.includes("CONFIG") && !log.action?.includes("SETTING") && !log.action?.includes("SYSTEM") && !log.action?.includes("LEGAL"))
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
    let csvContent = "TimestampUTC,ActorRole,ActorID,Action,EntityType,EntityID,IPAddress,Description,Metadata\n";
    filteredLogs.forEach((l) => {
      const desc = formatAuditSummary(l.action, l.entity_type, l.metadata).replace(/"/g, '""');
      const meta = JSON.stringify(l.metadata || {}).replace(/"/g, '""');
      csvContent += `"${l.created_at}","${l.actor_role || "SYSTEM"}","${l.actor_id}","${l.action}","${l.entity_type}","${l.entity_id || ""}","${l.ip_address || "127.0.0.1"}","${desc}","${meta}"\n`;
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
    { label: "Legal Documents", href: "/admin/legal" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Settings & Audit Hub"
        badgeText="Append-Only Security Log"
        description="Immutable forensic ledger recording every administrative decision, verification transition, policy edit, and configuration update."
        tabs={settingsTabs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportAuditCSV}
              className="h-8 text-xs border-slate-200 gap-1.5 text-navy-950 hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5 text-purple-700" />
              <span>Export Audit CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="h-8 text-xs border-slate-200 gap-1 text-slate-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
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
          { id: "CONFIG", label: "System Config & Legal" },
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
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            Loading security audit ledger...
          </div>
        ) : filteredLogs.length === 0 ? (
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
                  <th className="p-4">Event Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => {
                  const summaryText = formatAuditSummary(log.action, log.entity_type, log.metadata);
                  const isSystem = log.actor_role === "SYSTEM";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSystem
                                ? "bg-slate-100 text-slate-700"
                                : log.actor_role === "ADMIN"
                                ? "bg-purple-100 text-purple-900"
                                : "bg-teal-100 text-teal-900"
                            }`}
                          >
                            {log.actor_role || "SYSTEM"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {log.ip_address || "127.0.0.1"}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-bold text-teal-800 text-[11px] block">
                          {log.action}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {log.entity_type}
                        </span>
                        {log.entity_id && (
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] block">
                            {log.entity_id.length > 12 ? `${log.entity_id.substring(0, 8)}...` : log.entity_id}
                          </span>
                        )}
                      </td>

                      <td className="p-4 max-w-sm">
                        <div className="text-slate-700 text-xs font-normal leading-relaxed">
                          {summaryText}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-slate-200 text-slate-600 hover:text-navy-950 gap-1"
                          onClick={() => openLogDetail(log)}
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                {formatAuditSummary(selectedLog.action, selectedLog.entity_type, selectedLog.metadata)}
              </p>
            </div>

            {/* Actor & Execution Context */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-navy-950 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-400">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Security & Actor Context</span>
              </span>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Actor Role:</span>
                  <span className="font-bold text-navy-950">{selectedLog.actor_role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Actor System ID:</span>
                  <span className="font-mono text-slate-700 truncate block" title={selectedLog.actor_id}>
                    {selectedLog.actor_id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Client IP Address:</span>
                  <span className="font-mono text-slate-700">{selectedLog.ip_address || "127.0.0.1"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Entity Identifier:</span>
                  <span className="font-mono text-slate-700 truncate block" title={selectedLog.entity_id}>
                    {selectedLog.entity_id || "SYSTEM_ROOT"}
                  </span>
                </div>
              </div>
            </div>

            {/* Structured Metadata Payload Display */}
            <div className="space-y-2">
              <span className="font-bold text-navy-950 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-400">
                <FileCode className="w-3.5 h-3.5 text-purple-700" />
                <span>Complete Event Payload (JSON)</span>
              </span>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto shadow-inner leading-relaxed">
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
