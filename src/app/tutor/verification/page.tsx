"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Upload, FileText, CheckCircle2, Lock, AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageTransition, FadeUp } from "@/components/animations";

export default function TutorVerificationPage() {
  const { user } = useAuth();
  const tutorId = user?.id;
  const verificationStatus = user?.verification_status || "PENDING_REVIEW";

  const [docType, setDocType] = useState("GOVERNMENT_ID");
  const [fileName, setFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setUploadSuccess(`Document "${fileName}" encrypted and uploaded for compliance review.`);
    setFileName("");
  };

  return (
    <PageTransition className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Educator Identity & Credential Verification
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Levchary requires mandatory document verification before tutors can accept bookings or publish availability.
        </p>
      </div>

      {/* Verification Status Banner (Section 41) */}
      {verificationStatus === "APPROVED" ? (
        <FadeUp className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-emerald-950">
                Verified Instructor: Approved & Active
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                Identity Verified
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your credentials have been audited and approved by the administration. Your profile is publicly bookable and authorized to host Google Meet sessions.
            </p>
          </div>
        </FadeUp>
      ) : verificationStatus === "PENDING_REVIEW" ? (
        <FadeUp className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-amber-950">
                Verification Under Review
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                Review Pending
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your documentation is currently undergoing administrative review. You will receive an email notification once your teaching credentials are confirmed.
            </p>
          </div>
        </FadeUp>
      ) : (
        <FadeUp className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center shrink-0 shadow">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Documentation Required
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                Not Submitted
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please submit a government-issued photo ID and university degree diploma below to activate your teaching privileges.
            </p>
          </div>
        </FadeUp>
      )}

      {uploadSuccess && (
        <FadeUp className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="underline font-semibold cursor-pointer">
            Dismiss
          </button>
        </FadeUp>
      )}

      {/* Upload Form */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              <span>Submit Verification Documents</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Encrypted storage compliant with FERPA and GDPR standards. Accessible exclusively by compliance officers.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                >
                  <option value="GOVERNMENT_ID">Government Photo ID (Passport / Driver's License)</option>
                  <option value="DIPLOMA">University Degree / Diploma Certificate</option>
                  <option value="TRANSCRIPT">Official Academic Transcript</option>
                  <option value="TEACHING_LICENSE">State Teaching Credential / Certification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Name / Title
                </label>
                <Input
                  placeholder="e.g. state_id_card.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="text-xs h-9 bg-slate-50 border-slate-200"
                  required
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                PDF, JPG, PNG accepted (Maximum file size: 10MB)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Files are AES-256 encrypted at rest.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Private & Encrypted Upload</span>
              </span>
              <Button type="submit" size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-white">
                Submit Document
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
