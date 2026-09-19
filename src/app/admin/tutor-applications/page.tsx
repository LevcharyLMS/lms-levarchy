"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function AdminTutorApplicationsPage() {
  const candidateTutor = db.getProfileById("usr-tut-5"); // Emily Zhao (Candidate)

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Incoming Tutor Applications
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review application submissions and inspect credential verification documents.
        </p>
      </div>

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
                  <Button asChild variant="default" size="sm" className="h-8 text-xs bg-purple-900 hover:bg-purple-800">
                    <Link href="/admin/verifications">Inspect Documents</Link>
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
