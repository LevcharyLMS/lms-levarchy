import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/data-store";
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
} from "lucide-react";

interface TutorPageProps {
  params: {
    id: string;
  };
}

export default function TutorDetailPage({ params }: TutorPageProps) {
  const tutorData = db.getTutorById(params.id);

  if (!tutorData || !tutorData.user) {
    notFound();
  }

  const { user, classes = [], reviews = [] } = tutorData;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-6xl">
      {/* Top Banner Profile Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-slate-50 shadow">
                <AvatarImage src={user.avatar_url || ""} />
                <AvatarFallback className="text-xl">
                  {user.first_name[0]}{user.last_name[0]}
                </AvatarFallback>
              </Avatar>
              {tutorData.is_approved && (
                <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-1 shadow" title="Verified Identity & Qualifications">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-navy-950">
                  {user.first_name} {user.last_name}
                </h1>
                <StatusBadge status={tutorData.preferred_format} />
              </div>

              <p className="text-sm font-medium text-slate-700">
                {tutorData.headline}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.city}, {user.state} ({tutorData.timezone})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tutorData.experience_years} years experience</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-2">
              <RatingStars rating={tutorData.rating_avg} count={tutorData.reviews_count} size="md" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-slate-500">Standard Rate:</span>
              <MoneyDisplay cents={tutorData.hourly_rate} label="/hour" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Button asChild variant="default" size="sm">
                <Link href="#classes">View Classes & Book</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/student/messages">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" /> Contact Tutor
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Academic Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-sm">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-base font-semibold text-navy-950">About the Instructor</h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {tutorData.bio}
            </p>

            {tutorData.qualifications && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 mt-4">
                <h3 className="text-xs font-semibold text-navy-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-teal-600" /> Verified Credentials & Degrees
                </h3>
                <p className="text-xs text-slate-700 font-medium">{tutorData.qualifications}</p>
              </div>
            )}
          </div>

          {/* Guarantee Box */}
          <div className="bg-teal-50/50 rounded-xl border border-teal-100 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Levchary Guarantee
            </h3>
            <ul className="text-xs text-teal-900 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Verified government-issued ID on file
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Automated Google Meet for virtual sessions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Stripe payment protection & refund escrow
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Available Classes Taught by Tutor */}
      <div id="classes" className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-navy-950">
            Available Classes by {user.first_name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose from 1-on-1 sessions or collaborative cohorts with real-time seat availability.
          </p>
        </div>

        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => (
              <ClassCard key={c.id} classItem={c} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">No scheduled open classes at this moment.</p>
          </div>
        )}
      </div>

      {/* Student Reviews */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-navy-950">Verified Student Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only students with completed bookings are permitted to submit reviews.
            </p>
          </div>
          <RatingStars rating={tutorData.rating_avg} count={reviews.length} size="md" />
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <RatingStars rating={rev.rating} />
                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No reviews published yet.</p>
        )}
      </div>
    </div>
  );
}
