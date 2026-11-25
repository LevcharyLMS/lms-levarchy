"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { useAuth } from "@/context/auth-context";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { FileText, ExternalLink, CheckCircle2, XCircle, Check, ShieldCheck } from "lucide-react";

export default function AdminTutorApplicationsPage() {
  const { user: currentAdmin } = useAuth();
  const [candidateTutor, setCandidateTutor] = useState(db.getProfileById("usr-tut-5"));
  const [appStatus, setAppStatus] = useState<string>("PENDING_REVIEW");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const pendingDocsCount = db.state.verification_documents.filter(
    (d) => d.status === "PENDING_REVIEW"
  ).length;

  const handleApprove = (userId: string) => {
    setAppStatus("APPROVED");
    db.updateProfile(userId, { verification_status: "APPROVED", account_status: "ACTIVE" });
    const tutorProfile = db.state.instructor_profiles.find((p) => p.user_id === userId);
    if (tutorProfile) tutorProfile.is_approved = true;

    db.logAudit({
      actor_id: currentAdmin?.id || "usr-admin-1",
      actor_role: "ADMIN",
      action: "INSTRUCTOR_APPLICATION_APPROVED",
      entity_type: "INSTRUCTOR_APPLICATION",
      entity_id: userId,
      metadata: { status: "APPROVED" },
    });

    setActionNotice("Instructor application approved! Teaching privileges and live class creation authorized.");
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleReject = (userId: string) => {
    setAppStatus("REJECTED");
    db.updateProfile(userId, { verification_status: "REJECTED" });

    db.logAudit({
      actor_id: currentAdmin?.id || "usr-admin-1",
      actor_role: "ADMIN",
      action: "INSTRUCTOR_APPLICATION_REJECTED",
      entity_type: "INSTRUCTOR_APPLICATION",
      entity_id: userId,
      metadata: { status: "REJECTED" },
    });

    setActionNotice("Instructor application marked as rejected.");
    setTimeout(() => setActionNotice(null), 5000);
  };

  const userTabs = [
    { label: "All Users", href: "/admin/users" },
    { label: "Students", href: "/admin/students" },
    { label: "Instructors", href: "/admin/instructors" },
    {
      label: "Applications",
      href: "/admin/instructor-applications",
      badge: appStatus === "PENDING_REVIEW" ? 1 : undefined,
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
        description="Review prospective instructor onboarding submissions, requested subjects, and credential documents."
        tabs={userTabs}
      />

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
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 font-semibold text-navy-950">
                  {candidateTutor?.first_name} {candidateTutor?.last_name}
                  <span className="block text-[11px] text-slate-400 font-normal">{candidateTutor?.email}</span>
                </td>
                <td className="p-4 text-slate-700">AP Biology, Molecular Biochemistry</td>
                <td className="p-4 text-slate-700">B.S. Molecular Biochemistry (Yale University)</td>
                <td className="p-4 text-slate-500">2026-02-01</td>
                <td className="p-4"><StatusBadge status={appStatus} /></td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1 border-slate-200">
                      <Link href="/admin/verifications">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span>Inspect Docs</span>
                      </Link>
                    </Button>
                    {appStatus === "PENDING_REVIEW" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleReject(candidateTutor?.id || "usr-tut-5")}
                          variant="outline"
                          className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(candidateTutor?.id || "usr-tut-5")}
                          className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
