"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare, Calendar, Users, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageTransition, FadeUp } from "@/components/animations";
import { formatDisplayName } from "@/lib/utils";

export default function TutorStudentsPage() {
  const { user } = useAuth();
  const tutorId = user?.id;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStudents = useCallback(async () => {
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
  }, [tutorId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Extract unique students
  const studentMap = new Map();
  bookings.forEach((b) => {
    if (b.student && !studentMap.has(b.student_id)) {
      studentMap.set(b.student_id, {
        studentId: b.student_id,
        student: b.student,
        lastBooking: b,
        totalClasses: bookings.filter((x) => x.student_id === b.student_id).length,
      });
    }
  });

  const students = Array.from(studentMap.values());

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(({ student, lastBooking }) => {
      const name = `${student.first_name || ""} ${student.last_name || ""}`.toLowerCase();
      const email = (student.email || "").toLowerCase();
      const classTitle = (lastBooking?.class_item?.title || "").toLowerCase();
      return name.includes(q) || email.includes(q) || classTitle.includes(q);
    });
  }, [students, searchQuery]);

  return (
    <PageTransition className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy-950">
            Enrolled Students Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View active learners across your 1-on-1 sessions, track completion histories, and coordinate lessons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStudents}
            disabled={loading}
            className="h-9 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {students.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search students by name, email, or class title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-white border-slate-200 rounded-xl"
          />
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading student roster...
        </div>
      ) : students.length === 0 ? (
        <FadeUp>
          <EmptyState
            icon={Users}
            title="No enrolled students yet"
            description="When students book your private tutorials or group classes, they will appear in this centralized roster."
            actionLabel="View Scheduled Classes"
            actionHref="/instructor/classes"
          />
        </FadeUp>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-navy-950">Active Students Roster</h2>
            <span className="text-xs font-semibold text-slate-400">
              {filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Enrollment Count</th>
                  <th className="p-4">Latest Class</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map(({ studentId, student, lastBooking, totalClasses }) => {
                  const studentDisplayName = formatDisplayName(student.first_name, student.last_name);

                  return (
                    <tr key={studentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 ring-1 ring-slate-200">
                            <AvatarImage src={student.avatar_url || ""} />
                            <AvatarFallback>
                              {(student.first_name || "S")[0]}{(student.last_name || "")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-navy-950">
                              {studentDisplayName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ID: {studentId.substring(0, 8)}...
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
                        <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-primary hover:bg-teal-50 gap-1.5 font-semibold">
                          <Link href={`/instructor/messages?recipientId=${studentId}`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Message</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
