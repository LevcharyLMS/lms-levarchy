"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
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
} from "lucide-react";

export function AdminClassReportsQueue() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING_ADMIN_REVIEW");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Email Digest State
  const [emailingInstructorId, setEmailingInstructorId] = useState<string | null>(null);
  const [emailDigestSuccess, setEmailDigestSuccess] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/class-reports?admin=true&status=${filter}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to fetch class reports queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleUpdateStatus = async (
    reportId: string,
    status: "APPROVED" | "CHANGES_REQUESTED",
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
          adminNotes: status === "APPROVED" ? "Approved for platform publishing." : "Please revise class comments.",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update report status.");
      }

      setActionNotice(
        status === "APPROVED"
          ? "Report approved and text class comments published live over the platform!"
          : "Report status set to Changes Requested."
      );
      await fetchReports();
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
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

  return (
    <div className="space-y-6">
      {/* Moderation Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Post-Class Reports Moderation Queue</span>
          </h2>
          <p className="text-xs text-slate-500">
            Review instructor post-class reports and approve text comments to publish over the platform to students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter("PENDING_ADMIN_REVIEW")}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === "PENDING_ADMIN_REVIEW"
                  ? "bg-white text-navy-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setFilter("APPROVED")}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === "APPROVED"
                  ? "bg-white text-navy-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === "ALL"
                  ? "bg-white text-navy-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Reports
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchReports}
            className="text-xs h-8 px-2.5"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {emailDigestSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailDigestSuccess}</span>
          </div>
          <button
            onClick={() => setEmailDigestSuccess(null)}
            className="underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          Loading post-class reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2">
          <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">No reports found in this status queue</p>
          <p className="text-[11px] text-slate-400">
            Post-class reports submitted by instructors after finishing sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const isPending = r.status === "PENDING_ADMIN_REVIEW";
            const isApproved = r.status === "APPROVED" || r.status === "PUBLISHED";
            const attendanceList: any[] = Array.isArray(r.attendance_records)
              ? r.attendance_records
              : [];

            return (
              <Card key={r.id} className="border-slate-200 shadow-xs hover:border-slate-300 transition-all">
                <CardContent className="p-5 space-y-4">
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950 text-sm">
                          {r.class_title || "Class Session"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                          {r.format === "VIRTUAL" ? <Video className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                          {r.format}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Instructor: <strong className="text-slate-800">{r.instructor_first_name} {r.instructor_last_name}</strong> &bull; Session Date: {new Date(r.session_date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Instructor Feedback Email Dispatcher Button */}
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
                      className="text-xs gap-1.5 h-8 border-teal-200 text-teal-800 hover:bg-teal-50"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      {emailingInstructorId === r.instructor_id ? "Sending Alert..." : "Email Feedback Report to Instructor"}
                    </Button>
                  </div>

                  {/* Text Class Comments (PUBLISHED CONTENT) */}
                  <div className="p-3.5 bg-teal-50/70 border border-teal-200/90 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        Text Class Comments (Platform Users View)
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
                        {attendanceList.map((att: any, i: number) => (
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
                            {att.studentName}: {att.status}
                          </span>
                        ))}
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
                        onClick={() => handleUpdateStatus(r.id, "CHANGES_REQUESTED")}
                        className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Request Changes
                      </Button>
                      <Button
                        size="sm"
                        disabled={processingId === r.id}
                        onClick={() => handleUpdateStatus(r.id, "APPROVED", r.instructor_id)}
                        className="text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
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
    </div>
  );
}
