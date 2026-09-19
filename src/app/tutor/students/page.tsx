"use client";

import React from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MessageSquare, Calendar, Mail } from "lucide-react";

export default function TutorStudentsPage() {
  const tutorId = "usr-tut-1";
  const bookings = db.getBookings({ tutorId });

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
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Enrolled Student Roster
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Active students enrolled in your 1-on-1 sessions and group cohorts.
        </p>
      </div>

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
                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={student.avatar_url || ""} />
                        <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-navy-950">{student.first_name} {student.last_name}</p>
                        <p className="text-[11px] text-slate-400">{student.city}, {student.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <p>{student.email}</p>
                    <p className="text-[11px] text-slate-400">{student.phone || "No phone on file"}</p>
                  </td>
                  <td className="p-4 font-semibold text-navy-950">
                    {totalClasses} session{totalClasses > 1 ? "s" : ""}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{lastBooking.class_item?.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(lastBooking.start_time).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
                      <Link href="/tutor/messages">
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </Link>
                    </Button>
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
