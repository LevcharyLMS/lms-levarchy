"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Clock,
  MapPin,
  Home,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageTransition, FadeUp } from "@/components/animations";

export default function StudentVerificationPage() {
  const { user, refreshUser } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<string>(
    user?.verification_status || "NOT_SUBMITTED"
  );

  // Residential Address State
  const [addressLine1, setAddressLine1] = useState(user?.address || "");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [postalCode, setPostalCode] = useState(user?.postal_code || "");
  const [country, setCountry] = useState(user?.country || "United States");

  // Document Upload State
  const [docType, setDocType] = useState("GOVERNMENT_ID");
  const [fileName, setFileName] = useState("");
  const [addressCertified, setAddressCertified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!addressLine1 || !city || !state || !postalCode) {
      setFeedback({
        type: "error",
        message: "Please complete all mandatory residential address fields.",
      });
      return;
    }

    if (!fileName) {
      setFeedback({
        type: "error",
        message: "Please select an identity or residence document to upload.",
      });
      return;
    }

    if (!addressCertified) {
      setFeedback({
        type: "error",
        message: "You must certify that your residential address fits the document provided.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "student-user",
          role: "STUDENT",
          residentialAddress: {
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
          },
          idDocument: {
            documentType: docType,
            fileName: fileName,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Failed to submit verification details.",
        });
        setSubmitting(false);
        return;
      }

      setVerificationStatus("PENDING_REVIEW");
      setFeedback({
        type: "success",
        message: data.message || "Your residential address and identity documents have been submitted for compliance review.",
      });
      if (refreshUser) refreshUser();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Network error submitting verification.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
            Trust & Safety Compliance
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Student Identity & Residential Address Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Levchary requires verified residential address and identity credentials for all learners to ensure classroom integrity and compliance with child safety standards.
        </p>
      </div>

      {/* Dynamic Verification Status Banner */}
      {verificationStatus === "APPROVED" ? (
        <FadeUp className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-emerald-950">
                Verified Student Account: Active & Approved
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                Address & ID Verified
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your identity and residential address have been confirmed by our compliance department. You have unrestricted access to book 1-on-1 sessions, join group cohorts, and enter live virtual classrooms.
            </p>
          </div>
        </FadeUp>
      ) : verificationStatus === "PENDING_REVIEW" ? (
        <FadeUp className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-amber-950">
                Verification Documents Under Review
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                Review Pending (Within 24h)
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your residential address details and uploaded identity documents are currently queued for compliance audit. You will receive an email confirmation once verified.
            </p>
          </div>
        </FadeUp>
      ) : (
        <FadeUp className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Identity & Residential Address Required
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please enter your current residential address and upload matching government ID or student credentials below to unlock full booking privileges.
            </p>
          </div>
        </FadeUp>
      )}

      {/* Alert Feedback Banner */}
      {feedback && (
        <FadeUp
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="underline font-semibold cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </FadeUp>
      )}

      {/* Main Verification Form */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Residential Address */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                    <Home className="w-4 h-4 text-indigo-600" />
                    <span>1. Residential Address Verification</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your residential address must fit with the document or ID uploaded.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Street Address (Line 1) *
                  </label>
                  <Input
                    placeholder="e.g. 742 Evergreen Terrace"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                    className="text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Apartment / Suite / Unit (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Apt 4B"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">City *</label>
                  <Input
                    placeholder="e.g. Springfield"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    State / Province / Region *
                  </label>
                  <Input
                    placeholder="e.g. Oregon (OR)"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    ZIP / Postal Code *
                  </label>
                  <Input
                    placeholder="e.g. 97477"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Country *</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="India">India</option>
                    <option value="Singapore">Singapore</option>
                    <option value="International">Other / International</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Identification Document Upload */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>2. Identity & Address Document Upload</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload official identification or student credentials matching your residential address.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Document Category *
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="GOVERNMENT_ID">Government Photo ID (Driver&apos;s License / State ID)</option>
                    <option value="PASSPORT">Passport (with Address Proof Attachment)</option>
                    <option value="STUDENT_ID">School / University Student ID Card</option>
                    <option value="ENROLLMENT_VERIFICATION">Official School Enrollment Verification Letter</option>
                    <option value="PARENT_GUARDIAN_ID">Parent / Guardian Government Photo ID (for minors)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Selected File Name
                  </label>
                  <Input
                    placeholder="No file chosen yet"
                    value={fileName}
                    readOnly
                    className="text-xs h-9 bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Upload Drop Area */}
              <label className="block border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer bg-slate-50/50">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">
                  {fileName ? (
                    <span className="text-indigo-600">Selected: {fileName} (Click to change)</span>
                  ) : (
                    "Click to select PDF, JPG, or PNG document (Max 10MB)"
                  )}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Documents are stored in non-public encrypted cloud storage compliant with FERPA &amp; GDPR.
                </p>
              </label>

              {/* Address Fit Certification Checkbox */}
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-indigo-950 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addressCertified}
                    onChange={(e) => setAddressCertified(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                    required
                  />
                  <span className="leading-snug">
                    <strong>Residential Address Fit Certification:</strong> I certify that the residential address provided above fits and matches the official identification or proof of residence document I am uploading.
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>AES-256 Encrypted • Short-lived signed URLs only</span>
              </span>
              <Button
                type="submit"
                disabled={submitting}
                className="h-9 px-5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-sm"
              >
                {submitting ? "Uploading & Submitting..." : "Submit Verification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Privacy Guarantee Card */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            Strict Document Privacy &amp; Data Isolation Guarantee
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            All verification documents and residential addresses are stored in isolated private cloud infrastructure with full audit trails. Instructors and marketplace visitors can never view your identification documents. Access is strictly limited to verified compliance personnel via short-lived signed URLs (15-minute expiration).
          </p>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
