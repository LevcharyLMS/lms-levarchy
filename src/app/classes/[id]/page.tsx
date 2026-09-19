"use client";

import React, { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/data-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  MapPin,
  Video,
  Users,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

interface ClassPageProps {
  params: {
    id: string;
  };
}

export default function ClassDetailPage({ params }: ClassPageProps) {
  const router = useRouter();
  const classItem = db.getClassById(params.id);

  const { user } = useAuth();

  const [bookingSuccess, setBookingSuccess] = useState<{
    bookingNumber: string;
    meetUrl?: string | null;
    locationName?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Dynamic next-day selector
  const defaultDateStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [selectedTime, setSelectedTime] = useState<string>("14:00");
  const [studentNotes, setStudentNotes] = useState<string>("");

  if (!classItem) {
    notFound();
  }

  const tutor = classItem.tutor;
  const isGroup = classItem.class_type === "GROUP";
  const isVirtual = classItem.format === "VIRTUAL";
  const seatsRemaining = classItem.capacity - classItem.enrolled_count;
  const isFull = isGroup && seatsRemaining <= 0;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/classes/${params.id}`);
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      let response;
      if (isGroup) {
        response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classType: "GROUP",
            studentId: user.id,
            classId: classItem.id,
            timezone: "America/New_York",
          }),
        });
      } else {
        const startTime = new Date(`${selectedDate}T${selectedTime}:00.000Z`).toISOString();
        const endTime = new Date(new Date(startTime).getTime() + classItem.duration_minutes * 60000).toISOString();

        response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classType: "ONE_ON_ONE",
            studentId: user.id,
            tutorId: classItem.tutor_id,
            classId: classItem.id,
            startTime,
            endTime,
            timezone: "America/New_York",
            format: classItem.format,
            locationId: classItem.location_id || undefined,
            notes: studentNotes,
          }),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process booking.");
      }

      setBookingSuccess({
        bookingNumber: data.booking.booking_number,
        meetUrl: data.booking.meet_url,
        locationName: classItem.location?.name,
      });
    } catch (err: any) {
      setBookingError(err.message || "Failed to process booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
      <Link
        href="/classes"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 mb-6 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to all classes
      </Link>

      {bookingSuccess ? (
        /* BOOKING CONFIRMATION SCREEN (RULE 95) */
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm text-center max-w-xl mx-auto space-y-6 animate-accordion-down">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">
              Payment & Reservation Confirmed
            </span>
            <h2 className="text-2xl font-bold text-navy-950 mt-1">
              You&apos;re Officially Booked!
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Reference: <strong>{bookingSuccess.bookingNumber}</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-left text-xs text-slate-600 space-y-2 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Class:</span>
              <span className="font-semibold text-navy-950">{classItem.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Instructor:</span>
              <span>{tutor?.first_name} {tutor?.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Format:</span>
              <span>{classItem.format === "VIRTUAL" ? "Virtual Google Meet" : "In-Person Classroom"}</span>
            </div>
            {classItem.format === "PHYSICAL" && bookingSuccess.locationName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-800">{bookingSuccess.locationName}</span>
              </div>
            )}
          </div>

          {classItem.format === "VIRTUAL" && bookingSuccess.meetUrl && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
              <p className="text-xs text-teal-900 font-medium">
                Your dedicated Google Meet video room has been generated:
              </p>
              <Button asChild variant="default" size="sm" className="gap-1.5 w-full">
                <a href={bookingSuccess.meetUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4" /> Join Google Meet Classroom <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/student/bookings">View in Dashboard</Link>
            </Button>
            <Button asChild variant="default" className="w-full">
              <Link href="/classes">Explore More Classes</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* MAIN CLASS DETAILS & BOOKING FORM */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Class Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={classItem.class_type} />
                <StatusBadge status={classItem.format} />
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-teal-700 font-semibold">
                  {classItem.category?.name}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950">
                {classItem.title}
              </h1>

              <div className="flex items-center gap-6 text-xs text-slate-600 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{classItem.duration_minutes} minutes duration</span>
                </div>
                {classItem.format === "VIRTUAL" ? (
                  <div className="flex items-center gap-1.5 text-teal-700 font-medium">
                    <Video className="w-4 h-4 text-teal-600" />
                    <span>Dedicated Google Meet</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>{classItem.location?.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-navy-950">Class Description & Curriculum</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {classItem.description}
                </p>
              </div>

              {/* Physical Location Details (if in-person) */}
              {classItem.format === "PHYSICAL" && classItem.location && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <h4 className="font-semibold text-navy-950 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600" /> Approved Learning Facility
                  </h4>
                  <p className="text-slate-700 font-medium">{classItem.location.name}</p>
                  <p className="text-slate-500">{classItem.location.address}, {classItem.location.city}, {classItem.location.state} {classItem.location.postal_code}</p>
                  {classItem.location.directions && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      Check-in note: {classItem.location.directions}
                    </p>
                  )}
                </div>
              )}

              {/* Tutor Summary Card */}
              {tutor && (
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={tutor.avatar_url || ""} />
                      <AvatarFallback>{tutor.first_name[0]}{tutor.last_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-semibold text-navy-950">
                        Instructor: {tutor.first_name} {tutor.last_name}
                      </h4>
                      <p className="text-xs text-slate-500">{tutor.tutor_profile?.headline || "Verified Specialist"}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/tutors/${tutor.id}`}>Instructor Profile</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Authoritative Booking Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Locked Tuition
              </span>
              <MoneyDisplay cents={classItem.price} />
            </div>

            {/* Error banner */}
            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-4">
              {isGroup ? (
                /* GROUP COHORT ENROLLMENT */
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cohort Maximum:</span>
                      <span className="font-semibold text-slate-900">{classItem.capacity} students</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Currently Enrolled:</span>
                      <span className="font-semibold text-teal-700">{classItem.enrolled_count} students</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 font-bold">
                      <span>Seats Remaining:</span>
                      <span className={isFull ? "text-red-600" : "text-amber-600"}>
                        {isFull ? "Cohort Closed (Full)" : `${seatsRemaining} seats left`}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    By enrolling, your seat is reserved atomically in this cohort and protected under our 100% attendance guarantee.
                  </p>
                </div>
              ) : (
                /* 1-ON-1 SCHEDULE SELECTION */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Session Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-600 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Start Time
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-600 outline-none"
                    >
                      <option value="09:00">09:00 AM EST</option>
                      <option value="11:00">11:00 AM EST</option>
                      <option value="14:00">02:00 PM EST</option>
                      <option value="16:00">04:00 PM EST</option>
                      <option value="18:30">06:30 PM EST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Specific Learning Goals or Questions (Optional)
                    </label>
                    <textarea
                      value={studentNotes}
                      onChange={(e) => setStudentNotes(e.target.value)}
                      placeholder="e.g. Preparing for Chapter 4 test on integration..."
                      rows={2}
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Financial Snapshot Ledger Guarantee */}
              <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Immutable Financial Snapshot Guaranteed</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                  <span>24-Hour Free Cancellation Window</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={isSubmitting || isFull}
                className="w-full mt-2 font-semibold shadow-md"
              >
                {isSubmitting
                  ? "Processing Reservation..."
                  : isFull
                  ? "Cohort Full"
                  : isGroup
                  ? "Enroll in Cohort"
                  : "Book 1-on-1 Session"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
