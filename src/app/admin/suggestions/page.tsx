"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  BookOpen,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

const REJECTION_REASONS = [
  "Duplicate curriculum: Topic is already covered under existing catalog subjects.",
  "Outside educational scope: Does not meet platform accreditation or syllabus standards.",
  "Insufficient syllabus details: Please provide comprehensive topic outline and learning goals.",
  "Misclassified taxonomy: Suggestion should be submitted under a different discipline.",
];

export default function AdminSuggestionsPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Rejection Modal State
  const [rejectingSugg, setRejectingSugg] = useState<any | null>(null);
  const [selectedReasonPreset, setSelectedReasonPreset] = useState(REJECTION_REASONS[0]);
  const [customRejectNote, setCustomRejectNote] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Approval Modal State
  const [approvingSugg, setApprovingSugg] = useState<any | null>(null);
  const [approveNote, setApproveNote] = useState("");
  const [approveSubmitting, setApproveSubmitting] = useState(false);

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
          adminId: user?.id || "usr-admin-1",
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

  const submitRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSugg) return;

    try {
      setRejectSubmitting(true);
      const fullNote = customRejectNote.trim()
        ? `${selectedReasonPreset} - Note: ${customRejectNote.trim()}`
        : selectedReasonPreset;

      await handleReviewSuggestion(rejectingSugg.id, "REJECT", fullNote);
      setRejectingSugg(null);
      setCustomRejectNote("");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const submitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingSugg) return;

    try {
      setApproveSubmitting(true);
      await handleReviewSuggestion(approvingSugg.id, "APPROVE", approveNote.trim() || "Approved by Admin");
      setApprovingSugg(null);
      setApproveNote("");
    } finally {
      setApproveSubmitting(false);
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
          <div className="flex items-center gap-2">
            <Link href="/admin/reports">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-200 text-slate-600 hover:text-slate-900 gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                <span>Reports Hub CSV</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="h-8 text-xs border-slate-200 gap-1.5 text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
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
            className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-hidden font-medium"
          >
            <option value="ALL">All Proposal Types</option>
            <option value="ALL_IN_ONE">All-in-One Package</option>
            <option value="SUBJECT">Subject Only</option>
            <option value="CATEGORY">Category Only</option>
            <option value="GRADE">Grade Level Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-hidden font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Moderation</option>
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
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Category Area</span>
                        <span className="font-semibold text-navy-950">
                          {sugg.proposed_category ? (
                            <span className="text-teal-700 font-bold">★ New: {sugg.proposed_category}</span>
                          ) : (
                            sugg.parent_category_name || "Existing Category"
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject Course</span>
                        <span className="font-semibold text-purple-700 font-bold">
                          {sugg.proposed_subject || sugg.proposed_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Grade Tier</span>
                        <span className="font-semibold text-slate-800">
                          {sugg.proposed_grade ? (
                            <span className="text-blue-700 font-bold">★ New: {sugg.proposed_grade}</span>
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
                        Instructor Curriculum Description &amp; Justification:
                      </span>
                      &ldquo;{sugg.reason_notes}&rdquo;
                    </div>
                  )}

                  {/* Admin Notes if reviewed */}
                  {sugg.admin_notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200/60 inline-block">
                      <strong>Admin note:</strong> {sugg.admin_notes}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
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
                        setRejectingSugg(sugg);
                        setSelectedReasonPreset(REJECTION_REASONS[0]);
                        setCustomRejectNote("");
                      }}
                      className="h-8 text-xs border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={actionInProgress === sugg.id}
                      onClick={() => {
                        setApprovingSugg(sugg);
                        setApproveNote("");
                      }}
                      className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve &amp; Inject</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clean Rejection Dialog Modal */}
      {rejectingSugg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy-950">Decline Curriculum Proposal</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide constructive feedback for instructor <strong>{rejectingSugg.instructor_first_name} {rejectingSugg.instructor_last_name}</strong>.
                </p>
              </div>
            </div>

            <form onSubmit={submitRejection} className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Reason Preset
                </label>
                <div className="space-y-1.5">
                  {REJECTION_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        selectedReasonPreset === reason
                          ? "border-rose-300 bg-rose-50/50 text-navy-950 font-medium"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectionReason"
                        checked={selectedReasonPreset === reason}
                        onChange={() => setSelectedReasonPreset(reason)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Additional Instructor Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Textarea
                  placeholder="Specific guidance on how the instructor can revise their class syllabus..."
                  value={customRejectNote}
                  onChange={(e) => setCustomRejectNote(e.target.value)}
                  className="text-xs min-h-[70px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectingSugg(null)}
                  disabled={rejectSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={rejectSubmitting}
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium"
                >
                  {rejectSubmitting ? "Declining..." : "Confirm Decline"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation & Approval Modal */}
      {approvingSugg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy-950">Approve &amp; Inject Proposal</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This will immediately inject <strong>&ldquo;{approvingSugg.proposed_name || approvingSugg.proposed_subject}&rdquo;</strong> into the live marketplace catalog.
                </p>
              </div>
            </div>

            <form onSubmit={submitApproval} className="space-y-3 pt-1">
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-teal-900 space-y-1">
                <div className="font-semibold">Automated Actions:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-teal-800">
                  <li>Creates new category or subject in database</li>
                  <li>Notifies instructor in real-time</li>
                  <li>Enables immediate class publishing</li>
                </ul>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Approval Note for Instructor <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  placeholder="e.g. Approved with standard curriculum guidelines."
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setApprovingSugg(null)}
                  disabled={approveSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={approveSubmitting}
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium"
                >
                  {approveSubmitting ? "Injecting..." : "Approve & Inject"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
