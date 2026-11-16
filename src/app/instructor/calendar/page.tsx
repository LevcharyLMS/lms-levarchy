"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Clock,
  Video,
  MapPin,
  ExternalLink,
  RefreshCw,
  Calendar as CalendarIcon,
  QrCode,
  CheckCircle2,
  Play,
  CheckSquare,
  AlertCircle,
  X,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageTransition, FadeUp } from "@/components/animations";
import { formatDisplayName } from "@/lib/utils";

export default function TutorCalendarPage() {
  const { user } = useAuth();
  const tutorId = user?.id;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // QR Modal State
  const [qrModalData, setQrModalData] = useState<{
    booking: any;
    qrImageUrl: string;
    token: string;
    expiresAt: string;
  } | null>(null);
  const [generatingQr, setGeneratingQr] = useState(false);

  // Reschedule Modal State
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const url = tutorId ? `/api/bookings?tutorId=${tutorId}` : "/api/bookings";
      const res = await fetch(url);
      const data = await res.json();
      // Show active sessions: CONFIRMED, IN_PROGRESS, POSTPONED
      const activeSessions = (data.bookings || []).filter((b: any) =>
        ["CONFIRMED", "IN_PROGRESS", "POSTPONED"].includes(b.status)
      );
      setBookings(activeSessions);
    } catch (err) {
      console.error("Failed to load tutor calendar bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Generate QR Code for Physical Check-in
  const handleShowQr = async (booking: any) => {
    try {
      setGeneratingQr(true);
      const res = await fetch("/api/bookings/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_QR",
          bookingId: booking.id,
          instructorId: tutorId || booking.instructor_id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQrModalData({
          booking,
          qrImageUrl: data.qrImageUrl,
          token: data.token,
          expiresAt: data.expiresAt,
        });
      } else {
        alert(data.error || "Failed to generate attendance QR");
      }
    } catch (err) {
      console.error("QR generation error:", err);
    } finally {
      setGeneratingQr(false);
    }
  };

  // Status transitions: Start Session, Conclude Session, Manual Check-in
  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      const res = await fetch("/api/bookings/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          status: newStatus,
          actorId: tutorId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadBookings();
      } else {
        alert(data.error || "Failed to update session status");
      }
    } catch (err) {
      console.error("Status change error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Instructor Manual Check-In
  const handleManualCheckIn = async (bookingId: string) => {
    try {
      setUpdatingId(bookingId);
      const res = await fetch("/api/bookings/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MANUAL_CHECKIN",
          bookingId,
          instructorId: tutorId,
          notes: "Instructor verified student presence manually on site",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadBookings();
        if (qrModalData) setQrModalData(null);
      } else {
        alert(data.error || "Failed manual check-in");
      }
    } catch (err) {
      console.error("Manual checkin error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Propose Reschedule
  const handleProposeReschedule = async () => {
    if (!rescheduleBooking || !newDate || !newTime) return;
    try {
      setRescheduling(true);
      const startDateTime = new Date(`${newDate}T${newTime}:00`).toISOString();
      const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

      const res = await fetch("/api/bookings/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: rescheduleBooking.id,
          newStartTime: startDateTime,
          newEndTime: endDateTime,
          reason: rescheduleReason,
          requestedBy: tutorId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRescheduleBooking(null);
        setNewDate("");
        setNewTime("");
        setRescheduleReason("");
        await loadBookings();
      } else {
        alert(data.error || "Failed to propose reschedule");
      }
    } catch (err) {
      console.error("Reschedule proposal error:", err);
    } finally {
      setRescheduling(false);
    }
  };

  // Generate current week dynamically (Monday - Sunday)
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      iso: d.toISOString().split("T")[0],
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">Teaching Calendar & Live Sessions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage real-time class check-ins, physical venue attendance QR codes, and session completions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBookings}
            disabled={loading}
            className="h-9 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button asChild size="sm" className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs font-semibold">
            <Link href="/instructor/classes">
              <span>View My Classes</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Week View Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {days.map((d) => {
          const dayBookings = bookings.filter((b) => b.start_time?.startsWith(d.iso));
          return (
            <div
              key={d.iso}
              className={`p-3 rounded-xl border text-center transition-all ${
                d.isToday
                  ? "bg-teal-50/90 border-primary text-primary font-bold shadow-xs"
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
            description="You don't have any active bookings right now. Once students enroll in your classes, your schedule and QR attendance controls will appear here."
            actionLabel="View Classes"
            actionHref="/instructor/classes"
          />
        </FadeUp>
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-950">Active & Upcoming Sessions</h2>
          <div className="space-y-3">
            {bookings.map((b) => {
              const isPhysical = b.format === "PHYSICAL";
              const isInProgress = b.status === "IN_PROGRESS";
              const isPostponed = b.status === "POSTPONED";
              const studentName = formatDisplayName(b.student?.first_name, b.student?.last_name);

              return (
                <Card key={b.id} className="border-slate-200 bg-white shadow-xs overflow-hidden">
                  <CardContent className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-navy-950">{b.booking_number}</span>
                        <StatusBadge status={b.status} />
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isPhysical
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-teal-50 text-teal-800 border border-teal-200"
                          }`}
                        >
                          {isPhysical ? <MapPin className="w-3 h-3 text-amber-600" /> : <Video className="w-3 h-3 text-teal-600" />}
                          {b.format}
                        </span>
                        {b.attendance_metadata?.checked_in && (
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Checked In ({b.attendance_metadata.verification_method})
                          </span>
                        )}
                      </div>

                      <p className="font-bold text-sm text-navy-950">{b.class_item?.title || "Class Session"}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>
                            {b.start_time
                              ? new Date(b.start_time).toLocaleString("en-US", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "Scheduled"}
                          </span>
                        </span>
                        <span>• Student: <strong className="text-slate-700">{studentName}</strong></span>
                        {isPhysical && (
                          <span>
                            • Venue: <strong className="text-slate-700">{b.location?.name || "Physical Learning Hub"}</strong>
                          </span>
                        )}
                      </div>

                      {isPostponed && b.rescheduled_start_time && (
                        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Reschedule proposed: <strong>{new Date(b.rescheduled_start_time).toLocaleString()}</strong>
                            {b.reschedule_reason ? ` (${b.reschedule_reason})` : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Physical QR Generation */}
                      {isPhysical && !isInProgress && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowQr(b)}
                          disabled={generatingQr}
                          className="h-8 text-xs border-amber-300 text-amber-900 bg-amber-50/70 hover:bg-amber-100 gap-1.5 font-semibold"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-700" />
                          <span>Show Attendance QR</span>
                        </Button>
                      )}

                      {/* Virtual Join */}
                      {!isPhysical && (
                        <Button
                          asChild
                          size="sm"
                          className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs font-semibold"
                        >
                          <Link
                            href={
                              b.meet_url ||
                              `/classroom/Levchary-${encodeURIComponent(b.id)}?title=${encodeURIComponent(
                                b.class_item?.title || "Class Session"
                              )}`
                            }
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Virtual Classroom</span>
                          </Link>
                        </Button>
                      )}

                      {/* State transitions */}
                      {b.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(b.id, "IN_PROGRESS")}
                          disabled={updatingId === b.id}
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Session</span>
                        </Button>
                      )}

                      {isInProgress && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(b.id, "COMPLETED")}
                          disabled={updatingId === b.id}
                          className="h-8 text-xs bg-navy-950 hover:bg-navy-900 text-white gap-1.5 font-semibold"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Conclude & Release Escrow</span>
                        </Button>
                      )}

                      {/* Propose Reschedule */}
                      {b.status === "CONFIRMED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRescheduleBooking(b)}
                          className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                          Postpone
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Attendance QR Modal */}
      {qrModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-left">
                <h3 className="font-bold text-sm text-navy-950">In-Person Attendance QR</h3>
                <p className="text-[11px] text-slate-500 font-mono">{qrModalData.booking.booking_number}</p>
              </div>
              <button
                onClick={() => setQrModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrModalData.qrImageUrl}
                alt="Attendance Check-In QR"
                className="w-48 h-48 mx-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-navy-950">
                Ask student to scan this with their phone
              </p>
              <p className="text-[11px] text-slate-500">
                Venue: {qrModalData.booking.location?.name || "Physical Hub"}
              </p>
              <div className="text-[10px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 mt-1">
                <Compass className="w-3 h-3" />
                <span>Geofenced & Time-Limited (30 mins)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManualCheckIn(qrModalData.booking.id)}
                disabled={updatingId === qrModalData.booking.id}
                className="w-full text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
              >
                Manual Override (Student Has No Camera)
              </Button>
              <Button
                size="sm"
                onClick={() => setQrModalData(null)}
                className="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Proposal Modal */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-navy-950">Postpone / Reschedule Class</h3>
              <button
                onClick={() => setRescheduleBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Propose a new date and time for <strong>{rescheduleBooking.class_item?.title}</strong> with student{" "}
              <strong>{formatDisplayName(rescheduleBooking.student?.first_name, rescheduleBooking.student?.last_name)}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Postponing</label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Schedule conflict, venue maintenance, or student request"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleBooking(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleProposeReschedule}
                disabled={rescheduling || !newDate || !newTime}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                {rescheduling ? "Submitting..." : "Send Proposal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
