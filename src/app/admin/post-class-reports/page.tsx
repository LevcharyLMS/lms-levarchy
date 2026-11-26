"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminClassReportsQueue } from "@/components/admin/class-reports-queue";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminPostClassReportsPage() {
  const [pendingCount, setPendingCount] = useState<number>(0);

  const academicTabs = [
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    { label: "Assignment Oversight", href: "/admin/assignments" },
    { label: "Curriculum Suggestions", href: "/admin/suggestions" },
    {
      label: "Post-Class Reports",
      href: "/admin/post-class-reports",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Academics Hub"
        badgeText="Post-Class Reports"
        description="Review instructor post-class pedagogical summaries, student attendance verification, and approve feedback comments before platform publication."
        tabs={academicTabs}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/reports">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-200 text-slate-600 hover:text-slate-900 gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                <span>Reports Hub CSV</span>
              </Button>
            </Link>
          </div>
        }
      />

      <AdminClassReportsQueue onPendingCountChange={setPendingCount} />
    </div>
  );
}
