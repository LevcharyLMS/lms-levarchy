"use client";

import React from "react";
import { AdminClassReportsQueue } from "@/components/admin/class-reports-queue";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminPostClassReportsPage() {
  const academicTabs = [
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    { label: "Assignment Oversight", href: "/admin/assignments" },
    { label: "Curriculum Suggestions", href: "/admin/suggestions" },
    { label: "Post-Class Reports", href: "/admin/post-class-reports" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Academics Hub"
        badgeText="Post-Class Reports"
        description="Review instructor post-class pedagogical summaries, student attendance verification, and approve feedback comments before platform publication."
        tabs={academicTabs}
      />

      <AdminClassReportsQueue />
    </div>
  );
}
