"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function AdminStudentsPage() {
  const students = db.getProfiles().filter((u) => u.role === "STUDENT");

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Enrolled Students Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Student profiles, learning goals, verification status, and activity.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Location</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={s.avatar_url || ""} />
                        <AvatarFallback>{s.first_name[0]}{s.last_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-navy-950">{s.first_name} {s.last_name}</p>
                        <p className="text-[11px] text-slate-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{s.city}, {s.state}</td>
                  <td className="p-4"><StatusBadge status={s.account_status} /></td>
                  <td className="p-4"><StatusBadge status={s.verification_status} /></td>
                  <td className="p-4 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
