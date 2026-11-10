"use client";

import React, { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Loader2,
  Lock,
} from "lucide-react";
import { formatDisplayName } from "@/lib/utils";

interface ClassPageProps {
  params: {
    id: string;
  };
}

export default function ClassDetailPage({ params }: ClassPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [classItem, setClassItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    bookingNumber: string;
    meetUrl?: string | null;
    locationName?: string;
  } | null>(null);

  // 1-on-1 Date & Time selection
  const defaultDateStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [selectedTime, setSelectedTime] = useState<string>("14:00");
  const [studentNotes, setStudentNotes] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/classes?search=${encodeURIComponent(params.id)}`);
        // If not found via search filter, fetch direct class item
        const directRes = await fetch(`/api/classes`);
        if (directRes.ok) {
          const data = await directRes.json();
          const found = (data.classes || []).find((c: any) => c.id === params.id);
          if (isMounted) {
            setClassItem(found || null);
          }
        }
      } catch (err) {
        console.error("Failed to load class:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs text-slate-500">Loading class and schedule details...</p>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-navy-950">Class Not Found</h1>
        <p className="text-xs text-slate-500">
          This class session may have been completed, filled to capacity, or removed.
        </p>
        <Button asChild size="sm" variant="outline" className="text-xs">
          <Link href="/student/classes">Back to Available Classes</Link>
        </Button>
      </div>
    );
  }

  const tutor = classItem.tutor || classItem.instructor;
  const isGroup = classItem.class_type === "GROUP";
  const isVirtual = classItem.format === "VIRTUAL";
  const capacity = classItem.capacity || 1;
  const enrolledCount = classItem.enrolled_count || 0;
  const seatsRemaining = capacity - enrolledCount;
  const isFull = isGroup && seatsRemaining <= 0;
  const instructorDisplayName = tutor
    ? formatDisplayName(tutor.first_name, tutor.last_name)
    : "Academic Specialist";

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/classes/${params.id}`);
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const tutorId = classItem.instructor_id || classItem.tutor_id || tutor?.id;
      const duration = classItem.duration_minutes || 60;

      let bookingPayload: any = {
        studentId: user.id,
        tutorId: tutorId,
        instructorId: tutorId,
        classId: classItem.id,
        format: classItem.format,
        classType: classItem.class_type,
        locationId: classItem.location_id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
      };

      if (isGroup) {
        const start = classItem.start_time || new Date(Date.now() + 86400000).toISOString();
        const end = classItem.end_time || new Date(new Date(start).getTime() + duration * 60000).toISOString();
        bookingPayload.startTime = start;
        bookingPayload.endTime = end;
      } else {
        const fullDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
        const endTime = new Date(fullDateTime.getTime() + duration * 60000);
        bookingPayload.startTime = fullDateTime.toISOString();
        bookingPayload.endTime = endTime.toISOString();
        bookingPayload.notes = studentNotes;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Reservation failed. Please try again.");
      }

      setBookingSuccess({
        bookingNumber: data.booking?.booking_number || "BK-" + Math.floor(100000 + Math.random() * 900000),
        meetUrl: data.booking?.meet_url || classItem.meet_url,
        locationName: classItem.location?.name || classItem.location?.address,
      });
    } catch (err: any) {
      console.error("Booking failed:", err);
      setBookingError(err?.message || "Failed to finalize session booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
      {/* Back button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-500 hover:text-slate-800">
          <Link href="/student/classes">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Classes</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Class Overview & Instructor Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            {/* Badges & Category */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={classItem.class_type} />
                <StatusBadge status={classItem.format} />
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {classItem.category?.name || "Education"}
                </span>
              </div>
              <MoneyDisplay cents={classItem.price} className="text-xl" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
                {classItem.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {classItem.description}
              </p>
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duration</span>
                <div className="flex items-center gap-1.5 font-bold text-navy-950">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>{classItem.duration_minutes || 60} Minutes</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Format</span>
                <div className="flex items-center gap-1.5 font-bold text-navy-950">
                  {isVirtual ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-teal-600" />
                      <span>Virtual Meet</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>In-Person Center</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cohort Size</span>
                <div className="flex items-center gap-1.5 font-bold text-navy-950">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isGroup ? `${classItem.capacity} Students Max` : "1-on-1 Mentorship"}</span>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            {tutor && (
              <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl flex items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-white">
                    <AvatarImage src={tutor.avatar_url || ""} />
                    <AvatarFallback className="bg-teal-600 text-white font-bold">
                      {(tutor.first_name?.[0] || "I") + (tutor.last_name?.[0] || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-sm text-navy-950">
                      Taught by {instructorDisplayName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {tutor.tutor_profile?.headline || tutor.instructor_profile?.headline || "Verified Academic Instructor"}
                    </p>
                  </div>
                </div>

                {classItem.instructor_id && (
                  <Button asChild size="sm" variant="outline" className="text-xs shrink-0 bg-white hover:bg-slate-50">
                    <Link href={`/instructors/${classItem.instructor_id}`}>
                      View Profile
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Interactive Booking Form */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 shadow-md bg-white overflow-hidden sticky top-20">
            <div className="p-5 bg-navy-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 block">
                  Session Tuition
                </span>
                <span className="text-2xl font-black text-white">
                  ${((classItem.price || 0) / 100).toFixed(2)}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-400/30">
                100% Escrow Protected
              </span>
            </div>

            <CardContent className="p-6 space-y-4">
              {bookingSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Booking Confirmed!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Reference: <span className="font-mono font-bold text-teal-700">{bookingSuccess.bookingNumber}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    Your session is locked and scheduled. You can join the classroom directly from your Student Portal.
                  </p>

                  <div className="space-y-2 pt-2">
                    <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs">
                      <Link href="/student/bookings">View in My Bookings</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-xs">
                      <Link href="/student/calendar">Go to Calendar</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                      {bookingError}
                    </div>
                  )}

                  {isGroup ? (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Scheduled Cohort Time
                      </span>
                      <div className="flex items-center gap-2 text-xs font-bold text-navy-950">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span>
                          {classItem.start_time
                            ? new Date(classItem.start_time).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "Scheduled Weekly Workshop"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between items-center pt-2 border-t border-slate-200">
                        <span>Seats Available:</span>
                        <span className={`font-bold ${isFull ? "text-red-600" : "text-teal-700"}`}>
                          {isFull ? "Class Full" : `${seatsRemaining} Seats Remaining`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Choose Session Date</label>
                        <Input
                          type="date"
                          min={defaultDateStr}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Choose Time Slot</label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        >
                          <option value="09:00">09:00 AM EST</option>
                          <option value="11:00">11:00 AM EST</option>
                          <option value="14:00">02:00 PM EST</option>
                          <option value="16:00">04:00 PM EST</option>
                          <option value="18:00">06:00 PM EST</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Notes for Instructor (Optional)</label>
                        <Textarea
                          placeholder="e.g. Focus on chapter 4 problems..."
                          value={studentNotes}
                          onChange={(e) => setStudentNotes(e.target.value)}
                          className="text-xs min-h-[60px]"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || isFull}
                    className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Securing Reservation...</span>
                      </span>
                    ) : isFull ? (
                      "Cohort is Full"
                    ) : (
                      `Confirm & Book ($${((classItem.price || 0) / 100).toFixed(2)})`
                    )}
                  </Button>

                  <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Tuition locked in escrow until session completes</span>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
