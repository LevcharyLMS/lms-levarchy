"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Download, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AdminReportsPage() {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const exportCSV = (type: "BOOKINGS" | "USERS" | "TRANSACTIONS" | "REVIEWS") => {
    let csvContent = "";
    let filename = `levchary_${type.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`;

    if (type === "BOOKINGS") {
      const bookings = db.getBookings();
      csvContent = "BookingNumber,StudentEmail,TutorEmail,ClassTitle,Format,GrossCents,Status,CreatedAt\n";
      bookings.forEach((b) => {
        csvContent += `"${b.booking_number}","${b.student?.email}","${b.tutor?.email}","${b.class_item?.title}","${b.format}",${b.financial_snapshot?.gross_amount || 0},"${b.status}","${b.created_at}"\n`;
      });
    } else if (type === "USERS") {
      // RULE 79: Data minimization - never include passwords or sensitive IDs
      const users = db.getProfiles();
      csvContent = "ID,FirstName,LastName,Email,Role,AccountStatus,VerificationStatus,CreatedAt\n";
      users.forEach((u) => {
        csvContent += `"${u.id}","${u.first_name}","${u.last_name}","${u.email}","${u.role}","${u.account_status}","${u.verification_status}","${u.created_at}"\n`;
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
        csvContent += `"${r.id}","${r.booking_id}",${r.rating},"${r.comment?.replace(/"/g, '""')}","${r.is_published}","${r.created_at}"\n`;
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
      actor_id: "usr-admin-1",
      actor_role: "ADMIN",
      action: `REPORT_EXPORTED_${type}`,
      entity_type: "SYSTEM_REPORT",
      metadata: { report_type: type, filename },
    });

    setDownloadSuccess(`Generated and downloaded ${filename}`);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Financial & Marketplace Reports (CSV)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate sanitized, compliant spreadsheet exports for accounting and operational analysis.
        </p>
      </div>

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

      {/* Safety Notice */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Rule 79 Privacy Compliance:</strong>
          All CSV reports automatically strip authentication tokens, passwords, and sensitive government ID contents. Every export action is recorded in the append-only audit trail.
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy-950">Marketplace Bookings Ledger</h3>
              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export all 1-on-1 and group cohort bookings with locked historical financial snapshots, student references, and attendance statuses.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-purple-900 hover:bg-purple-800 text-xs"
              onClick={() => exportCSV("BOOKINGS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Bookings CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy-950">Financial Transactions Ledger</h3>
              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Itemized ledger of student tuition payments, 20% platform commissions, and 80% tutor payouts disbursed through Stripe Connect.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-purple-900 hover:bg-purple-800 text-xs"
              onClick={() => exportCSV("TRANSACTIONS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Transactions CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy-950">User Directory Export</h3>
              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sanitized export of registered students, approved educators, verification statuses, and account statuses.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-purple-900 hover:bg-purple-800 text-xs"
              onClick={() => exportCSV("USERS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Users CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy-950">Reviews & Ratings Report</h3>
              <FileSpreadsheet className="w-4 h-4 text-purple-700" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Student reviews, 1-5 star ratings, and publication statuses for teaching quality evaluations.
            </p>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 w-full bg-purple-900 hover:bg-purple-800 text-xs"
              onClick={() => exportCSV("REVIEWS")}
            >
              <Download className="w-3.5 h-3.5" /> Export Reviews CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
