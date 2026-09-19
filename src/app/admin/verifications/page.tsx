"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { StorageService } from "@/services/storage";
import { VerificationDocument } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/shared/data-table";
import { DetailDrawer } from "@/components/shared/detail-drawer";
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
} from "lucide-react";

export default function AdminVerificationsPage() {
  const [documents, setDocuments] = useState<VerificationDocument[]>(
    db.state.verification_documents
  );
  const [activeDoc, setActiveDoc] = useState<VerificationDocument | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleInspect = async (doc: VerificationDocument) => {
    setActiveDoc(doc);
    setAdminNotes(doc.admin_notes || "");
    setIsDrawerOpen(true);

    // Generate secure expiring signed URL (15 min expiry)
    const url = await StorageService.getSignedUrl(
      doc.file_path,
      "usr-admin-1",
      "ADMIN"
    );
    setSignedUrl(url);
  };

  const handleUpdateStatus = (status: "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED") => {
    if (!activeDoc) return;

    db.updateVerificationDocumentStatus(activeDoc.id, status, adminNotes);
    setDocuments([...db.state.verification_documents]);
    setActionSuccess(`Document marked as ${status}. Tutor record updated.`);
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
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
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

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-navy-950">
          Tutor Verification Center
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review government photo IDs and university degrees with 15-minute expiring signed URLs before granting teaching authority.
        </p>
      </div>

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

      {/* Inspection Detail Drawer (Section 82) */}
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
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Expiring Signed Token Generated (Rule 2)</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                This document is stored in a private storage bucket. The link below is cryptographically signed and will expire in 15 minutes.
              </p>
              {signedUrl && (
                <Button asChild size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 w-full">
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                    <span>Open High-Resolution Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
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
                rows={3}
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
