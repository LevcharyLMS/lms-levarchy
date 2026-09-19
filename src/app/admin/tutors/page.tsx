"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserX, UserCheck, Eye } from "lucide-react";

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState(db.getTutors());

  const toggleApproval = (userId: string, currentApproved: boolean) => {
    const tp = db.state.tutor_profiles.find((t) => t.user_id === userId);
    if (tp) {
      tp.is_approved = !currentApproved;
      db.logAudit({
        actor_id: "usr-admin-1",
        actor_role: "ADMIN",
        action: `TUTOR_APPROVAL_${!currentApproved ? "GRANTED" : "REVOKED"}`,
        entity_type: "TUTOR_PROFILE",
        entity_id: userId,
      });
      setTutors([...db.getTutors()]);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Certified Tutor Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Faculty directory, verification oversight, and teaching authorization.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
              {tutors.map((t) => (
                <tr key={t.user_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={t.user?.avatar_url || ""} />
                        <AvatarFallback>{t.user?.first_name[0]}{t.user?.last_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-navy-950">{t.user?.first_name} {t.user?.last_name}</p>
                        <p className="text-[11px] text-slate-400">{t.user?.city}, {t.user?.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><StatusBadge status={t.preferred_format} /></td>
                  <td className="p-4 font-bold text-navy-950">
                    <MoneyDisplay cents={t.hourly_rate} label="/hr" />
                  </td>
                  <td className="p-4">
                    <RatingStars rating={t.rating_avg} count={t.reviews_count} />
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.is_approved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.is_approved ? "APPROVED FACULTY" : "PENDING AUDIT"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                        <Link href={`/tutors/${t.user_id}`}>View</Link>
                      </Button>
                      <Button
                        variant={t.is_approved ? "destructive" : "default"}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => toggleApproval(t.user_id, t.is_approved)}
                      >
                        {t.is_approved ? "Revoke" : "Authorize"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
