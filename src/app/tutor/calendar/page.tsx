"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Clock, Video, MapPin, ExternalLink, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageTransition, FadeUp } from "@/components/animations";

export default function TutorCalendarPage() {
  const { user } = useAuth();
  const tutorId = user?.id;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const url = tutorId ? `/api/bookings?tutorId=${tutorId}` : "/api/bookings";
      const res = await fetch(url);
      const data = await res.json();
      const confirmed = (data.bookings || []).filter((b: any) => b.status === "CONFIRMED");
      setBookings(confirmed);
    } catch (err) {
      console.error("Failed to load tutor calendar bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Generate current week dynamically (Monday - Sunday)
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dateObj: d,
      dateString: d.toISOString().split("T")[0],
    };
  });

  return (
    <PageTransition className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Teaching Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed student classes and interactive video meeting links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            disabled={loading}
            className="h-8 text-xs border-slate-200 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white">
            <Link href="/tutor/classes">Manage Classes</Link>
          </Button>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const isToday = d.dateObj.toDateString() === today.toDateString();
          const dayBookings = bookings.filter((b) => {
            if (!b.start_time) return false;
            return new Date(b.start_time).toDateString() === d.dateObj.toDateString();
          });

          return (
            <div
              key={i}
              className={`p-3 rounded-xl text-center border transition-all ${
                isToday
                  ? "bg-indigo-50/90 border-primary text-primary font-bold shadow-xs"
                  : dayBookings.length > 0
                  ? "bg-teal-50/70 border-teal-300 text-teal-950"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              <span className="text-[11px] block uppercase font-bold text-slate-400">
                {d.name}
              </span>
              <span className="text-sm font-bold block">{d.date}</span>
              {dayBookings.length > 0 && (
                <span className="text-[10px] font-semibold text-teal-700 block mt-0.5">
                  {dayBookings.length} session{dayBookings.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Scheduled Classes */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading calendar sessions...
        </div>
      ) : bookings.length === 0 ? (
        <FadeUp>
          <EmptyState
            icon={CalendarIcon}
            title="No scheduled teaching sessions"
            description="You don't have any confirmed bookings for this week. Once students enroll in your classes, your schedule will appear here."
            actionLabel="Set Availability"
            actionHref="/tutor/availability"
          />
        </FadeUp>
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-950">This Week&apos;s Confirmed Sessions</h2>
          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id} className="border-slate-200 bg-white shadow-xs">
                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-navy-950">{b.booking_number}</span>
                      <StatusBadge status={b.status} />
                      <StatusBadge status={b.format} />
                    </div>
                    <p className="font-bold text-sm text-navy-950">{b.class_item?.title || "Class Session"}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{b.start_time ? new Date(b.start_time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Scheduled"}</span>
                      </span>
                      <span>Student: {b.student?.first_name} {b.student?.last_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {b.format === "VIRTUAL" && b.meet_url ? (
                      <Button asChild size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs">
                        <a href={b.meet_url} target="_blank" rel="noopener noreferrer">
                          <Video className="w-3.5 h-3.5" />
                          <span>Launch Google Meet</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{b.location?.name || "Campus Center"}</span>
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
