"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { ShieldCheck, UserX, UserCheck, Loader2 } from "lucide-react";

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/instructors");
      if (res.ok) {
        const data = await res.json();
        setInstructors(data.instructors || []);
      }
    } catch (err) {
      console.error("Failed to load instructors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const toggleApproval = async (userId: string, currentApproved: boolean) => {
    try {
      setUpdatingId(userId);
      const nextApproved = !currentApproved;
      const res = await fetch("/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, approve: nextApproved }),
      });

      if (res.ok) {
        setInstructors((prev) =>
          prev.map((inst) =>
            inst.user_id === userId
              ? {
                  ...inst,
                  is_approved: nextApproved,
                  user: {
                    ...inst.user,
                    verification_status: nextApproved ? "APPROVED" : "PENDING_REVIEW",
                  },
                }
              : inst
          )
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
    { label: "Verifications", href: "/admin/verifications", badge: "1" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Users & Directory Hub"
        badgeText="Faculty & Instructors"
        description="Directory of all instructors (tutors & faculty), verification oversight, and teaching authorization."
        tabs={userTabs}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading live instructors...</p>
          </div>
        ) : instructors.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No instructors registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Formats</th>
                  <th className="p-4">Hourly Rate</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Teaching Authorization</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {instructors.map((t) => {
                  const isUpdating = updatingId === t.user_id;
                  return (
                    <tr key={t.user_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={t.user?.avatar_url || ""} />
                            <AvatarFallback>
                              {(t.user?.first_name?.[0] || "I") + (t.user?.last_name?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-navy-950">
                              {t.user?.first_name} {t.user?.last_name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {t.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={t.preferred_format || "BOTH"} />
                      </td>
                      <td className="p-4 font-bold text-navy-950">
                        <MoneyDisplay cents={t.hourly_rate || 3500} label="/hr" />
                      </td>
                      <td className="p-4">
                        <RatingStars rating={t.rating_avg || 5} count={t.reviews_count || 0} />
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.is_approved
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t.is_approved ? "APPROVED INSTRUCTOR" : "PENDING AUDIT"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                            <Link href={`/instructors/${t.user_id}`}>View</Link>
                          </Button>
                          <Button
                            variant={t.is_approved ? "destructive" : "default"}
                            size="sm"
                            className="h-8 text-xs min-w-[85px]"
                            disabled={isUpdating}
                            onClick={() => toggleApproval(t.user_id, t.is_approved)}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                            ) : t.is_approved ? (
                              "Revoke"
                            ) : (
                              "Authorize"
                            )}
                          </Button>
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
