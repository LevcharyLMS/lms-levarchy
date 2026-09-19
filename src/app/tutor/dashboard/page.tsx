import React from "react";
import Link from "next/link";
import { SupabaseDbService } from "@/lib/supabase-db";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Video,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  CreditCard,
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

export default async function TutorDashboardPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("levchary_session");
  let tutorId: string | null = null;
  let tutorFullName = "Instructor";

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      tutorId = parsed.userId || null;
      if (parsed.name) {
        tutorFullName = parsed.name;
      }
    } catch {}
  }

  let allBookings: any[] = [];
  let tutorProfile: any = null;
  let commissionRate = { defaultRate: 20, tutorShareRate: 80 };

  try {
    const [bookingsData, rateData] = await Promise.all([
      SupabaseDbService.getBookings(tutorId ? { tutorId } : undefined),
      SupabaseDbService.getPlatformCommissionRate(),
    ]);
    allBookings = bookingsData || [];
    commissionRate = rateData;
  } catch (err) {
    console.error("Error fetching bookings for tutor dashboard:", err);
  }

  if (tutorId) {
    try {
      const tutors = await SupabaseDbService.getApprovedTutors();
      tutorProfile = tutors.find((t: any) => t.user_id === tutorId || t.id === tutorId) || null;
    } catch (err) {
      console.error("Error fetching tutor profile:", err);
    }
  }

  const bookings = allBookings || [];
  const activeBookings = bookings.filter((b: any) => b?.status === "CONFIRMED");
  const completedBookings = bookings.filter((b: any) => b?.status === "COMPLETED");

  const netEarningsCents = bookings.reduce(
    (sum: number, b: any) => sum + (b?.financial_snapshot?.tutor_earnings || 0),
    0
  );

  const todayClass = activeBookings[0];
  const headline = tutorProfile?.headline || "Academic Faculty Specialist";
  const ratingDisplay = tutorProfile?.rating_avg ? Number(tutorProfile.rating_avg).toFixed(1) : "5.0";
  const reviewsCount = tutorProfile?.reviews_count || 0;

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Verification Header (Section 36) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Instructor Dashboard: {tutorFullName}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified Faculty
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {headline} • Net Payout Tier: {commissionRate.tutorShareRate}% • Connected Payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200">
            <Link href="/tutor/availability">Set Availability</Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white shadow-xs">
            <Link href="/tutor/classes">Manage Classes</Link>
          </Button>
        </div>
      </div>

      {/* Today's Teaching Schedule (Section 36) */}
      {todayClass && (
        <FadeUp>
          <div className="bg-white p-5 rounded-xl border border-indigo-100 bg-indigo-50/20 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                  Next Scheduled Session
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Ref: {todayClass.booking_number}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-navy-950">
                  {todayClass.class_item?.title || "Academic Tutorial Session"}
                </h3>
                <p className="text-xs text-slate-600">
                  Student: <strong>{todayClass.student?.first_name} {todayClass.student?.last_name}</strong> • Scheduled for {todayClass?.start_time ? new Date(todayClass.start_time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Scheduled Time"}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {todayClass.format === "VIRTUAL" && todayClass.meet_url ? (
                  <Button asChild size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs">
                    <a href={todayClass.meet_url} target="_blank" rel="noopener noreferrer">
                      <Video className="w-3.5 h-3.5" />
                      <span>Launch Google Meet</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs border-slate-200">
                    <Link href="/tutor/calendar">View Calendar</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </FadeUp>
      )}

      {/* Real Statistics Row (Section 36, 84) */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StaggerItem>
          <StatCard
            title="Scheduled Classes"
            value={activeBookings.length}
            subtitle={activeBookings.length > 0 ? "Upcoming on calendar" : "No sessions pending"}
            icon={Calendar}
            variant="indigo"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Completed Classes"
            value={completedBookings.length}
            subtitle={completedBookings.length > 0 ? "All-time completed sessions" : "No completed classes yet"}
            icon={CheckCircle2}
            variant="emerald"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Net Tutor Earnings"
            value={<MoneyDisplay cents={netEarningsCents} />}
            subtitle={`After ${commissionRate.defaultRate}% platform commission`}
            icon={DollarSign}
            variant="teal"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Rating Average"
            value={ratingDisplay}
            subtitle={reviewsCount > 0 ? `${reviewsCount} verified reviews` : "Awaiting student reviews"}
            icon={Star}
            variant="gold"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Upcoming Roster & Payout Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-navy-950">Upcoming Class Sessions</h3>
              <p className="text-xs text-slate-500">Real-time student reservations and classroom schedules</p>
            </div>
            <Link href="/tutor/classes" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <span>View All Classes</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {activeBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming classes scheduled"
              description="Your teaching calendar is currently open. Once students book sessions from your classes or availability, they will appear here."
              actionLabel="Set Weekly Availability"
              actionHref="/tutor/availability"
            />
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {activeBookings.map((b: any) => {
                const payoutEarnings = b.financial_snapshot?.tutor_earnings || 0;

                return (
                  <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-navy-950">{b.booking_number}</span>
                        <StatusBadge status={b.status} />
                        <StatusBadge status={b.format} />
                      </div>
                      <p className="font-semibold text-slate-800 truncate">{b.class_item?.title || "Class Session"}</p>
                      <p className="text-[11px] text-slate-500">
                        Student: {b.student?.first_name} {b.student?.last_name} • {b?.start_time ? new Date(b.start_time).toLocaleDateString() : "Scheduled"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-emerald-700">
                        +${(payoutEarnings / 100).toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{commissionRate.tutorShareRate}% Net Share</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payout Quick Overview */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-navy-950">Payout Protection</h3>
            <p className="text-xs text-slate-500">Stripe Connect disbursement status</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-900 font-semibold">Stripe Account Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Direct deposits are scheduled automatically to your verified bank account upon session completion.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Platform Terms</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Platform fee of {commissionRate.defaultRate}% is deducted automatically. You receive {commissionRate.tutorShareRate}% net on all completed sessions.
              </p>
            </div>

            <Button asChild variant="outline" className="w-full text-xs h-8.5 border-slate-200 gap-1.5">
              <Link href="/tutor/payouts">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span>Manage Payout Account</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
