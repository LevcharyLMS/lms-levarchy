import React from "react";
import Link from "next/link";
import { UserProfile, TutorProfile } from "@/types";
import { Card, CardContent } from "./card";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { RatingStars } from "./rating-stars";
import { StatusBadge } from "./status-badge";
import { MoneyDisplay } from "./money-display";
import { Button } from "./button";
import { GraduationCap, Briefcase, ChevronRight, ShieldCheck } from "lucide-react";

interface TutorCardProps {
  tutor: TutorProfile & { user?: UserProfile };
}

export function TutorCard({ tutor }: TutorCardProps) {
  const user = tutor?.user;
  if (!tutor) return null;

  const firstName = user?.first_name || "Verified";
  const lastName = user?.last_name || "Instructor";
  const initials = `${firstName[0] || "T"}${lastName[0] || "I"}`;
  const location = [user?.city, user?.state].filter(Boolean).join(", ") || "Remote / Verified";

  return (
    <Card className="hover:border-teal-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-slate-100">
              <AvatarImage src={user?.avatar_url || ""} alt={`${firstName} ${lastName}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {tutor.is_approved && (
              <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white rounded-full p-0.5 shadow" title="Verified Levchary Tutor">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-base text-navy-950 truncate">
                {firstName} {lastName}
              </h3>
              <MoneyDisplay cents={tutor.hourly_rate || 0} label="/hr" />
            </div>

            <div className="mt-1 flex items-center gap-2">
              <RatingStars rating={tutor.rating_avg || 5.0} count={tutor.reviews_count || 0} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {/* Dynamic Instructor Classification Badge */}
              {tutor.experience_years && tutor.experience_years >= 4 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                  <GraduationCap className="w-3 h-3 text-purple-600" />
                  <span>Faculty</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span>Verified Tutor</span>
                </span>
              )}
              <StatusBadge status={tutor.preferred_format || "VIRTUAL"} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-700 line-clamp-2">
          {tutor.headline || "Specialist Educator"}
        </p>

        <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
          {tutor.bio || "Experienced academic tutor and mentor on Levchary."}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
          {tutor.qualifications && (
            <div className="flex items-center gap-1.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{tutor.qualifications}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{tutor.experience_years ?? 1} years teaching experience</span>
          </div>
        </div>
      </CardContent>

      <div className="p-4 pt-0 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 truncate max-w-[180px]">
          Location: <strong className="text-slate-700">{location}</strong>
        </span>
        <Button asChild size="sm" variant="default" className="gap-1">
          <Link href={`/tutors/${tutor.user_id}`}>
            View Profile <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
