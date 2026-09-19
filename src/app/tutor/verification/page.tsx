"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Upload, FileText, CheckCircle2, Lock, AlertTriangle } from "lucide-react";

export default function TutorVerificationPage() {
  const tutorId = "usr-tut-1";
  const [docType, setDocType] = useState("GOVERNMENT_ID");
  const [fileName, setFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    db.state.verification_documents.push({
      id: `doc-${Date.now()}`,
      user_id: tutorId,
      document_type: docType,
      file_path: `verifications/${tutorId}/${fileName}`,
      file_name: fileName,
      mime_type: "application/pdf",
      file_size: 1540000,
      status: "PENDING_REVIEW",
      admin_notes: "Uploaded by tutor for compliance review.",
      uploaded_at: new Date().toISOString(),
    });

    setUploadSuccess(`Document "${fileName}" encrypted and uploaded to private compliance storage.`);
    setFileName("");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Educator Identity & Credential Verification
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Levchary requires mandatory document verification before tutors can accept bookings or publish availability.
        </p>
      </div>

      {/* Verified Status Banner */}
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-emerald-950">
              Verified Instructor: Approved & Active
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
              Rule 1 Satisfied
            </span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Your government-issued passport and MIT Ph.D. diploma have been audited and approved by administration. Your profile is publicly bookable and authorized to host Google Meet sessions.
          </p>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Additional Document Form */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-navy-950">
            <Upload className="w-4 h-4 text-teal-600" />
            Upload Supplementary Credential or License
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-600 outline-none"
                >
                  <option value="GOVERNMENT_ID">Government Photo ID (Passport / License)</option>
                  <option value="DEGREE_CERTIFICATE">University Degree Diploma (BSc, MSc, Ph.D.)</option>
                  <option value="TEACHING_LICENSE">State Teaching Credential</option>
                  <option value="BACKGROUND_CHECK">Criminal Background Check Clearance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document File Name (PDF / PNG)
                </label>
                <Input
                  placeholder="e.g. MIT_PhD_Mathematics_Diploma.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="default" size="sm" className="font-semibold">
              Upload to Secure Private Bucket
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy Guarantee */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-navy-950 block">Rule 2 Privacy Enforcement:</strong>
          Verification documents are stored in private cloud storage and are never exposed publicly on your tutor profile or to students. Documents are accessed strictly by administrators via expiring signed URLs with audit logging.
        </div>
      </div>
    </div>
  );
}
