"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/ui/stat-card";
import {
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Video,
  AlertCircle,
  Eye,
  Check,
  RefreshCw,
  Send,
  Mail,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  X,
  FileCheck,
} from "lucide-react";

export function AdminClassReportsQueue({
  onPendingCountChange,
}: {
  onPendingCountChange?: (count: number) => void;
}) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_ADMIN_REVIEW");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Email Digest State
  const [emailingInstructorId, setEmailingInstructorId] = useState<string | null>(null);
  const [emailDigestSuccess, setEmailDigestSuccess] = useState<string | null>(null);

  // Request Changes Dialog State
  const [revisionReport, setRevisionReport] = useState<any | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/class-reports?admin=true&status=ALL`);
      const data = await res.json();
      const allReports = data.reports || [];
      setReports(allReports);

      const pending = allReports.filter((r: any) => r.status === "PENDING_ADMIN_REVIEW").length;
      if (onPendingCountChange) {
        onPendingCountChange(pending);
      }
    } catch (err) {
      console.error("Failed to fetch class reports queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (
    reportId: string,
    status: "APPROVED" | "CHANGES_REQUESTED",
    customNotes?: string,
    instructorId?: string
  ) => {
    try {
      setProcessingId(reportId);
      setActionNotice(null);

      const res = await fetch("/api/class-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          adminReviewerId: "usr-admin-1",
          adminNotes:
            customNotes ||
            (status === "APPROVED"
              ? "Approved for platform publishing."
              : "Please revise class comments according to pedagogical standards."),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update report status.");
      }

      setActionNotice(
        status === "APPROVED"
          ? "Report approved and comments published live to enrolled students!"
          : "Report status set to Changes Requested and instructor notified."
      );
      await fetchReports();
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionReport) return;
    try {
      setSubmittingRevision(true);
      await handleUpdateStatus(
        revisionReport.id,
        "CHANGES_REQUESTED",
        revisionNotes.trim() || undefined,
        revisionReport.instructor_id
      );
      setRevisionReport(null);
      setRevisionNotes("");
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleEmailInstructorReport = async (instructorId: string, instructorName: string) => {
    try {
      setEmailingInstructorId(instructorId);
      setEmailDigestSuccess(null);

      const res = await fetch("/api/reviews/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, sendEmail: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch review report email.");
      }

      setEmailDigestSuccess(
        `Dispatched student feedback review report email to ${instructorName} (${data.report?.instructorEmail || "verified email"}).`
      );
    } catch (err: any) {
      setActionNotice(`Email dispatch error: ${err.message}`);
    } finally {
      setEmailingInstructorId(null);
    }
  };

  // KPIs
  const totalReportsCount = reports.length;
  const pendingReportsCount = reports.filter((r) => r.status === "PENDING_ADMIN_REVIEW").length;
  const approvedReportsCount = reports.filter((r) => r.status === "APPROVED" || r.status === "PUBLISHED").length;

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== "ALL") {
        if (statusFilter === "PENDING_ADMIN_REVIEW" && r.status !== "PENDING_ADMIN_REVIEW") return false;
        if (statusFilter === "APPROVED" && r.status !== "APPROVED" && r.status !== "PUBLISHED") return false;
        if (statusFilter === "CHANGES_REQUESTED" && r.status !== "CHANGES_REQUESTED") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (r.class_title || "").toLowerCase().includes(q);
        const matchInstructor = `${r.instructor_first_name || ""} ${r.instructor_last_name || ""}`.toLowerCase().includes(q);
        const matchTopics = (r.topics_covered || "").toLowerCase().includes(q);
        const matchComments = (r.text_class_comments || "").toLowerCase().includes(q);
        if (!matchTitle && !matchInstructor && !matchTopics && !matchComments) return false;
      }

      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Pending Moderation"
          value={pendingReportsCount}
          subtitle={pendingReportsCount > 0 ? "Requires admin publication" : "All reports moderated"}
          icon={Clock}
          variant={pendingReportsCount > 0 ? "amber" : "slate"}
        />
        <StatCard
          title="Approved & Published"
          value={approvedReportsCount}
          subtitle="Live on student & parent portals"
          icon={CheckCircle2}
          variant="teal"
        />
        <StatCard
          title="Total Session Reports"
          value={totalReportsCount}
          subtitle="Verified pedagogical records"
          icon={FileCheck}
          variant="teal"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search class title, instructor, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-8 h-8 bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-hidden font-medium"
          >
            <option value="ALL">All Reports ({reports.length})</option>
            <option value="PENDING_ADMIN_REVIEW">Pending Review ({pendingReportsCount})</option>
            <option value="APPROVED">Approved &amp; Live ({approvedReportsCount})</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchReports}
            className="text-xs h-8 px-2.5 border-slate-200 text-slate-600 hover:text-slate-900"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-1.5">Refresh</span>
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="underline font-semibold hover:text-teal-950">
            Dismiss
          </button>
        </div>
      )}

      {emailDigestSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailDigestSuccess}</span>
          </div>
          <button onClick={() => setEmailDigestSuccess(null)} className="underline font-semibold hover:text-emerald-950">
            Dismiss
          </button>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading post-class reports...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-slate-200 space-y-2">
          <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">No reports found matching criteria</p>
          <p className="text-[11px] text-slate-400">
            Post-class reports submitted by instructors after finishing sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((r) => {
            const isPending = r.status === "PENDING_ADMIN_REVIEW";
            const isApproved = r.status === "APPROVED" || r.status === "PUBLISHED";
            const attendanceList: any[] = Array.isArray(r.attendance_records)
              ? r.attendance_records
              : [];

            return (
              <Card key={r.id} className="border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
                <CardContent className="p-5 space-y-4">
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-navy-950 text-sm">
                          {r.class_title || "Class Session"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                          {r.format === "VIRTUAL" ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                          {r.format}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isApproved ? "Approved & Live" : isPending ? "Pending Review" : r.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Instructor: <strong className="text-slate-800">{r.instructor_first_name} {r.instructor_last_name}</strong> • Session Date: {new Date(r.session_date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Email Dispatcher Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={emailingInstructorId === r.instructor_id}
                      onClick={() =>
                        handleEmailInstructorReport(
                          r.instructor_id,
                          `${r.instructor_first_name} ${r.instructor_last_name}`
                        )
                      }
                      className="text-xs gap-1.5 h-8 border-teal-200 text-teal-800 hover:bg-teal-50 self-start sm:self-auto shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      <span>{emailingInstructorId === r.instructor_id ? "Sending..." : "Email Report"}</span>
                    </Button>
                  </div>

                  {/* Text Class Comments */}
                  <div className="p-3.5 bg-teal-50/70 border border-teal-200/90 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        Platform Feedback &amp; Student Comments
                      </span>
                      {isApproved && (
                        <span className="text-[10px] text-teal-800 font-semibold bg-teal-100/80 px-2 py-0.5 rounded border border-teal-300">
                          Active on Platform
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-teal-950 whitespace-pre-wrap leading-relaxed">
                      {r.text_class_comments}
                    </p>
                  </div>

                  {/* Topics & Attendance Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                      <strong className="text-slate-700 block">Topics Covered:</strong>
                      <p className="text-slate-600 whitespace-pre-wrap">{r.topics_covered}</p>
                      {r.homework_assigned && (
                        <>
                          <strong className="text-slate-700 block mt-2">Homework / Tasks:</strong>
                          <p className="text-slate-600 whitespace-pre-wrap">{r.homework_assigned}</p>
                        </>
                      )}
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                      <strong className="text-slate-700 block">Attendance Records ({attendanceList.length}):</strong>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                        {attendanceList.length > 0 ? (
                          attendanceList.map((att: any, i: number) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                att.status === "PRESENT"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : att.status === "LATE"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-red-50 text-red-800 border-red-200"
                              }`}
                            >
                              {att.studentName || `Student #${i + 1}`}: {att.status}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">No specific student marks logged</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin Approval Actions */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingId === r.id}
                        onClick={() => {
                          setRevisionReport(r);
                          setRevisionNotes("");
                        }}
                        className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Request Changes
                      </Button>
                      <Button
                        size="sm"
                        disabled={processingId === r.id}
                        onClick={() => handleUpdateStatus(r.id, "APPROVED", undefined, r.instructor_id)}
                        className="text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-2xs font-medium"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {processingId === r.id ? "Publishing..." : "Approve & Publish to Platform"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Request Changes Modal */}
      {revisionReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy-950">Request Report Revisions</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send constructive feedback to <strong>{revisionReport.instructor_first_name} {revisionReport.instructor_last_name}</strong>.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmRevision} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Revision Instructions *</label>
                <Textarea
                  placeholder="e.g. Please clarify homework assignment due date and refine the student feedback phrasing..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  required
                  className="text-xs min-h-[90px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRevisionReport(null)}
                  disabled={submittingRevision}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingRevision || !revisionNotes.trim()}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium"
                >
                  {submittingRevision ? "Submitting..." : "Send Revision Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
