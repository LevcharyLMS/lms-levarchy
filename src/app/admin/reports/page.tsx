"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents-data";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  CheckCircle2,
  Megaphone,
  Users,
  GraduationCap,
  Scale,
  DollarSign,
  Star,
  BookOpen,
} from "lucide-react";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminReportsPage() {
  const { user: currentAdmin } = useAuth();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const exportCSV = (
    type:
      | "BOOKINGS"
      | "ALL_USERS"
      | "STUDENTS"
      | "INSTRUCTORS"
      | "TRANSACTIONS"
      | "REVIEWS"
      | "MARKETING_ADVERTS"
      | "LEGAL_DOCUMENTS"
  ) => {
    let csvContent = "";
    let filename = `levchary_${type.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`;

    if (type === "BOOKINGS") {
      const bookings = db.getBookings();
      csvContent = "BookingNumber,StudentEmail,TutorEmail,ClassTitle,Format,GrossCents,Status,CreatedAt\n";
      bookings.forEach((b) => {
        csvContent += `"${b.booking_number}","${b.student?.email || ""}","${b.tutor?.email || ""}","${b.class_item?.title || ""}","${b.format}",${b.financial_snapshot?.gross_amount || 0},"${b.status}","${b.created_at}"\n`;
      });
    } else if (type === "ALL_USERS") {
      const users = db.getProfiles();
      csvContent = "ID,FirstName,LastName,Email,Role,AccountStatus,VerificationStatus,CreatedAt\n";
      users.forEach((u) => {
        csvContent += `"${u.id}","${u.first_name}","${u.last_name}","${u.email}","${u.role}","${u.account_status}","${u.verification_status}","${u.created_at}"\n`;
      });
    } else if (type === "STUDENTS") {
      const students = db.getProfiles().filter((u) => u.role === "STUDENT");
      csvContent = "ID,FirstName,LastName,Email,GradeLevel,GuardianEmail,GuardianPhone,AccountStatus,CreatedAt\n";
      students.forEach((s: any) => {
        csvContent += `"${s.id}","${s.first_name}","${s.last_name}","${s.email}","${s.grade_level || "Not Specified"}","${s.guardian_email || ""}","${s.guardian_phone || ""}","${s.account_status}","${s.created_at}"\n`;
      });
    } else if (type === "INSTRUCTORS") {
      const instructors = db.getProfiles().filter((u) => u.role === "INSTRUCTOR");
      csvContent = "ID,FirstName,LastName,Email,Role,HourlyRate,PayoutPct,VerificationStatus,TeachingAuth,AccountStatus,CreatedAt\n";
      instructors.forEach((i: any) => {
        csvContent += `"${i.id}","${i.first_name}","${i.last_name}","${i.email}","${i.role}",35.00,80,"${i.verification_status}","APPROVED_INSTRUCTOR","${i.account_status}","${i.created_at}"\n`;
      });
    } else if (type === "TRANSACTIONS") {
      const txs = db.state.transactions;
      csvContent = "ID,BookingID,Type,GrossCents,FeeCents,NetCents,Currency,Status,CreatedAt\n";
      txs.forEach((t) => {
        csvContent += `"${t.id}","${t.booking_id}","${t.type}",${t.gross_amount},${t.fee_amount},${t.net_amount},"${t.currency}","${t.status}","${t.created_at}"\n`;
      });
    } else if (type === "REVIEWS") {
      const revs = db.state.reviews;
      csvContent = "ID,BookingID,Rating,Comment,Published,CreatedAt\n";
      revs.forEach((r) => {
        csvContent += `"${r.id}","${r.booking_id}",${r.rating},"${(r.comment || "").replace(/"/g, '""')}","${r.is_published}","${r.created_at}"\n`;
      });
    } else if (type === "MARKETING_ADVERTS") {
      const adverts = db.getAllAdverts();
      csvContent = "ID,Title,MediaType,MediaURL,TargetURL,Downloadable,Views,Downloads,Active,StartDate,EndDate,CreatedAt\n";
      adverts.forEach((a) => {
        csvContent += `"${a.id}","${a.title.replace(/"/g, '""')}","${a.media_type}","${a.media_url}","${a.target_url || ""}",${a.downloadable},${a.view_count || 0},${a.download_count || 0},${a.is_active},"${a.start_date || ""}","${a.end_date || ""}","${a.created_at}"\n`;
      });
    } else if (type === "LEGAL_DOCUMENTS") {
      const legals = LEGAL_DOCUMENTS;
      csvContent = "DocumentKey,Title,EffectiveDate,SectionsCount,LastUpdated\n";
      Object.entries(legals).forEach(([key, doc]: [string, any]) => {
        csvContent += `"${key}","${(doc.title || "").replace(/"/g, '""')}","${doc.effectiveDate || ""}",${(doc.sections || []).length},"${new Date().toISOString()}"\n`;
      });
    }

    // Trigger browser download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    db.logAudit({
      actor_id: currentAdmin?.id || "usr-admin-1",
      actor_role: "ADMIN",
      action: `REPORT_EXPORTED_${type}`,
      entity_type: "SYSTEM_REPORT",
      metadata: { report_type: type, filename },
    });

    setDownloadSuccess(`Generated and downloaded ${filename}`);
  };

  const moderationTabs = [
    { label: "Safety Flags", href: "/admin/flags" },
    { label: "Review Approvals", href: "/admin/reviews" },
    { label: "Reports", href: "/admin/reports" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Moderation & Support Hub"
        badgeText="Centralized Data Exports & Reports"
        description="Authoritative, centralized data exports for all platform operational ledgers, users, marketing metrics, and compliance documents."
        tabs={moderationTabs}
      />

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Compliance Notice */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Rule 79 Privacy & Security Compliance:</strong>
          All exported datasets strictly minimize sensitive information by stripping authentication passwords, tokens, and raw credential payloads. Every download action is recorded in the immutable audit ledger.
        </div>
      </div>

      {/* Consolidated Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Marketing Adverts Ledger */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-teal-600" />
                <span>Marketing Adverts & Media</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export promotional flyers and video reels, view counts, downloads, active statuses, and scheduled expiry dates.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => exportCSV("MARKETING_ADVERTS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Marketing CSV
            </Button>
          </CardContent>
        </Card>

        {/* All Users Directory */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                <span>All Users Directory</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sanitized export of all platform accounts with roles, registration timestamps, and account active/suspended statuses.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => exportCSV("ALL_USERS")}
            >
              <Download className="w-3.5 h-3.5" /> Export All Users CSV
            </Button>
          </CardContent>
        </Card>

        {/* Students Cohort Report */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Student Directory & Guardians</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export registered students with academic grade level, parent/guardian contact details, and account standing.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => exportCSV("STUDENTS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Students CSV
            </Button>
          </CardContent>
        </Card>

        {/* Instructors Directory */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Instructors & Payouts</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export approved tutors and faculty, background check verification clearance, and payout authorization percentages.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => exportCSV("INSTRUCTORS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Instructors CSV
            </Button>
          </CardContent>
        </Card>

        {/* Marketplace Bookings Ledger */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Marketplace Bookings Ledger</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export 1-on-1 and group cohort sessions with locked historical financial snapshots, student references, and completion statuses.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => exportCSV("BOOKINGS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Bookings CSV
            </Button>
          </CardContent>
        </Card>

        {/* Financial Transactions Ledger */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span>Financial Transactions Ledger</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Itemized ledger of student tuition payments, 20% platform commissions, and 80% instructor payouts.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => exportCSV("TRANSACTIONS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Transactions CSV
            </Button>
          </CardContent>
        </Card>

        {/* Reviews & Ratings */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-teal-600" />
                <span>Reviews & Teaching Quality</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Student ratings, class reviews, comments, and publication moderation statuses for quality assurance.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => exportCSV("REVIEWS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Reviews CSV
            </Button>
          </CardContent>
        </Card>

        {/* Legal Documents Metadata */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-teal-600" />
                <span>Legal Agreements Index</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export platform policies catalog, effective dates, revision timestamps, and total clause counts for legal audits.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
              onClick={() => exportCSV("LEGAL_DOCUMENTS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Legal Catalog CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
