"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function StudentCalendarPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const url = user?.id ? `/api/bookings?studentId=${user.id}` : "/api/bookings";
        const res = await fetch(url);
        const data = await res.json();
        const active = (data.bookings || []).filter((b: any) => b.status === "CONFIRMED");
        setBookings(active);
      } catch (err) {
        console.error("Failed to load calendar:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  // Compute 7 days of the current viewed week
  const today = new Date();
  const weekStart = new Date(today);
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(today.getDate() + diffToMonday + currentWeekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rawDate: d,
      isToday,
    };
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Class Schedule & Agenda
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              EST (UTC-5)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time schedule of your confirmed 1-on-1 tutoring sessions and cohort classes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-600 hover:bg-slate-200"
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              onClick={() => setCurrentWeekOffset(0)}
            >
              Current Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-600 hover:bg-slate-200"
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white">
            <Link href="/classes">Enroll in Class</Link>
          </Button>
        </div>
      </div>

      {/* Week Strip */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl text-center border transition-all ${
              d.isToday
                ? "bg-indigo-50/80 border-primary/50 shadow-xs ring-1 ring-primary/30"
                : "bg-white border-slate-200/80"
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase block ${
                d.isToday ? "text-primary" : "text-slate-400"
              }`}
            >
              {d.name}
            </span>
            <span
              className={`text-xs font-bold block mt-0.5 ${
                d.isToday ? "text-navy-950" : "text-slate-800"
              }`}
            >
              {d.date}
            </span>
            {d.isToday && (
              <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1" />
            )}
          </div>
        ))}
      </div>

      {/* Scheduled Classes Timeline */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Scheduled Sessions This Week ({bookings.length})
        </h2>

        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((bk) => (
              <Card key={bk.id} className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={bk.format} />
                      <span className="text-xs text-slate-400 font-mono">#{bk.booking_number}</span>
                    </div>
                    <h3 className="text-base font-bold text-navy-950">
                      {bk.class_item?.title || "Mentorship Session"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {new Date(bk.start_time).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(bk.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>
                        Tutor:{" "}
                        <strong className="text-slate-800">
                          {bk.tutor?.first_name} {bk.tutor?.last_name}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {bk.format?.includes("ONLINE") ? (
                      <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs">
                        <a
                          href={bk.meeting_link || "https://meet.google.com/lv-2026-meet"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Launch Meet</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs border-slate-200">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{bk.location?.name || "Physical Center"}</span>
                        </span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarIcon}
            title="No sessions scheduled for this week"
            description="Book a new session with an approved tutor or join an upcoming group cohort."
            actionLabel="Browse Available Tutors"
            actionHref="/find-tutors"
          />
        )}
      </div>
    </div>
  );
}
