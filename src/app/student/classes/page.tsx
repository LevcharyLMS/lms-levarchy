import React from "react";
import { SupabaseDbService } from "@/lib/supabase-db";
import { ClassCard } from "@/components/ui/class-card";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentClassesPage() {
  let classes: any[] = [];

  try {
    classes = await SupabaseDbService.getClasses();
  } catch (err) {
    console.error("Error fetching classes:", err);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Available Classes &amp; Cohorts
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select a 1-on-1 private lesson or collaborative group cohort.
        </p>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No classes available yet"
          description="Classes published by approved tutors will appear here for you to browse and book."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <ClassCard key={c.id} classItem={c} />
          ))}
        </div>
      )}
    </div>
  );
}
