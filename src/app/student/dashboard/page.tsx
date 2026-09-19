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
  BookOpen,
  Users,
  Search,
  MessageSquare,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { cookies } from "next/headers";
import {
  PageTransition,
  FadeUp,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
} from "@/components/animations";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("levchary_session");
  let studentName = "";
  let studentId: string | null = null;

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      studentId = parsed.userId || null;
      if (parsed.name) {
        studentName = parsed.name.split(" ")[0];
      }
    } catch {}
  }

  let allBookings: any[] = [];
  let tutors: any[] = [];

  try {
    allBookings = await SupabaseDbService.getBookings(studentId ? { studentId } : undefined);
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
  const otherUpcomingClasses = activeBookings.slice(1, 4);
  const recommendedTutors = (tutors || []).slice(0, 3);
  const recentBookings = bookings.slice(0, 5);

  const totalLearningHours = completedBookings.reduce(
    (acc: number, b: any) => acc + ((b?.class_item?.duration_minutes || 60) / 60),
    0
  );

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Context Header (Section 24) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Welcome back{studentName ? `, ${studentName}` : ""}!
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified Student
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {activeBookings.length > 0
              ? `You have ${activeBookings.length} scheduled class session${activeBookings.length === 1 ? "" : "s"} ready on your calendar.`
              : "Discover verified faculty mentors or join small group cohort workshops."}
          </p>
        </div>

        {/* Quick Actions (Section 24) */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5">
            <Link href="/student/tutors">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Find a Tutor</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5">
            <Link href="/student/classes">
              <Search className="w-3.5 h-3.5 text-teal-600" />
              <span>Explore Classes</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs">
            <Link href="/student/calendar">
              <Calendar className="w-3.5 h-3.5" />
              <span>View Calendar</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Featured NEXT CLASS Card (Section 24, 26) */}
      {nextClass ? (
        <FadeUp>
          <div className="bg-gradient-to-r from-indigo-900 to-navy-900 text-white p-6 rounded-xl shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
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
                    <span>
                      {nextClass?.start_time
                        ? new Date(nextClass.start_time).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Scheduled Session"}
                    </span>
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
                  {nextClass.tutor && (
                    <div className="text-xs text-indigo-300">
                      Instructor: <span className="font-semibold text-white">{nextClass.tutor.first_name} {nextClass.tutor.last_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Join Button (Section 26: Only when eligible) */}
              <div className="flex items-center gap-3 shrink-0">
                {nextClass.format === "VIRTUAL" && nextClass.meet_url && nextClass.status === "CONFIRMED" ? (
                  <Button
                    asChild
                    size="sm"
                    className="h-9 px-4 text-xs font-bold bg-teal-500 hover:bg-teal-600 text-navy-950 gap-1.5 shadow-sm"
                  >
                    <a href={nextClass.meet_url} target="_blank" rel="noopener noreferrer">
                      <Video className="w-4 h-4" />
                      <span>Join Google Meet</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="secondary" className="h-9 text-xs">
                    <Link href="/student/bookings">Session Details</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </FadeUp>
      ) : (
        /* Section 25: Polished Empty State */
        <FadeUp>
          <EmptyState
            icon={Calendar}
            title="Your learning journey starts here"
            description="Find a verified tutor or explore available classes to schedule your first 1-on-1 session or cohort workshop."
            actionLabel="Find Tutors"
            actionHref="/student/tutors"
          />
        </FadeUp>
      )}

      {/* Real Statistics Row (Section 24) */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StaggerItem>
          <StatCard
            title="Upcoming Sessions"
            value={activeBookings.length}
            subtitle={activeBookings.length > 0 ? "Confirmed & on calendar" : "No sessions pending"}
            icon={Calendar}
            variant="indigo"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Completed Classes"
            value={completedBookings.length}
            subtitle={completedBookings.length > 0 ? "Eligible for review" : "No completed classes yet"}
            icon={CheckCircle2}
            variant="emerald"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Total Bookings"
            value={bookings.length}
            subtitle="All-time reservations"
            icon={BookOpen}
            variant="teal"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Learning Hours"
            value={`${totalLearningHours}h`}
            subtitle="Instructional time completed"
            icon={Clock}
            variant="purple"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Classes & Recommended Tutors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Classes List (Section 24) */}
          {otherUpcomingClasses.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-navy-950">Additional Scheduled Sessions</h3>
                <Link href="/student/bookings" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  <span>View All Bookings</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {otherUpcomingClasses.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-navy-950 truncate">
                        {b.class_item?.title || "Class Session"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {b.start_time ? new Date(b.start_time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Scheduled"} • {b.format}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={b.status} />
                      {b.format === "VIRTUAL" && b.meet_url && (
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary p-1">
                          <a href={b.meet_url} target="_blank" rel="noopener noreferrer">
                            <Video className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Verified Tutors (Section 24, 27, 88) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-navy-950">Recommended Verified Instructors</h3>
                <p className="text-xs text-slate-500">Verified academic faculty available for 1-on-1 mentorship</p>
              </div>
              <Link href="/student/tutors" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                <span>Explore All Tutors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recommendedTutors.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No tutors currently available"
                description="New faculty applications are undergoing administrative credential verification."
                actionLabel="Explore Classes"
                actionHref="/student/classes"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {recommendedTutors.map((t: any) => (
                  <AnimatedCard
                    key={t.user_id}
                    className="p-3.5 rounded-xl border border-slate-200/80 hover:border-primary/40 transition-all bg-white flex flex-col justify-between space-y-3 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-9 h-9 ring-2 ring-indigo-50">
                          <AvatarImage src={t.user?.avatar_url || t.avatar_url} />
                          <AvatarFallback>{(t.user?.first_name || t.first_name || "T")[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy-950 truncate">
                            {t.user?.first_name || t.first_name} {t.user?.last_name || t.last_name}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-semibold">
                            ★ {t.rating_avg || "5.0"} • Verified
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {t.headline || t.bio || "Academic specialist ready for mentorship."}
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
                  </AnimatedCard>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings Activity (Section 24) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-navy-950">Recent Reservation Activity</h3>
                <p className="text-xs text-slate-500">Timeline of session enrollments and payment statuses</p>
              </div>
              <Link href="/student/bookings" className="text-xs text-primary font-semibold hover:underline">
                View All
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No recent bookings recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.map((b: any) => (
                  <div key={b.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-navy-950 truncate">
                        {b.class_item?.title || "Academic Tutorial"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Ref: {b.booking_number} • {b.created_at ? new Date(b.created_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {b.financial_snapshot && (
                        <span className="font-semibold text-navy-950">
                          <MoneyDisplay cents={b.financial_snapshot.gross_amount} />
                        </span>
                      )}
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Learning Status, Messages & Notifications Quick View */}
        <div className="space-y-6">
          {/* Learning Status Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-navy-950">Account Protection</h3>
              <p className="text-xs text-slate-500">Platform compliance & escrow security</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Identity & Eligibility</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your student account is authorized to enroll in both Google Meet virtual classrooms and in-person learning centers.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Stripe Payment Escrow</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Protected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tuition payments remain safely locked in escrow until scheduled classes conclude according to cancellation terms.
                </p>
              </div>

              <Button asChild variant="outline" className="w-full text-xs h-8.5 border-slate-200">
                <Link href="/student/payments">View Payment History</Link>
              </Button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-navy-950">Communication</h3>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-between text-xs h-9 border-slate-200">
                <Link href="/student/messages">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span>Open Messages</span>
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between text-xs h-9 border-slate-200">
                <Link href="/student/notifications">
                  <span className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Notifications Feed</span>
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
