"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { useAuth } from "@/context/auth-context";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { Textarea } from "@/components/ui/textarea";
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
  AlertCircle,
  Eye,
  DollarSign,
  Mail,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";

interface InstructorApplication {
  id: string;
  user_id?: string;
  status: string;
  submitted_at: string;
  subjects?: string[];
  degree?: string;
  degrees?: string;
  experience_years?: number;
  bio?: string;
  teaching_statement?: string;
  requested_hourly_rate?: number;
  rejection_reason?: string;
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

  // Detail Modal State
  const [selectedApp, setSelectedApp] = useState<InstructorApplication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Rejection Dialog State
  const [rejectingApp, setRejectingApp] = useState<InstructorApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

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
        if (selectedApp && selectedApp.id === app.id) {
          setSelectedApp({ ...selectedApp, status: "APPROVED" });
        }
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

  const promptReject = (app: InstructorApplication) => {
    setRejectingApp(app);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectingApp) return;
    const applicantId = rejectingApp.instructor?.id || rejectingApp.user_id || "";

    try {
      setProcessingId(rejectingApp.id);
      const res = await fetch("/api/admin/instructor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: rejectingApp.id,
          userId: applicantId,
          action: "REJECT",
          rejectionReason: rejectionReason.trim() || "Qualifications or document submission criteria not met.",
          adminId: currentAdmin?.id,
        }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((item) =>
            item.id === rejectingApp.id
              ? { ...item, status: "REJECTED", rejection_reason: rejectionReason }
              : item
          )
        );
        if (selectedApp && selectedApp.id === rejectingApp.id) {
          setSelectedApp({ ...selectedApp, status: "REJECTED", rejection_reason: rejectionReason });
        }
        setActionNotice(`Application marked as rejected. Feedback logged for applicant.`);
      }
    } catch (err) {
      console.error("Failed to reject application:", err);
    } finally {
      setProcessingId(null);
      setIsRejectModalOpen(false);
      setRejectingApp(null);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const openApplicationDetail = (app: InstructorApplication) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
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
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                      <span>Loading instructor applications...</span>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-navy-950">No Applications at the Moment</h4>
                      <p className="text-xs text-slate-400">
                        There are currently no new instructor onboarding submissions waiting for review. All candidate profiles are up to date.
                      </p>
                    </div>
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
                    app.degree || app.degrees || "B.S. Molecular Biochemistry (Yale University)";
                  const submittedDate = app.submitted_at
                    ? app.submitted_at.split("T")[0]
                    : "2026-02-01";

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => openApplicationDetail(app)}
                        >
                          {app.instructor?.avatar_url ? (
                            <img
                              src={app.instructor.avatar_url}
                              alt={applicantName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0 group-hover:border-teal-500 transition-colors"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold shrink-0">
                              {applicantName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-navy-950 text-sm group-hover:text-teal-700 transition-colors">
                              {applicantName}
                            </div>
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
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1 border-slate-200 text-slate-600"
                            onClick={() => openApplicationDetail(app)}
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600" />
                            <span>Inspect</span>
                          </Button>
                          {app.status === "PENDING_REVIEW" && (
                            <>
                              <Button
                                size="sm"
                                disabled={processingId === app.id}
                                onClick={() => promptReject(app)}
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

      {/* Application Detail Modal Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedApp ? `${selectedApp.instructor?.first_name || ""} ${selectedApp.instructor?.last_name || ""}` : "Application Review"}
        subtitle={selectedApp?.instructor?.email}
        widthClass="max-w-lg"
      >
        {selectedApp && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Header Identity Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg shadow-xs overflow-hidden">
                {selectedApp.instructor?.avatar_url ? (
                  <img src={selectedApp.instructor.avatar_url} alt="Applicant" className="w-full h-full object-cover" />
                ) : (
                  <span>{selectedApp.instructor?.first_name?.[0] || "A"}</span>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-navy-950">
                  {selectedApp.instructor?.first_name} {selectedApp.instructor?.last_name}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{selectedApp.instructor?.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{selectedApp.instructor?.city ? `${selectedApp.instructor.city}, ${selectedApp.instructor.state || "US"}` : "Remote"}</span>
                </div>
              </div>
            </div>

            {/* Requested Hourly Rate & Experience */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider block">
                  Requested Hourly Rate
                </span>
                <span className="font-bold text-navy-950 text-base">
                  ${((selectedApp.requested_hourly_rate || 4500) / 100).toFixed(2)} / hr
                </span>
              </div>
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-purple-800 uppercase tracking-wider block">
                  Teaching Experience
                </span>
                <span className="font-bold text-navy-950 text-base">
                  {selectedApp.experience_years || 4} Years
                </span>
              </div>
            </div>

            {/* Candidate Bio */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-navy-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Candidate Bio & Educational Background</span>
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {selectedApp.bio ||
                  "Passionate educator with an extensive background in STEM curriculum, standardized exam coaching, and one-on-one tailored student mentorship."}
              </p>
              <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span><strong>Degrees: </strong>{selectedApp.degree || selectedApp.degrees || "B.S. Molecular Biochemistry (Yale University)"}</span>
              </div>
            </div>

            {/* Teaching Methodology Statement */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-navy-950 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-700" />
                <span>Teaching Philosophy & Methodology</span>
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                &ldquo;{selectedApp.teaching_statement ||
                  "I emphasize first-principles conceptual understanding followed by deliberate practice and real-world problem solving. Every student learns at an individualized cadence."}&rdquo;
              </p>
            </div>

            {/* Inspect Verification Docs Button */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-navy-950 text-xs">Credentials & Gov ID</span>
              </div>
              <Button asChild size="sm" variant="outline" className="h-7 text-xs border-slate-200">
                <Link href="/admin/verifications">Inspect Docs</Link>
              </Button>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              {selectedApp.status === "PENDING_REVIEW" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                    onClick={() => promptReject(selectedApp)}
                  >
                    Reject Application
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium"
                    onClick={() => handleApprove(selectedApp)}
                  >
                    Approve Application
                  </Button>
                </>
              )}
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

      {/* Rejection Prompt Dialog Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-navy-950">Reject Instructor Application</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provide an explanation for the candidate regarding what requirements were missing or why the application was declined.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Rejection Reason & Candidate Feedback (Optional):
              </label>
              <Textarea
                placeholder="e.g. Scanned university degree was unreadable or missing official registrar seal..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-200"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectingApp(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs bg-rose-600 hover:bg-rose-700"
                onClick={confirmReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
