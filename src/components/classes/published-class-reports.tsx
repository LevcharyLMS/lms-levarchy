"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Users,
  Video,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface PublishedClassReportsProps {
  classId: string;
}

export function PublishedClassReports({ classId }: PublishedClassReportsProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      try {
        setLoading(true);
        // GET returns only APPROVED / PUBLISHED reports for platform users
        const res = await fetch(`/api/class-reports?classId=${encodeURIComponent(classId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setReports(data.reports || []);
          }
        }
      } catch (err) {
        console.error("Failed to load class reports:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (classId) {
      loadReports();
    }

    return () => {
      isMounted = false;
    };
  }, [classId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200/60">
        Loading published session notes and teacher comments...
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50/50 rounded-xl border border-slate-200/60 space-y-1.5">
        <BookOpen className="w-6 h-6 text-slate-300 mx-auto" />
        <p className="text-xs font-semibold text-slate-600">No session reports published yet</p>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Following each session, the instructor compiles session notes, assigned practice, and text feedback comments which appear here once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Published Class Reports &amp; Teacher Comments</span>
        </h3>
        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
          {reports.length} {reports.length === 1 ? "Session Report" : "Session Reports"}
        </span>
      </div>

      <div className="space-y-4">
        {reports.map((report) => {
          const attendanceList: any[] = Array.isArray(report.attendance_records)
            ? report.attendance_records
            : [];
          const sessionDateStr = new Date(report.session_date).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <Card
              key={report.id}
              className="border-slate-200/90 shadow-xs hover:border-teal-200 transition-all overflow-hidden"
            >
              <CardContent className="p-5 space-y-4">
                {/* Session Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-600 text-white text-[10px] font-bold">
                      Session
                    </span>
                    <span className="font-bold text-navy-950 text-xs">
                      {sessionDateStr}
                    </span>
                    <span className="text-[11px] text-slate-400">&bull;</span>
                    <span className="text-[11px] text-slate-500">
                      Instructor: <strong className="text-slate-700">{report.instructor_first_name} {report.instructor_last_name}</strong>
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified &amp; Published
                  </span>
                </div>

                {/* Text Class Comments (PUBLISHED FEEDBACK OVER PLATFORM) */}
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-950 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Teacher Class Comments</span>
                  </div>
                  <p className="text-xs text-teal-950 leading-relaxed whitespace-pre-wrap">
                    {report.text_class_comments}
                  </p>
                </div>

                {/* Topics & Homework Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
                    <strong className="text-slate-800 block text-[11px] uppercase tracking-wider">
                      Topics Covered
                    </strong>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {report.topics_covered}
                    </p>
                  </div>

                  {report.homework_assigned ? (
                    <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/70 space-y-1">
                      <strong className="text-amber-900 block text-[11px] uppercase tracking-wider">
                        Assigned Homework &amp; Tasks
                      </strong>
                      <p className="text-amber-950 leading-relaxed whitespace-pre-wrap">
                        {report.homework_assigned}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
                      <strong className="text-slate-800 block text-[11px] uppercase tracking-wider">
                        Assigned Homework &amp; Tasks
                      </strong>
                      <p className="text-slate-400 italic">None assigned for this session.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
