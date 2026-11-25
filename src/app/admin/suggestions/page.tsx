"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/context/auth-context";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  BookOpen,
  Tag,
  Clock,
  Send,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

export default function AdminSuggestionsPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/taxonomy/suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Error loading suggestions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReviewSuggestion = async (
    suggestionId: string,
    action: "APPROVE" | "REJECT",
    adminNotes?: string
  ) => {
    try {
      setActionInProgress(suggestionId);
      const res = await fetch("/api/admin/taxonomy-suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestionId,
          action,
          adminId: user?.id,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process suggestion");

      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to moderate suggestion");
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingCount = suggestions.filter((s) => s.status === "PENDING").length;
  const approvedCount = suggestions.filter((s) => s.status === "APPROVED").length;
  const rejectedCount = suggestions.filter((s) => s.status === "REJECTED").length;

  const filteredSuggestions = suggestions.filter((s) => {
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && s.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (s.proposed_name || "").toLowerCase().includes(q);
      const matchNotes = (s.reason_notes || "").toLowerCase().includes(q);
      const matchCat = (s.proposed_category || s.parent_category_name || "").toLowerCase().includes(q);
      const matchInstructor = `${s.instructor_first_name || ""} ${s.instructor_last_name || ""}`.toLowerCase().includes(q);
      if (!matchName && !matchNotes && !matchCat && !matchInstructor) return false;
    }
    return true;
  });

  const academicTabs = [
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    { label: "Assignment Oversight", href: "/admin/assignments" },
    {
      label: "Curriculum Suggestions",
      href: "/admin/suggestions",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: "Post-Class Reports", href: "/admin/post-class-reports" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Academics & Curriculum Hub"
        badgeText="Curriculum Proposals"
        description="Review, verify, and approve academic categories, subjects, and grade levels proposed by instructors."
        tabs={academicTabs}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-8 text-xs border-slate-200 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Pending Approval"
          value={pendingCount}
          subtitle="Awaiting moderation"
          icon={Clock}
          variant="teal"
        />
        <StatCard
          title="Injected & Approved"
          value={approvedCount}
          subtitle="Live in catalog"
          icon={CheckCircle2}
          variant="teal"
        />
        <StatCard
          title="Rejected / Declined"
          value={rejectedCount}
          subtitle="Did not meet guidelines"
          icon={XCircle}
          variant="slate"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Search suggestions, instructors, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs pl-8 h-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-hidden"
          >
            <option value="ALL">All Types</option>
            <option value="ALL_IN_ONE">All-in-One Package</option>
            <option value="SUBJECT">Subject Only</option>
            <option value="CATEGORY">Category Only</option>
            <option value="GRADE">Grade Level Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSuggestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No suggestions found matching the current filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSuggestions.map((sugg) => (
              <div
                key={sugg.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        sugg.type === "ALL_IN_ONE"
                          ? "bg-emerald-100 text-emerald-800"
                          : sugg.type === "SUBJECT"
                          ? "bg-purple-100 text-purple-800"
                          : sugg.type === "CATEGORY"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {sugg.type === "ALL_IN_ONE"
                        ? "All-in-One Curriculum"
                        : sugg.type === "SUBJECT"
                        ? "Subject Discipline"
                        : sugg.type === "CATEGORY"
                        ? "Category Area"
                        : "Academic Grade"}
                    </span>

                    <StatusBadge status={sugg.status} />

                    <span className="font-bold text-sm text-navy-950">
                      {sugg.proposed_name || sugg.proposed_subject}
                    </span>
                  </div>

                  {/* All-in-One Details Breakdown */}
                  {sugg.type === "ALL_IN_ONE" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                        <span className="font-semibold text-navy-950">
                          {sugg.proposed_category ? (
                            <span className="text-teal-700">★ New: {sugg.proposed_category}</span>
                          ) : (
                            sugg.parent_category_name || "Existing Category"
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject</span>
                        <span className="font-semibold text-purple-700">
                          {sugg.proposed_subject || sugg.proposed_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Grade / Level</span>
                        <span className="font-semibold text-slate-800">
                          {sugg.proposed_grade ? (
                            <span className="text-blue-700">★ New: {sugg.proposed_grade}</span>
                          ) : (
                            "Standard Levels"
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    sugg.parent_category_name && (
                      <p className="text-xs text-slate-500">
                        Belongs under Category Area:{" "}
                        <strong className="text-slate-800">{sugg.parent_category_name}</strong>
                      </p>
                    )
                  )}

                  {/* Instructor Notes */}
                  {sugg.reason_notes && (
                    <div className="text-xs text-slate-600 bg-teal-50/40 p-2.5 rounded-lg border border-teal-100/60">
                      <span className="font-semibold text-teal-900 block text-[11px] mb-0.5">
                        Instructor Curriculum Description / Scope:
                      </span>
                      &ldquo;{sugg.reason_notes}&rdquo;
                    </div>
                  )}

                  {/* Admin Notes if reviewed */}
                  {sugg.admin_notes && (
                    <p className="text-[11px] text-slate-500 italic">
                      Admin note: {sugg.admin_notes}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>
                      Suggested by:{" "}
                      <strong className="text-slate-700">
                        {sugg.instructor_first_name} {sugg.instructor_last_name}
                      </strong>{" "}
                      ({sugg.instructor_email})
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(sugg.created_at).toLocaleDateString()} at{" "}
                      {new Date(sugg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Moderation Actions */}
                {sugg.status === "PENDING" && (
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionInProgress === sugg.id}
                      onClick={() => {
                        const note = prompt("Optional rejection feedback for instructor:");
                        if (note !== null) {
                          handleReviewSuggestion(sugg.id, "REJECT", note);
                        }
                      }}
                      className="h-8 text-xs border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={actionInProgress === sugg.id}
                      onClick={() => handleReviewSuggestion(sugg.id, "APPROVE")}
                      className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Inject</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
