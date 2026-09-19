"use client";

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
  const user = tutor.user;
  if (!user) return null;

  return (
    <Card className="hover:border-teal-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-slate-100">
              <AvatarImage src={user.avatar_url || ""} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback>
                {user.first_name[0]}{user.last_name[0]}
              </AvatarFallback>
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
                {user.first_name} {user.last_name}
              </h3>
              <MoneyDisplay cents={tutor.hourly_rate} label="/hr" />
            </div>

            <div className="mt-1 flex items-center gap-2">
              <RatingStars rating={tutor.rating_avg} count={tutor.reviews_count} />
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={tutor.preferred_format} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-700 line-clamp-2">
          {tutor.headline || "Specialist Educator"}
        </p>

        <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
          {tutor.bio}
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
            <span>{tutor.experience_years} years teaching experience</span>
          </div>
        </div>
      </CardContent>

      <div className="p-4 pt-0 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Location: <strong className="text-slate-700">{user.city}, {user.state}</strong>
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
