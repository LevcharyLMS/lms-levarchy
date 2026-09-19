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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function StudentBookingsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("ALL");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellationBookingId, setCancellationBookingId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationSuccess, setCancellationSuccess] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

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

  const filteredBookings = bookings.filter((b) => {
    if (filter === "ACTIVE") return b.status === "CONFIRMED";
    if (filter === "COMPLETED") return b.status === "COMPLETED";
    if (filter === "CANCELLED") return b.status === "CANCELLED" || b.status === "REFUNDED";
    return true;
  });

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancelling(true);
      const bk = bookings.find((b) => b.id === bookingId);

      // Create refund request and execute cancellation
      await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundId: `ref-${Date.now()}`,
          bookingId,
          adminNotes: `Student self-service cancellation: ${cancellationReason}`,
        }),
      });

      setCancellationSuccess(
        `Booking ${bk?.booking_number || bookingId} cancelled successfully. Your 100% tuition refund is being processed.`
      );
      setCancellationBookingId(null);
      setCancellationReason("");
      await loadBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
    } finally {
      setCancelling(false);
    }
  };

  const upcomingCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy-950">
            My Enrolled Classes & Sessions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your schedule, launch Google Meet virtual classrooms, and view locked tuition receipts.
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
              <option value="Need to reschedule to different time">Need to reschedule to different time</option>
            </select>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="w-full text-xs h-8"
                onClick={() => setCancellationBookingId(null)}
                disabled={cancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                className="w-full text-xs h-8"
                disabled={!cancellationReason || cancelling}
                onClick={() => handleCancelBooking(cancellationBookingId)}
              >
                {cancelling ? "Processing Reversal..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((bk) => {
            const isConfirmed = bk.status === "CONFIRMED";
            const isCompleted = bk.status === "COMPLETED";

            return (
              <Card
                key={bk.id}
                className="border-slate-200/80 shadow-xs hover:border-slate-300 transition-all bg-white"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={bk.status} />
                        <StatusBadge status={bk.format} />
                        <span className="text-xs font-mono text-slate-400">
                          #{bk.booking_number}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-navy-950 mt-1">
                        {bk.class_item?.title || "Academic Mentorship Session"}
                      </h3>
                      {bk.tutor && (
                        <p className="text-xs text-slate-500">
                          Instructor:{" "}
                          <strong className="text-slate-800">
                            {bk.tutor.first_name} {bk.tutor.last_name}
                          </strong>
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right">
                      {bk.financial_snapshot && (
                        <div className="font-bold text-navy-950 text-base">
                          <MoneyDisplay cents={bk.financial_snapshot.gross_amount} />
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center md:justify-end gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Locked Snapshot (Rule 11)</span>
                      </p>
                    </div>
                  </div>

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

                    {bk.format?.includes("ONLINE") ? (
                      <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                        <Video className="w-4 h-4 shrink-0" />
                        <span>Google Meet Classroom</span>
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
                      {isCompleted && "Session completed. Review instructor to support faculty."}
                    </div>

                    <div className="flex items-center gap-2">
                      {isConfirmed && bk.format?.includes("ONLINE") && (
                        <Button
                          asChild
                          size="sm"
                          className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs"
                        >
                          <a
                            href={bk.meeting_link || "https://meet.google.com/lv-2026-meet"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Classroom</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
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
                        <Button asChild size="sm" variant="default" className="h-8 text-xs gap-1.5">
                          <Link href="/student/reviews">
                            <Star className="w-3.5 h-3.5" />
                            <span>Leave Review</span>
                          </Link>
                        </Button>
                      )}

                      <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200">
                        <Link href="/student/messages">Message Tutor</Link>
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
          description="Ready to accelerate your learning? Browse approved tutors and reserve a session."
          actionLabel="Explore Classes"
          actionHref="/classes"
        />
      )}
    </div>
  );
}
