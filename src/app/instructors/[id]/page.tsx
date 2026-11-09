import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SupabaseDbService } from "@/lib/supabase-db";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClassCard } from "@/components/ui/class-card";
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { formatDisplayName } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface InstructorPageProps {
  params: {
    id: string;
  };
}

export default async function InstructorDetailPage({ params }: InstructorPageProps) {
  const instructor = await SupabaseDbService.getInstructorById(params.id);

  if (!instructor || !instructor.user) {
    notFound();
  }

  const { user, classes = [] } = instructor;
  const instructorDisplayName = formatDisplayName(user.first_name, user.last_name);
  const initials = `${user.first_name?.[0] || "I"}${user.last_name?.[0] || ""}`;
  const location = [user.city, user.state].filter(Boolean).join(", ") || "Remote / Verified";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-6xl">
      {/* Back button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-500 hover:text-slate-800">
          <Link href="/student/instructors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Instructors</span>
          </Link>
        </Button>
      </div>

      {/* Top Banner Profile Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-slate-50 shadow-sm">
                <AvatarImage src={user.avatar_url || ""} />
                <AvatarFallback className="text-xl bg-teal-50 text-teal-800 font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {instructor.is_approved && (
                <div
                  className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-1.5 shadow"
                  title="Verified Levchary Academic Instructor"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-navy-950">
                  {instructorDisplayName}
                </h1>
                <StatusBadge status={instructor.preferred_format || "BOTH"} />
                {instructor.is_approved && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Verified Faculty
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-slate-700">
                {instructor.headline}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{instructor.experience_years || 0} years teaching</span>
                </div>
                <div>
                  <RatingStars rating={instructor.rating_avg || 5} count={instructor.reviews_count || 0} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <div className="text-left md:text-right px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Standard Rate
              </span>
              <MoneyDisplay cents={instructor.hourly_rate || 3500} label="/hr" className="text-lg" />
            </div>

            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs gap-1.5 h-10 px-4">
              <Link href={`/student/messages?recipientId=${instructor.user_id}`}>
                <MessageSquare className="w-4 h-4" />
                <span>Message Instructor</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Biography & Philosophy */}
        <div className="pt-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            About the Instructor
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl whitespace-pre-line">
            {instructor.bio}
          </p>
        </div>

        {/* Qualifications Pill Tray */}
        {instructor.qualifications && (
          <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Academic Background &amp; Certifications
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-teal-50/50 p-3 rounded-xl border border-teal-100/70">
              <GraduationCap className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{instructor.qualifications}</span>
            </div>
          </div>
        )}
      </div>

      {/* Available Classes by this Instructor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-navy-950">
              Classes &amp; Cohorts Taught by {instructorDisplayName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enroll in 1-on-1 private lessons or collaborative workshops offered by this instructor.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {classes.length} {classes.length === 1 ? "Class" : "Classes"} Available
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-navy-950">No published classes at this moment</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This instructor is currently offering custom direct bookings. Send a message to coordinate a personalized schedule.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
              <Link href={`/student/messages?recipientId=${instructor.user_id}`}>
                Inquire via Direct Message
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c: any) => (
              <ClassCard key={c.id} classItem={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
