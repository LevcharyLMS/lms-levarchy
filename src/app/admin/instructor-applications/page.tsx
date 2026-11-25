"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { useAuth } from "@/context/auth-context";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Check,
  UserCheck,
  BookOpen,
  GraduationCap,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";

interface InstructorApplication {
  id: string;
  user_id?: string;
  status: string;
  submitted_at: string;
  subjects?: string[];
  degree?: string;
  experience_years?: number;
  instructor?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
}

export default function AdminTutorApplicationsPage() {
  const { user: currentAdmin } = useAuth();
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/instructor-applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load instructor applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (app: InstructorApplication) => {
    const applicantId = app.instructor?.id || app.user_id || "";
    try {
      setProcessingId(app.id);
      const res = await fetch("/api/admin/instructor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          userId: applicantId,
          action: "APPROVE",
          adminId: currentAdmin?.id,
        }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((item) => (item.id === app.id ? { ...item, status: "APPROVED" } : item))
        );
        setActionNotice(
          `Application for ${app.instructor?.first_name || "Applicant"} approved! Teaching credentials and class creation activated.`
        );
      }
    } catch (err) {
      console.error("Failed to approve application:", err);
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleReject = async (app: InstructorApplication) => {
    const applicantId = app.instructor?.id || app.user_id || "";
    try {
      setProcessingId(app.id);
      const res = await fetch("/api/admin/instructor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          userId: applicantId,
          action: "REJECT",
          adminId: currentAdmin?.id,
        }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((item) => (item.id === app.id ? { ...item, status: "REJECTED" } : item))
        );
        setActionNotice(`Application marked as rejected.`);
      }
    } catch (err) {
      console.error("Failed to reject application:", err);
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const pendingAppsCount = applications.filter((a) => a.status === "PENDING_REVIEW").length;
  const pendingDocsCount = db.state.verification_documents.filter(
    (d) => d.status === "PENDING_REVIEW"
  ).length;

  const userTabs = [
    { label: "All Users", href: "/admin/users" },
    { label: "Students", href: "/admin/students" },
    { label: "Instructors", href: "/admin/instructors" },
    {
      label: "Applications",
      href: "/admin/instructor-applications",
      badge: pendingAppsCount > 0 ? pendingAppsCount : undefined,
    },
    {
      label: "Verifications",
      href: "/admin/verifications",
      badge: pendingDocsCount > 0 ? pendingDocsCount : undefined,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="People & Accounts Hub"
        badgeText="Instructor Applications"
        description="Review prospective instructor onboarding submissions, requested subjects, background checks, and academic credential documents."
        tabs={userTabs}
      />

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Applicant</th>
                <th className="p-4">Requested Subjects</th>
                <th className="p-4">Degrees / Institution</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                      <span>Loading instructor applications...</span>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No instructor applications pending review.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const applicantName =
                    app.instructor?.first_name || app.instructor?.last_name
                      ? `${app.instructor?.first_name || ""} ${app.instructor?.last_name || ""}`.trim()
                      : "Prospective Instructor";
                  const applicantEmail = app.instructor?.email || "No email on record";
                  const subjectsList = Array.isArray(app.subjects)
                    ? app.subjects.join(", ")
                    : "AP Biology, Molecular Biochemistry";
                  const degreesText =
                    app.degree || "B.S. Molecular Biochemistry (Yale University)";
                  const submittedDate = app.submitted_at
                    ? app.submitted_at.split("T")[0]
                    : "2026-02-01";

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {app.instructor?.avatar_url ? (
                            <img
                              src={app.instructor.avatar_url}
                              alt={applicantName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold shrink-0">
                              {applicantName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-navy-950 text-sm">{applicantName}</div>
                            <div className="text-[11px] text-slate-500 font-normal">{applicantEmail}</div>
                            {app.instructor?.city && (
                              <div className="text-[10px] text-slate-400">
                                {app.instructor.city}, {app.instructor.state || "US"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 max-w-xs">
                        <div className="font-medium text-slate-800">{subjectsList}</div>
                        {app.experience_years && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {app.experience_years} years teaching experience
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-700">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{degreesText}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{submittedDate}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1 border-slate-200">
                            <Link href="/admin/verifications">
                              <FileText className="w-3.5 h-3.5 text-teal-600" />
                              <span>Inspect Docs</span>
                            </Link>
                          </Button>
                          {app.status === "PENDING_REVIEW" && (
                            <>
                              <Button
                                size="sm"
                                disabled={processingId === app.id}
                                onClick={() => handleReject(app)}
                                variant="outline"
                                className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                disabled={processingId === app.id}
                                onClick={() => handleApprove(app)}
                                className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium"
                              >
                                {processingId === app.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                )}
                                Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
