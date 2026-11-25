"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { FileText, ExternalLink, CheckCircle2 } from "lucide-react";

export default function AdminTutorApplicationsPage() {
  const candidateTutor = db.getProfileById("usr-tut-5"); // Emily Zhao (Candidate)
  const pendingDocsCount = db.state.verification_documents.filter(
    (d) => d.status === "PENDING_REVIEW"
  ).length;

  const userTabs = [
    { label: "All Users", href: "/admin/users" },
    { label: "Students", href: "/admin/students" },
    { label: "Instructors", href: "/admin/instructors" },
    { label: "Applications", href: "/admin/instructor-applications", badge: 1 },
    {
      label: "Verifications",
      href: "/admin/verifications",
      badge: pendingDocsCount > 0 ? pendingDocsCount : undefined,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Users & Directory Hub"
        badgeText="Instructor Applications"
        description="Review prospective instructor onboarding submissions, requested subjects, and credential documents."
        tabs={userTabs}
      />

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
                <th className="p-4 text-right">Verification Review</th>
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
                <td className="p-4"><StatusBadge status="PENDING_REVIEW" /></td>
                <td className="p-4 text-right">
                  <Button asChild size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-2xs">
                    <Link href="/admin/verifications">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect Documents</span>
                    </Link>
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
