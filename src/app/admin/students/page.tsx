"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { ShieldCheck, UserX, UserCheck, Loader2, Phone, MapPin, FileText } from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleUpdateVerification = async (userId: string, nextStatus: "APPROVED" | "REJECTED" | "PENDING_REVIEW") => {
    try {
      setUpdatingId(userId);
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, verificationStatus: nextStatus }),
      });

      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === userId ? { ...s, verification_status: nextStatus } : s))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const userTabs = [
    { label: "All Users", href: "/admin/users" },
    { label: "Students", href: "/admin/students" },
    { label: "Instructors", href: "/admin/instructors" },
    { label: "Applications", href: "/admin/instructor-applications" },
    { label: "Verifications", href: "/admin/verifications" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="People & Accounts Hub"
        badgeText="Enrolled Students"
        description="Student profiles, learning preferences, ID verification review, and platform access oversight."
        tabs={userTabs}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading enrolled students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No students registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Location & WhatsApp</th>
                  <th className="p-4">Grade & Goals</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Student ID Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((s) => {
                  const isUpdating = updatingId === s.id;
                  const studentProfile = Array.isArray(s.student_profiles)
                    ? s.student_profiles[0]
                    : s.student_profiles;
                  const isApproved = s.verification_status === "APPROVED";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 ring-1 ring-slate-200">
                            <AvatarImage src={s.avatar_url || ""} />
                            <AvatarFallback>
                              {(s.first_name?.[0] || "S") + (s.last_name?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-navy-950">
                              {s.first_name} {s.last_name}
                            </p>
                            <p className="text-[11px] text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="text-slate-700 font-medium">{s.city ? `${s.city}, ${s.state}` : "Not specified"}</p>
                        {s.phone && (
                          <p className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{s.phone}</span>
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-teal-800">
                          {studentProfile?.grade_level || "Standard Curriculum"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {studentProfile?.learning_goals || "General academic support"}
                        </p>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={s.account_status || "ACTIVE"} />
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : s.verification_status === "REJECTED"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{s.verification_status || "PENDING_REVIEW"}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isApproved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              disabled={isUpdating}
                              onClick={() => handleUpdateVerification(s.id, "REJECTED")}
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Revoke"}
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white min-w-[75px]"
                              disabled={isUpdating}
                              onClick={() => handleUpdateVerification(s.id, "APPROVED")}
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : "Verify ID"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
