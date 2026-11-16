"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  RotateCcw,
  Star,
  AlertCircle,
  CheckCircle2,
  Lock,
  QrCode,
  Scan,
  Compass,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { formatDisplayName } from "@/lib/utils";

export default function StudentBookingsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("ALL");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation State
  const [cancellationBookingId, setCancellationBookingId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationSuccess, setCancellationSuccess] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // QR Attendance Scanner / Check-in Modal State
  const [attendanceModalBooking, setAttendanceModalBooking] = useState<any | null>(null);
  const [qrInputToken, setQrInputToken] = useState("");
  const [verifyingAttendance, setVerifyingAttendance] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<{
    success: boolean;
    message: string;
    distanceMeters?: number;
  } | null>(null);

  // Reschedule Acceptance
  const [acceptingRescheduleId, setAcceptingRescheduleId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const url = user?.id ? `/api/bookings?studentId=${user.id}` : "/api/bookings";
      const res = await fetch(url);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Failed to load student bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async () => {
    if (!cancellationBookingId) return;
    try {
      setCancelling(true);
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: cancellationBookingId,
          reason: cancellationReason || "Student requested cancellation",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancellationSuccess(
          `Booking cancelled. 100% full refund initiated ($${((data.refund?.amount || 0) / 100).toFixed(2)})`
        );
      } else {
        setCancellationSuccess(`Booking cancelled. Status: ${data.refund?.status || "Processed"}`);
      }
      setCancellationBookingId(null);
      setCancellationReason("");
      await loadBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
    } finally {
      setCancelling(false);
    }
  };

  // Handle Verify Attendance (QR code scan + Device Geolocation)
  const handleVerifyAttendance = async (venueQrDirect?: string) => {
    if (!attendanceModalBooking) return;
    try {
      setVerifyingAttendance(true);
      setAttendanceResult(null);

      // Attempt to acquire high accuracy device coordinates
      let studentLat: number | null = null;
      let studentLng: number | null = null;

      if ("geolocation" in navigator) {
        try {
          const pos: GeolocationPosition = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 6000,
              enableHighAccuracy: true,
            });
          });
          studentLat = pos.coords.latitude;
          studentLng = pos.coords.longitude;
        } catch (geoErr) {
          console.warn("Geolocation skipped or permission denied:", geoErr);
        }
      }

      const res = await fetch("/api/bookings/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_ATTENDANCE",
          token: venueQrDirect ? undefined : qrInputToken.trim(),
          venueQr: venueQrDirect,
          bookingId: attendanceModalBooking.id,
          studentId: user?.id,
          studentLat,
          studentLng,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAttendanceResult({
          success: true,
          message: data.message || "Attendance verified successfully!",
          distanceMeters: data.distanceMeters,
        });
        await loadBookings();
      } else {
        setAttendanceResult({
          success: false,
          message: data.error || "Failed to verify attendance QR token.",
        });
      }
    } catch (err: any) {
      setAttendanceResult({
        success: false,
        message: err.message || "Network error verifying attendance.",
      });
    } finally {
      setVerifyingAttendance(false);
    }
  };

  // Handle Accept Reschedule
  const handleAcceptReschedule = async (bookingId: string) => {
    try {
      setAcceptingRescheduleId(bookingId);
      const res = await fetch("/api/bookings/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ACCEPT",
          bookingId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadBookings();
      } else {
        alert(data.error || "Failed to accept proposed reschedule");
      }
    } catch (err) {
      console.error("Accept reschedule error:", err);
    } finally {
      setAcceptingRescheduleId(null);
    }
  };

  const upcomingCount = bookings.filter((b) => ["CONFIRMED", "IN_PROGRESS", "POSTPONED"].includes(b.status)).length;
  const completedCount = bookings.filter((b) => ["COMPLETED", "COMMISSIONED"].includes(b.status)).length;

  const filteredBookings = bookings.filter((b) => {
    if (filter === "ACTIVE") return ["CONFIRMED", "IN_PROGRESS", "POSTPONED"].includes(b.status);
    if (filter === "COMPLETED") return ["COMPLETED", "COMMISSIONED"].includes(b.status);
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy-950">
            My Enrolled Classes & Sessions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your schedule, scan attendance QR at physical venues, and view verified classes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          {[
            { id: "ALL", label: `All (${bookings.length})` },
            { id: "ACTIVE", label: `Upcoming (${upcomingCount})` },
            { id: "COMPLETED", label: `Completed (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filter === tab.id
                  ? "bg-white text-primary shadow-xs"
                  : "text-slate-600 hover:text-navy-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {cancellationSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cancellationSuccess}</span>
          </div>
          <button
            onClick={() => setCancellationSuccess(null)}
            className="font-semibold underline text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cancellation Modal Dialog */}
      {cancellationBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" /> Cancel Scheduled Session
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under our <strong>Rule 10 24-hour refund policy</strong>, sessions cancelled with at least 24 hours notice receive a full 100% reversal back to your original payment card.
            </p>

            <select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-hidden"
            >
              <option value="">Select cancellation reason...</option>
              <option value="Schedule conflict">Schedule conflict</option>
              <option value="Topic already understood">Topic already understood</option>
              <option value="Personal emergency">Personal emergency</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellationBookingId(null)}
                className="text-xs"
              >
                Keep Session
              </Button>
              <Button
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {cancelling ? "Processing..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading your enrollments...
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((bk) => {
            const isConfirmed = bk.status === "CONFIRMED";
            const isInProgress = bk.status === "IN_PROGRESS";
            const isPostponed = bk.status === "POSTPONED";
            const isCompleted = bk.status === "COMPLETED" || bk.status === "COMMISSIONED";
            const isPhysical = bk.format === "PHYSICAL";
            const tutorName = formatDisplayName(bk.instructor?.first_name || bk.tutor?.first_name, bk.instructor?.last_name || bk.tutor?.last_name);

            return (
              <Card
                key={bk.id}
                className="border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-navy-950">
                          {bk.booking_number}
                        </span>
                        <StatusBadge status={bk.status} />
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isPhysical
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-teal-50 text-teal-800 border border-teal-200"
                          }`}
                        >
                          {isPhysical ? <MapPin className="w-3 h-3 text-amber-600" /> : <Video className="w-3 h-3 text-teal-600" />}
                          {bk.format}
                        </span>
                        {bk.attendance_metadata?.checked_in && (
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Checked In
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-navy-950">
                        {bk.class_item?.title || "Academic Class Session"}
                      </h3>

                      <p className="text-xs text-slate-500">
                        Instructor: <strong className="text-slate-800 font-semibold">{tutorName}</strong>
                      </p>
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      {bk.financial_snapshot && (
                        <div className="flex md:flex-col items-center md:items-end gap-2 md:gap-0">
                          <MoneyDisplay
                            cents={bk.financial_snapshot.gross_amount}
                            className="font-bold text-navy-950 text-base"
                          />
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center md:justify-end gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Escrow Protected (Rule 11)</span>
                      </p>
                    </div>
                  </div>

                  {/* Reschedule alert banner */}
                  {isPostponed && bk.rescheduled_start_time && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span>
                            Instructor proposed reschedule to:{" "}
                            <strong>
                              {new Date(bk.rescheduled_start_time).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </strong>
                          </span>
                          {bk.reschedule_reason && (
                            <p className="text-[11px] text-amber-700 mt-0.5">Note: {bk.reschedule_reason}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptReschedule(bk.id)}
                        disabled={acceptingRescheduleId === bk.id}
                        className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept Reschedule</span>
                      </Button>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        {new Date(bk.start_time).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        {new Date(bk.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({bk.class_item?.duration_minutes || 60}m)
                      </span>
                    </div>

                    {!isPhysical ? (
                      <div className="flex items-center gap-2 text-teal-700 font-semibold">
                        <Video className="w-4 h-4 shrink-0" />
                        <span>Interactive Classroom</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">
                          {bk.location?.name || "Physical Learning Venue"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400">
                      {isConfirmed && "Free cancellation with full refund up to 24h before class."}
                      {isInProgress && "Class is currently in session."}
                      {isCompleted && "Session completed. Review instructor to support faculty."}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Physical Attendance QR Check-in */}
                      {isPhysical && !bk.attendance_metadata?.checked_in && !isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setAttendanceModalBooking(bk);
                            setQrInputToken("");
                            setAttendanceResult(null);
                          }}
                          className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 font-semibold shadow-xs"
                        >
                          <Scan className="w-3.5 h-3.5" />
                          <span>Scan Attendance QR</span>
                        </Button>
                      )}

                      {/* Virtual Join */}
                      {(isConfirmed || isInProgress) && (!isPhysical || bk.meet_url) && (
                        <Button
                          asChild
                          size="sm"
                          className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs font-semibold"
                        >
                          <Link href={bk.meet_url || `/classroom/Levchary-${encodeURIComponent(bk.id)}?title=${encodeURIComponent(bk.class_item?.title || "Class Session")}`}>
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Classroom</span>
                          </Link>
                        </Button>
                      )}

                      {isConfirmed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setCancellationBookingId(bk.id)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          <span>Cancel & Refund</span>
                        </Button>
                      )}

                      {isCompleted && (
                        <Button asChild size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 font-semibold">
                          <Link href={`/student/reviews?bookingId=${bk.id}`}>
                            <Star className="w-3.5 h-3.5 text-amber-300" />
                            <span>Leave Review</span>
                          </Link>
                        </Button>
                      )}

                      <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200">
                        <Link href={`/student/messages?recipientId=${bk.instructor_id || bk.tutor_id}`}>
                          Message Instructor
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No bookings in this tab"
          description="Ready to accelerate your learning? Browse approved instructors and reserve a session."
          actionLabel="Explore Classes"
          actionHref="/student/classes"
        />
      )}

      {/* Student Attendance QR Modal */}
      {attendanceModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-navy-950">In-Person Attendance Check-In</h3>
              </div>
              <button
                onClick={() => setAttendanceModalBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Venue: {attendanceModalBooking.location?.name || "Physical Learning Venue"}</p>
              <p className="text-[11px] text-amber-700 flex items-center gap-1">
                <Compass className="w-3 h-3" />
                <span>Device geolocation will automatically verify physical arrival proximity (&lt; 200m).</span>
              </p>
            </div>

            {/* Attendance Options */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Option 1: Paste or Scan QR Token from Instructor Screen
                </label>
                <input
                  type="text"
                  placeholder="Paste attendance token or scanner string..."
                  value={qrInputToken}
                  onChange={(e) => setQrInputToken(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="text-center text-xs text-slate-400 font-semibold">— OR —</div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerifyAttendance("VENUE-DIRECT-CHECKIN")}
                  disabled={verifyingAttendance}
                  className="w-full text-xs border-teal-300 text-teal-800 bg-teal-50/60 hover:bg-teal-100 font-semibold gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Check In at Venue Reception Desk</span>
                </Button>
              </div>
            </div>

            {/* Attendance Result Notice */}
            {attendanceResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  attendanceResult.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : "bg-red-50 border border-red-200 text-red-900"
                }`}
              >
                {attendanceResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{attendanceResult.message}</p>
                  {attendanceResult.distanceMeters !== undefined && (
                    <p className="text-[11px] mt-0.5 opacity-80">
                      Calculated distance: {attendanceResult.distanceMeters} meters from venue.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAttendanceModalBooking(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => handleVerifyAttendance()}
                disabled={verifyingAttendance || !qrInputToken.trim()}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                {verifyingAttendance ? "Verifying..." : "Verify & Check In"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
