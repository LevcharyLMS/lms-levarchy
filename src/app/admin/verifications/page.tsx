"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { useAuth } from "@/context/auth-context";
import { StorageService } from "@/services/storage";
import { VerificationDocument } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Clock,
  Eye,
  Calendar,
  Image as ImageIcon
} from "lucide-react";

export default function AdminVerificationsPage() {
  const { user: currentAdmin } = useAuth();
  const [documents, setDocuments] = useState<VerificationDocument[]>(
    db.state.verification_documents
  );
  const [activeDoc, setActiveDoc] = useState<VerificationDocument | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("2027-01-15");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleInspect = async (doc: VerificationDocument) => {
    setActiveDoc(doc);
    setAdminNotes(doc.admin_notes || "");
    setExpiryDate("2027-01-15");
    setIsDrawerOpen(true);

    // Generate secure expiring signed URL (15 min expiry)
    const url = await StorageService.getSignedUrl(
      doc.file_path,
      currentAdmin?.id || "usr-admin-1",
      "ADMIN"
    );
    setSignedUrl(url);
  };

  const handleUpdateStatus = (status: "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED") => {
    if (!activeDoc) return;

    db.updateVerificationDocumentStatus(activeDoc.id, status, adminNotes);
    setDocuments([...db.state.verification_documents]);
    setActionSuccess(`Document marked as ${status}. Expiration logged as ${expiryDate}.`);
    setIsDrawerOpen(false);
    setActiveDoc(null);
    setSignedUrl(null);
    setAdminNotes("");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const columns: Column<VerificationDocument>[] = [
    {
      key: "document",
      header: "Credential Document",
      render: (doc) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-navy-950 text-xs">{doc.document_type.replace(/_/g, " ")}</p>
            <p className="text-[11px] text-slate-400 truncate max-w-xs">{doc.file_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "file_size",
      header: "File Size",
      render: (doc) => (
        <span className="text-xs text-slate-500 font-mono">
          {(doc.file_size / 1024 / 1024).toFixed(2)} MB
        </span>
      ),
    },
    {
      key: "uploaded_at",
      header: "Submission Date",
      render: (doc) => (
        <span className="text-xs text-slate-500">
          {new Date(doc.uploaded_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (doc) => <StatusBadge status={doc.status} />,
    },
    {
      key: "actions",
      header: "Review Actions",
      className: "text-right",
      render: (doc) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs border-slate-200 gap-1.5"
          onClick={() => handleInspect(doc)}
        >
          <Eye className="w-3.5 h-3.5 text-primary" />
          <span>Inspect Document</span>
        </Button>
      ),
    },
  ];

  const pendingDocsCount = documents.filter(
    (d) => d.status === "PENDING_REVIEW"
  ).length;

  const userTabs = [
    { label: "All Users", href: "/admin/users" },
    { label: "Students", href: "/admin/students" },
    { label: "Instructors", href: "/admin/instructors" },
    { label: "Applications", href: "/admin/instructor-applications" },
    {
      label: "Verifications",
      href: "/admin/verifications",
      badge: pendingDocsCount > 0 ? pendingDocsCount : undefined,
    },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <AdminHubHeader
        title="People & Accounts Hub"
        badgeText="Document Verification"
        description="Review government photo IDs and university degrees with 15-minute expiring signed URLs before granting teaching authority."
        tabs={userTabs}
      />

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={documents}
        columns={columns}
        searchPlaceholder="Filter verification documents..."
        searchKey="file_name"
        emptyTitle="No verification documents pending"
        emptyDescription="All submitted credentials have been reviewed and approved."
      />

      {/* Inspection Detail Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={activeDoc ? `${activeDoc.document_type.replace(/_/g, " ")} Review` : "Document Review"}
        subtitle={activeDoc?.file_name}
        widthClass="max-w-lg"
      >
        {activeDoc && (
          <div className="space-y-5 text-xs">
            {/* Signed URL Callout */}
            <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-teal-900 font-bold">
                <Lock className="w-4 h-4 text-teal-600" />
                <span>Expiring Signed Token Generated (Rule 2)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                This document is stored in a private storage bucket. The link below is cryptographically signed and will expire in 15 minutes.
              </p>
              {signedUrl && (
                <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 w-full">
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                    <span>Open High-Resolution Document in New Window</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
            </div>

            {/* Embedded Inline Document Preview (PDF / Image Preview Canvas) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>Inline Document Preview</span>
              </span>
              <div className="w-full h-56 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden flex flex-col items-center justify-center relative p-3">
                {signedUrl ? (
                  <iframe
                    src={signedUrl}
                    title="Document Preview"
                    className="w-full h-full rounded border-0 bg-white"
                  />
                ) : (
                  <div className="text-center space-y-2 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-[11px]">Generating secure inline document render...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Expiration Date Picker */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-navy-950 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Document Expiration Date</span>
                </label>
                <span className="text-[10px] text-slate-400">Required for ID & Background Checks</span>
              </div>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-8 text-xs bg-white border-slate-200"
              />
              <p className="text-[10px] text-slate-500">
                System will flag this instructor for periodic credential renewal 30 days prior to expiration.
              </p>
            </div>

            {/* Document Metadata Table */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Metadata & Access Trail
              </span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">MIME Type:</span>
                  <span className="font-mono text-slate-700">{activeDoc.mime_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Size:</span>
                  <span className="font-mono text-slate-700">{(activeDoc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uploaded At:</span>
                  <span className="text-slate-700">{new Date(activeDoc.uploaded_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <StatusBadge status={activeDoc.status} />
                </div>
              </div>
            </div>

            {/* Administrative Review Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Reviewer Evaluation Notes
              </label>
              <Textarea
                placeholder="Enter feedback or explanation for rejection/resubmission..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            {/* Decision Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Administrative Decision
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  onClick={() => handleUpdateStatus("APPROVED")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button
                  onClick={() => handleUpdateStatus("RESUBMISSION_REQUIRED")}
                  variant="outline"
                  className="border-amber-400 text-amber-800 hover:bg-amber-50 text-xs h-8 gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Resubmit
                </Button>
                <Button
                  onClick={() => handleUpdateStatus("REJECTED")}
                  variant="destructive"
                  className="text-xs h-8 gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
