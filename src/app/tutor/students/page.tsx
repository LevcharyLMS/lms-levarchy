"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare, Calendar, Users, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageTransition, FadeUp } from "@/components/animations";

export default function TutorStudentsPage() {
  const { user } = useAuth();
  const tutorId = user?.id;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const url = tutorId ? `/api/bookings?tutorId=${tutorId}` : "/api/bookings";
      const res = await fetch(url);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [tutorId]);

  // Extract unique students
  const studentMap = new Map();
  bookings.forEach((b) => {
    if (b.student && !studentMap.has(b.student_id)) {
      studentMap.set(b.student_id, {
        student: b.student,
        lastBooking: b,
        totalClasses: bookings.filter((x) => x.student_id === b.student_id).length,
      });
    }
  });

  const students = Array.from(studentMap.values());

  return (
    <PageTransition className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Enrolled Student Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active students enrolled in your 1-on-1 sessions and group cohorts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadStudents}
          disabled={loading}
          className="h-8 text-xs border-slate-200 gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Roster</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading student roster from live database...
        </div>
      ) : students.length === 0 ? (
        <FadeUp>
          <EmptyState
            icon={Users}
            title="No enrolled students yet"
            description="Students will appear here once they complete confirmed bookings in your published classes."
            actionLabel="Manage Your Classes"
            actionHref="/tutor/classes"
          />
        </FadeUp>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Total Sessions</th>
                  <th className="p-4">Latest Class</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map(({ student, lastBooking, totalClasses }) => (
                  <tr key={student.id || lastBooking.student_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={student.avatar_url || ""} />
                          <AvatarFallback>
                            {(student.first_name || "S")[0]}{(student.last_name || "")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-navy-950">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            ID: {lastBooking.student_id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {student.email || "Confidential"}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-navy-950">{totalClasses}</span> class{totalClasses === 1 ? "" : "es"}
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800">
                          {lastBooking.class_item?.title || "Academic Tutorial"}
                        </p>
                        <StatusBadge status={lastBooking.status} />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-primary gap-1">
                        <Link href="/tutor/messages">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
