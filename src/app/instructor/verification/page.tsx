"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Home,
  UserCheck,
  PenTool,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageTransition, FadeUp } from "@/components/animations";
import { LegalDocumentModal, LegalDocKey } from "@/components/legal/legal-document-modal";

export default function TutorVerificationPage() {
  const { user, refreshUser } = useAuth();
  const verificationStatus = user?.verification_status || "NOT_SUBMITTED";

  // Part 1: Residential Address
  const [legalName, setLegalName] = useState(
    user ? `${user.first_name} ${user.last_name}` : ""
  );
  const [addressLine1, setAddressLine1] = useState(user?.address || "");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [postalCode, setPostalCode] = useState(user?.postal_code || "");
  const [country, setCountry] = useState(user?.country || "United States");

  // Part 2: Documents
  const [idDocType, setIdDocType] = useState("GOVERNMENT_ID");
  const [idFileName, setIdFileName] = useState("");
  const [addressDocFileName, setAddressDocFileName] = useState("");
  const [degreeFileName, setDegreeFileName] = useState("");

  // Part 3: Background Check Authorization (The Crucial Document)
  const [electronicSignature, setElectronicSignature] = useState("");
  const [agreeBgCheckAuth, setAgreeBgCheckAuth] = useState(false);
  const [certifyAddressFitsId, setCertifyAddressFitsId] = useState(false);
  const [certifyAuthenticity, setCertifyAuthenticity] = useState(false);

  // Modal & UI State
  const [showFullAuthText, setShowFullAuthText] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocKey>("backgroundCheck");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setIdFileName(e.target.files[0].name);
  };
  const handleAddressFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAddressDocFileName(e.target.files[0].name);
  };
  const handleDegreeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setDegreeFileName(e.target.files[0].name);
  };

  const openLegalModal = (doc: LegalDocKey) => {
    setActiveLegalDoc(doc);
    setLegalModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validations
    if (!legalName.trim()) {
      setFeedback({ type: "error", message: "Full legal name is required." });
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setFeedback({ type: "error", message: "Complete residential address is required." });
      return;
    }
    if (!idFileName) {
      setFeedback({ type: "error", message: "Primary government identification document is required." });
      return;
    }
    if (!electronicSignature.trim()) {
      setFeedback({
        type: "error",
        message: "Please type your full legal name as your electronic signature.",
      });
      return;
    }
    if (!certifyAddressFitsId) {
      setFeedback({
        type: "error",
        message: "You must certify that your residential address fits with the document or ID uploaded.",
      });
      return;
    }
    if (!agreeBgCheckAuth || !certifyAuthenticity) {
      setFeedback({
        type: "error",
        message: "Please agree to all background check authorization certifications.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "tutor-user",
          role: "TUTOR",
          residentialAddress: {
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
          },
          idDocument: {
            documentType: idDocType,
            fileName: idFileName,
          },
          proofOfAddressDocument: addressDocFileName
            ? { documentType: "PROOF_OF_ADDRESS", fileName: addressDocFileName }
            : null,
          backgroundCheckAuthorization: {
            legalFullName: legalName,
            electronicSignature: electronicSignature,
            signedAt: new Date().toISOString(),
            addressFitCertified: certifyAddressFitsId,
            fcraConsentGiven: agreeBgCheckAuth,
            documentVersion: "LEV-BG-2026.1",
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

      setFeedback({
        type: "success",
        message:
          data.message ||
          "Your identity, residential address, and Background Check Authorization have been submitted for compliance review.",
      });
      if (refreshUser) refreshUser();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Network error while submitting verification.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
            Mandatory Educator Compliance
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Faculty Identity, Residential Address &amp; Background Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Levchary requires mandatory identity verification, residential address validation, and executed background check authorization before instructors can publish classes or accept bookings.
        </p>
      </div>

      {/* Dynamic Status Banner */}
      {verificationStatus === "APPROVED" ? (
        <FadeUp className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-emerald-950">
                Verified Faculty Instructor: Active &amp; Approved
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                Identity &amp; Address Confirmed
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your credentials, residential address, and background authorization have been verified by compliance officers. Your profile is publicly bookable and authorized to create classes.
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
                Verification &amp; Background Check Under Review
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                Audit In Progress (Within 24h)
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your residential address details, identity documentation, and Background Check Authorization are undergoing verification review. You will receive an email confirmation once approval is granted.
            </p>
          </div>
        </FadeUp>
      ) : (
        <FadeUp className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Address Verification &amp; Background Authorization Required
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please enter your residential address, upload suitable government ID fitting the address, and execute the background verification authorization below.
            </p>
          </div>
        </FadeUp>
      )}

      {/* Feedback Alert */}
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Residential Address */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardContent className="p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Home className="w-4 h-4 text-teal-600" />
                  <span>1. Instructor Residential Address Details</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your residential address must fit with the document or ID you are uploading.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Mandatory
              </span>
            </div>

            {/* Instruction Notice */}
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
              <strong>Verification Standard:</strong> Both instructors and students must enter their residential address. It must fit with the document or ID you upload. Our compliance audit confirms your identity and residential jurisdiction.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Legal Name (as printed on your Government ID) *
                </label>
                <Input
                  placeholder="e.g. Dr. Eleanor Jane Vance"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  required
                  className="text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Residential Street Address (Line 1) *
                </label>
                <Input
                  placeholder="e.g. 104 Harvard Avenue"
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
                  placeholder="e.g. Suite 302"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="text-xs h-9 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">City *</label>
                <Input
                  placeholder="e.g. Cambridge"
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
                  placeholder="e.g. Massachusetts (MA)"
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
                  placeholder="e.g. 02138"
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
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none"
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
          </CardContent>
        </Card>

        {/* SECTION 2: Identification & Supporting Documents */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardContent className="p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-600" />
                  <span>2. Identification &amp; Address Verification Documents</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload official photographic ID and supporting address documentation.
                </p>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Encrypted AES-256
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Government ID */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    A. Primary Government Photo ID *
                  </label>
                  <span className="text-[10px] font-semibold text-teal-700">Required</span>
                </div>
                <select
                  value={idDocType}
                  onChange={(e) => setIdDocType(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white outline-none"
                >
                  <option value="GOVERNMENT_ID">Driver&apos;s License (with Address)</option>
                  <option value="PASSPORT">Passport / State ID Card</option>
                  <option value="NATIONAL_ID">National Identity Card</option>
                </select>

                <label className="block border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-teal-400 cursor-pointer bg-white transition-all">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleIdFile}
                    className="hidden"
                  />
                  <FileText className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">
                    {idFileName ? (
                      <span className="text-teal-700">Selected: {idFileName}</span>
                    ) : (
                      "Upload Government Photo ID"
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 10MB)</p>
                </label>
              </div>

              {/* Secondary Proof of Address */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    B. Proof of Residential Address
                  </label>
                  <span className="text-[10px] text-slate-500">If address differs from ID</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Utility bill, bank statement, or lease agreement showing current address.
                </p>

                <label className="block border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-teal-400 cursor-pointer bg-white transition-all mt-1">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleAddressFile}
                    className="hidden"
                  />
                  <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">
                    {addressDocFileName ? (
                      <span className="text-teal-700">Selected: {addressDocFileName}</span>
                    ) : (
                      "Upload Proof of Address Document"
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 10MB)</p>
                </label>
              </div>

              {/* Academic Credentials */}
              <div className="sm:col-span-2 space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    C. Academic Credentials &amp; Diplomas
                  </label>
                  <span className="text-[10px] text-teal-700">Recommended for verification badge</span>
                </div>
                <label className="block border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:border-teal-400 cursor-pointer bg-white transition-all">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleDegreeFile}
                    className="hidden"
                  />
                  <p className="text-xs font-semibold text-slate-700">
                    {degreeFileName ? (
                      <span className="text-teal-700">Selected: {degreeFileName}</span>
                    ) : (
                      "Upload University Degree, Diploma, or State Teaching Credential"
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">PDF or image transcript / diploma certificate</p>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: The Crucial Background Verification Form & Authorization */}
        <Card className="border-teal-200 shadow-sm bg-white ring-1 ring-teal-500/10">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-teal-100 pb-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  FCRA Compliant Vetting Form
                </span>
                <h2 className="text-base font-bold text-navy-950 flex items-center gap-2 mt-1">
                  <PenTool className="w-4 h-4 text-teal-600" />
                  <span>3. Levchary Background Check &amp; Verification Authorization</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Document Version: LEV-BG-2026.1 • Effective Date: October 7, 2026
                </p>
              </div>

              <button
                type="button"
                onClick={() => openLegalModal("backgroundCheck")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                <span>Read Full Document</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Background Check Form Clauses Summary Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950 uppercase tracking-wide text-[11px]">
                  Authorization Summary &amp; Consent Terms
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullAuthText(!showFullAuthText)}
                  className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 text-[11px]"
                >
                  {showFullAuthText ? (
                    <>
                      <span>Hide Detailed Clauses</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Show Detailed Clauses</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              <p>
                By signing below, I authorize Levchary to verify my identity, educational credentials, certifications, professional standing, and residential address. I understand Levchary may use accredited third-party screening providers to confirm the authenticity of reports in accordance with the Fair Credit Reporting Act (FCRA) and applicable state regulations.
              </p>

              {showFullAuthText && (
                <div className="space-y-2.5 pt-3 border-t border-slate-200 text-[11px] text-slate-600 animate-in fade-in duration-200">
                  <p>
                    <strong>1. Direct Verification:</strong> Levchary is authorized to verify credentials with educational institutions, licensing authorities, previous employers, and government agencies.
                  </p>
                  <p>
                    <strong>2. Verification Information Not Public:</strong> All background check reports, residential address documents, and government IDs remain strictly confidential and will never be published to student profiles.
                  </p>
                  <p>
                    <strong>3. Accuracy and Authenticity:</strong> Falsifying any document or misrepresenting qualifications will result in immediate termination of the instructor account and revocation of platform access.
                  </p>
                </div>
              )}
            </div>

            {/* Certifications Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer select-none p-3 bg-teal-50/50 border border-teal-200/80 rounded-xl">
                <input
                  type="checkbox"
                  checked={certifyAddressFitsId}
                  onChange={(e) => setCertifyAddressFitsId(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-teal-400 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                  required
                />
                <span className="leading-relaxed">
                  <strong className="text-teal-950 font-bold block">
                    Residential Address Fit Certification:
                  </strong>
                  I certify that the residential address entered in Section 1 fits and matches with the official document or ID I am uploading.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer select-none p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={agreeBgCheckAuth}
                  onChange={(e) => setAgreeBgCheckAuth(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                  required
                />
                <span className="leading-relaxed">
                  <strong className="text-slate-900 font-bold block">
                    Background Check &amp; Screening Authorization:
                  </strong>
                  I have read and agree to the Levchary Background Check &amp; Verification Authorization. I authorize Levchary and its designated agents to verify my background, identity, and qualifications.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer select-none p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={certifyAuthenticity}
                  onChange={(e) => setCertifyAuthenticity(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                  required
                />
                <span className="leading-relaxed">
                  <strong className="text-slate-900 font-bold block">
                    Authenticity &amp; Accuracy Certification:
                  </strong>
                  I certify that all information and documentation submitted is accurate, current, complete, and authentic to the best of my knowledge.
                </span>
              </label>
            </div>

            {/* Electronic Signature Input Block */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Electronic Signature (Type Your Full Legal Name) *
                  </label>
                  <Input
                    placeholder="e.g. Eleanor Jane Vance"
                    value={electronicSignature}
                    onChange={(e) => setElectronicSignature(e.target.value)}
                    required
                    className="text-xs h-9 bg-white border-slate-300 font-serif italic text-sm tracking-wide"
                  />
                  <p className="text-[10px] text-slate-400">
                    Conforms to the federal E-SIGN Act (15 U.S.C. § 7001).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Date of Electronic Execution
                  </label>
                  <Input
                    value={new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    readOnly
                    className="text-xs h-9 bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400">
                    Account Email: {user?.email || "tutor@levchary.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-3">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Encrypted Storage • Private Compliance Audit Queue</span>
              </span>

              <Button
                type="submit"
                disabled={submitting}
                className="h-10 px-6 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-sm"
              >
                {submitting ? "Submitting Verification..." : "Execute Authorization & Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Legal Document Viewer Modal */}
      <LegalDocumentModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialDoc={activeLegalDoc}
        allowedDocs={["userAgreement", "privacyPolicy", "instructorAgreement", "backgroundCheck"]}
      />
    </PageTransition>
  );
}
