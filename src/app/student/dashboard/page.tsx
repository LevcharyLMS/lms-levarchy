import React from "react";
import Link from "next/link";
import { SupabaseDbService } from "@/lib/supabase-db";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  let allBookings: any[] = [];
  let tutors: any[] = [];

  try {
    allBookings = await SupabaseDbService.getBookings();
  } catch (err) {
    console.error("Error fetching bookings for student dashboard:", err);
  }

  try {
    tutors = await SupabaseDbService.getApprovedTutors();
  } catch (err) {
    console.error("Error fetching tutors for student dashboard:", err);
  }

  const bookings = allBookings || [];
  const activeBookings = bookings.filter((b: any) => b?.status === "CONFIRMED");
  const completedBookings = bookings.filter((b: any) => b?.status === "COMPLETED");

  const nextClass = activeBookings[0];
  const recommendedTutors = (tutors || []).slice(0, 3);

  const totalLearningHours = completedBookings.reduce(
    (acc: number, b: any) => acc + ((b?.class_item?.duration_minutes || 60) / 60),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Welcome back, Lucas!
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ID Verified
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {activeBookings.length > 0
              ? `You have ${activeBookings.length} scheduled class sessions ready on your calendar.`
              : "Explore verified tutors and enroll in upcoming virtual or physical sessions."}
          </p>
        </div>

        {/* Quick Actions (Section 13) */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5">
            <Link href="/student/tutors">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Find Tutors</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5">
            <Link href="/student/classes">
              <Search className="w-3.5 h-3.5 text-teal-600" />
              <span>Browse Classes</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5">
            <Link href="/student/calendar">
              <Calendar className="w-3.5 h-3.5" />
              <span>View Calendar</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary Upcoming Session Card (Section 13) */}
      {nextClass ? (
        <div className="bg-gradient-to-r from-indigo-900 to-navy-900 text-white p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30">
                  Next Upcoming Session
                </span>
                <span className="text-xs font-mono text-indigo-300">
                  Ref: {nextClass.booking_number}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                {nextClass.class_item?.title || "Academic Tutorial Session"}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{nextClass?.start_time ? new Date(nextClass.start_time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Scheduled Session"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {nextClass.format === "VIRTUAL" ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-teal-300" />
                      <span>Google Meet Virtual Classroom</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      <span>{nextClass.location?.name || "Physical Learning Venue"}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {nextClass.format === "VIRTUAL" && nextClass.meet_url ? (
                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 text-xs font-bold bg-teal-500 hover:bg-teal-600 text-navy-950 gap-1.5 shadow-sm"
                >
                  <a href={nextClass.meet_url} target="_blank" rel="noopener noreferrer">
                    <Video className="w-4 h-4" />
                    <span>Launch Google Meet</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </Button>
              ) : (
                <Button asChild size="sm" variant="secondary" className="h-9 text-xs">
                  <Link href="/student/bookings">View Session Details</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="Your learning schedule is clear"
          description="You don't have any upcoming classes scheduled right now. Browse our verified faculty or enroll in small group cohort workshops."
          actionLabel="Explore Classes"
          actionHref="/student/classes"
        />
      )}

      {/* Real Statistics Row (Section 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Upcoming Sessions"
          value={activeBookings.length}
          subtitle={activeBookings.length > 0 ? "Confirmed & on calendar" : "No sessions pending"}
          icon={Calendar}
          variant="indigo"
        />
        <StatCard
          title="Completed Classes"
          value={completedBookings.length}
          subtitle={completedBookings.length > 0 ? "Eligible for student review" : "No completed classes yet"}
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Total Reservations"
          value={bookings.length}
          subtitle="All historical bookings"
          icon={BookOpen}
          variant="teal"
        />
        <StatCard
          title="Learning Hours"
          value={`${totalLearningHours}h`}
          subtitle="Instructional time completed"
          icon={Clock}
          variant="purple"
        />
      </div>

      {/* Content Split: Recommended Verified Tutors & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Verified Tutors */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-navy-950">Recommended Verified Instructors</h3>
              <p className="text-xs text-slate-500">Verified academic specialists ready for 1-on-1 tutoring</p>
            </div>
            <Link href="/student/tutors" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recommendedTutors.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No tutors available"
              description="New faculty applications are currently undergoing administrative verification."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {recommendedTutors.map((t: any) => (
                <div
                  key={t.user_id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-primary/40 transition-all bg-white flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-9 h-9 ring-2 ring-indigo-50">
                        <AvatarImage src={t.user?.avatar_url || t.avatar_url} />
                        <AvatarFallback>{t.first_name?.[0] || "T"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-navy-950 truncate">
                          {t.user?.first_name || t.first_name} {t.user?.last_name || t.last_name}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          ★ {t.rating_avg || "5.0"} • Verified
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {t.headline || t.bio || "University graduate specializing in STEM coursework."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950">
                      ${((t.hourly_rate || 7500) / 100).toFixed(2)}/hr
                    </span>
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary hover:text-primary p-0">
                      <Link href={`/tutors/${t.user_id}`}>Profile →</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification & Help Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-navy-950">Learning Status</h3>
            <p className="text-xs text-slate-500">Account compliance & platform access</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Identity Verification</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                  Approved
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your student profile is active and eligible to book both Google Meet virtual classes and physical sessions.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Payment Protection</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800">
                  Protected
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All class fees remain securely locked until sessions conclude according to our cancellation guarantee.
              </p>
            </div>

            <Button asChild variant="outline" className="w-full text-xs h-8.5 border-slate-200">
              <Link href="/student/bookings">Manage All Sessions</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
