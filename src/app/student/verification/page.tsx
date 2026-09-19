"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Upload, FileText, CheckCircle2, Lock } from "lucide-react";

export default function StudentVerificationPage() {
  const [docType, setDocType] = useState("STUDENT_ID");
  const [fileName, setFileName] = useState("");
  const [uploaded, setUploaded] = useState(true); // default demo student is approved

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Student Identity & Enrollment Verification
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verification protects the integrity of our classroom environments and ensures compliance with academic safety standards.
        </p>
      </div>

      {/* Verification Status Banner */}
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-emerald-950">
              Account Status: Verified & Approved
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
              Active
            </span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Your identity and student enrollment status have been verified by administration. You have unrestricted access to all 1-on-1 virtual sessions, group cohorts, and physical learning lab facilities.
          </p>
        </div>
      </div>

      {/* Privacy Notice */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            Strict Document Privacy Guarantee
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Verification documents are stored in private, non-public cloud buckets. Documents are strictly accessible by authorized administrative compliance personnel via short-lived signed URLs (15-minute expiration) with full audit logging. Tutors and public marketplace visitors can never view your identification documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
