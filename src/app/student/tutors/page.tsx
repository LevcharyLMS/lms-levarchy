"use client";

import React from "react";
import { db } from "@/lib/data-store";
import { TutorCard } from "@/components/ui/tutor-card";

export default function StudentTutorsPage() {
  const tutors = db.getTutors();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Verified Instructors
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse verified university faculty, certified educators, and experienced mentors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map((t) => (
          <TutorCard key={t.user_id} tutor={t} />
        ))}
      </div>
    </div>
  );
}
