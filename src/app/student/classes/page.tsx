"use client";

import React from "react";
import { db } from "@/lib/data-store";
import { ClassCard } from "@/components/ui/class-card";

export default function StudentClassesPage() {
  const classes = db.getClasses();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Available Classes & Cohorts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select a 1-on-1 private lesson or collaborative group cohort.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c) => (
          <ClassCard key={c.id} classItem={c} />
        ))}
      </div>
    </div>
  );
}
