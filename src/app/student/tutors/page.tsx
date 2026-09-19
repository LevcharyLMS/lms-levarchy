import React from "react";
import { SupabaseDbService } from "@/lib/supabase-db";
import { TutorCard } from "@/components/ui/tutor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentTutorsPage() {
  let tutors: any[] = [];

  try {
    tutors = await SupabaseDbService.getApprovedTutors();
  } catch (err) {
    console.error("Error fetching tutors:", err);
  }

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

      {tutors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No approved tutors yet"
          description="Verified instructors will appear here once their profiles are approved by the admin team."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((t) => (
            <TutorCard key={t.user_id} tutor={t} />
          ))}
        </div>
      )}
    </div>
  );
}
