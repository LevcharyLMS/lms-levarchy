"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageTransition, FadeIn } from "@/components/animations";
import { LegalDocumentModal, LegalDocKey } from "@/components/legal/legal-document-modal";
import {
  User,
  ShieldCheck,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  Lock,
  Upload,
  FileText,
  AlertTriangle,
  Clock,
  Home,
  UserCheck,
  PenTool,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function InstructorSettingsPage() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab")?.toUpperCase();

  const [activeTab, setActiveTab] = useState<"ACCOUNT" | "PROFILE" | "VERIFICATION">(
    initialTab === "PROFILE" || initialTab === "VERIFICATION" ? (initialTab as any) : "ACCOUNT"
  );

  // Tab 1: Account Settings State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);

  // Notification Preferences State
  const [instEmailBookings, setInstEmailBookings] = useState(true);
  const [instEmailReports, setInstEmailReports] = useState(true);
  const [instEmailPayouts, setInstEmailPayouts] = useState(true);
  const [instWhatsapp, setInstWhatsapp] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifsSaved, setNotifsSaved] = useState(false);

  // Tab 2: Public Profile State
  const [headline, setHeadline] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("3500");
  const [preferredFormat, setPreferredFormat] = useState("BOTH");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Tab 3: Verification State
  const verificationStatus = user?.verification_status || "NOT_SUBMITTED";
  const [legalName, setLegalName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [idDocType, setIdDocType] = useState("GOVERNMENT_ID");
  const [idFileName, setIdFileName] = useState("");
  const [addressDocFileName, setAddressDocFileName] = useState("");
  const [degreeFileName, setDegreeFileName] = useState("");
  const [electronicSignature, setElectronicSignature] = useState("");
  const [agreeBgCheckAuth, setAgreeBgCheckAuth] = useState(false);
  const [certifyAddressFitsId, setCertifyAddressFitsId] = useState(false);
  const [certifyAuthenticity, setCertifyAuthenticity] = useState(false);
  const [showFullAuthText, setShowFullAuthText] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocKey>("backgroundCheck");
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Sync user info into state
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
      setLegalName(`${user.first_name || ""} ${user.last_name || ""}`.trim());
      setAddressLine1(user.address || "");
      setCity(user.city || "");
      setState(user.state || "");
      setPostalCode(user.postal_code || "");
      setCountry(user.country || "United States");
    }
  }, [user]);

  // Load instructor public profile data
  useEffect(() => {
    async function loadInstructorData() {
      if (!user?.id) return;
      try {
        setLoadingProfile(true);
        const res = await fetch(`/api/instructors/profile?userId=${user.id}`);
        const data = await res.json();
        if (data.instructor) {
          setHeadline(data.instructor.headline || "");
          setQualifications(data.instructor.qualifications || "");
          setBio(data.instructor.bio || "");
          setHourlyRate(String(data.instructor.hourly_rate || 3500));
          setPreferredFormat(data.instructor.preferred_format || "BOTH");
        }
      } catch (err) {
        console.error("Failed to load instructor profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadInstructorData();

    // Load saved notification preferences
    if (user?.id) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.preferences) {
            const p = data.preferences;
            if (p.email_bookings !== undefined) setInstEmailBookings(p.email_bookings);
            if (p.email_reports !== undefined) setInstEmailReports(p.email_reports);
            if (p.email_payouts !== undefined) setInstEmailPayouts(p.email_payouts);
            if (p.whatsapp_alerts !== undefined) setInstWhatsapp(p.whatsapp_alerts);
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const handleSaveNotifPreferences = async () => {
    if (!user?.id) return;
    setSavingNotifs(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "UPDATE_PREFERENCES",
          preferences: {
            email_bookings: instEmailBookings,
            email_reports: instEmailReports,
            email_payouts: instEmailPayouts,
            whatsapp_alerts: instWhatsapp,
          },
        }),
      });
      if (res.ok) {
        setNotifsSaved(true);
        setTimeout(() => setNotifsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save instructor notification preferences:", err);
    } finally {
      setSavingNotifs(false);
    }
  };

  // Handle Tab 1: Account Settings Save
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSavingAccount(true);
    try {
      const res = await fetch("/api/instructors/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          firstName,
          lastName,
          phone,
        }),
      });
      if (res.ok) {
        await refreshUser();
        setAccountSaved(true);
        setTimeout(() => setAccountSaved(false), 3000);
      }
    } catch (err) {
      console.error("Error saving account:", err);
    } finally {
      setSavingAccount(false);
    }
  };

  // Handle Tab 2: Public Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/instructors/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          headline,
          qualifications,
          bio,
          hourlyRate: parseInt(hourlyRate, 10),
          preferredFormat,
        }),
      });
      if (res.ok) {
        await refreshUser();
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Tab 3: Verification Submission
  const handleIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setIdFileName(e.target.files[0].name);
  };
  const handleAddressFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAddressDocFileName(e.target.files[0].name);
  };
  const handleDegreeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setDegreeFileName(e.target.files[0].name);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationFeedback(null);

    if (!legalName.trim()) {
      setVerificationFeedback({ type: "error", message: "Full legal name is required." });
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setVerificationFeedback({ type: "error", message: "Complete residential address is required." });
      return;
    }
    if (!idFileName) {
      setVerificationFeedback({
        type: "error",
        message: "Primary government identification document is required.",
      });
      return;
    }
    if (!electronicSignature.trim()) {
      setVerificationFeedback({
        type: "error",
        message: "Please type your full legal name as your electronic signature.",
      });
      return;
    }
    if (!certifyAddressFitsId) {
      setVerificationFeedback({
        type: "error",
        message: "You must certify that your residential address matches your documentation.",
      });
      return;
    }
    if (!agreeBgCheckAuth) {
      setVerificationFeedback({
        type: "error",
        message: "You must agree to the Background Check Authorization.",
      });
      return;
    }
    if (!certifyAuthenticity) {
      setVerificationFeedback({
        type: "error",
        message: "You must declare all information is true and accurate under penalty of perjury.",
      });
      return;
    }

    try {
      setSubmittingVerification(true);
      const res = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          idDocType,
          idFileName,
          addressDocFileName,
          degreeFileName,
          electronicSignature,
          certifyAddressFitsId,
          agreeBgCheckAuth,
          certifyAuthenticity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerificationFeedback({
          type: "success",
          message: "Verification packet submitted successfully! Status updated to Pending Review.",
        });
        await refreshUser();
      } else {
        setVerificationFeedback({
          type: "error",
          message: data.error || "Failed to submit verification details.",
        });
      }
    } catch (err: any) {
      setVerificationFeedback({
        type: "error",
        message: err?.message || "Network error while submitting verification.",
      });
    } finally {
      setSubmittingVerification(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-navy-950">
                Instructor Settings & Verification Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                Faculty Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your personal credentials, public instructor showcase profile, and compliance verification.
            </p>
          </div>
        </div>

        {/* Unified 3-Tab Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <button
            onClick={() => setActiveTab("ACCOUNT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ACCOUNT"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Account & Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "PROFILE"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Public Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("VERIFICATION")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "VERIFICATION"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Identity & Verification</span>
            {verificationStatus === "APPROVED" && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Approved
              </span>
            )}
            {verificationStatus === "PENDING_REVIEW" && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-semibold">
                In Review
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: ACCOUNT & ALERTS */}
        {activeTab === "ACCOUNT" && (
          <FadeIn className="space-y-6">
            {accountSaved && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Account settings saved successfully.</span>
              </div>
            )}

            <Card className="border-slate-200/80 shadow-xs bg-white">
              <CardContent className="p-6">
                <form onSubmit={handleSaveAccount} className="space-y-4">
                  <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <User className="w-4 h-4 text-teal-600" /> Personal Account Credentials
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Email</label>
                    <Input
                      value={user?.email || "tutor@levchary.com"}
                      disabled
                      className="bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (SMS Session Alerts)
                    </label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={savingAccount}
                    className="font-semibold bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 px-5"
                  >
                    {savingAccount ? "Saving Changes..." : "Save Account Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Notifications Delivery Preferences */}
            <Card className="border-slate-200/80 shadow-xs bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-600" /> Notifications &amp; Delivery Preferences
                  </h2>
                  {notifsSaved && (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Preferences saved
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs text-slate-700 divide-y divide-slate-100">
                  <label className="flex items-center justify-between pt-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-navy-950">Student Reservation Email Alerts</p>
                      <p className="text-[11px] text-slate-500">Immediate transactional email when a student reserves a 1-on-1 or cohort class</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={instEmailBookings}
                      onChange={(e) => setInstEmailBookings(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between pt-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-navy-950">Student Feedback &amp; Report Approvals</p>
                      <p className="text-[11px] text-slate-500">Receive student feedback review reports and post-class report approval notices</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={instEmailReports}
                      onChange={(e) => setInstEmailReports(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between pt-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-navy-950">Payout &amp; Earnings Summaries</p>
                      <p className="text-[11px] text-slate-500">Stripe Connect payout disbursement notices and weekly financial receipts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={instEmailPayouts}
                      onChange={(e) => setInstEmailPayouts(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between pt-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-navy-950">WhatsApp Urgent Session Alerts</p>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                          Ready for Integration
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Urgent 15-minute start reminders and booking confirmations via WhatsApp</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={instWhatsapp}
                      onChange={(e) => setInstWhatsapp(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={savingNotifs}
                    onClick={handleSaveNotifPreferences}
                    className="font-semibold bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-4"
                  >
                    {savingNotifs ? "Saving..." : "Save Notification Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* TAB 2: PUBLIC INSTRUCTOR PROFILE */}
        {activeTab === "PROFILE" && (
          <FadeIn className="space-y-6">
            {profileSaved && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Public profile changes published successfully to student discovery.</span>
              </div>
            )}

            <Card className="border-slate-200/80 shadow-xs bg-white">
              <CardContent className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600" /> Marketplace Showcase
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      Displayed on your public instructor card
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Professional Headline
                    </label>
                    <Input
                      placeholder="e.g. Stanford M.S. in Computer Science • 6+ Years AP Tutoring Experience"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hourly Rate (Cents, e.g. 3500 = $35/hr)
                      </label>
                      <Input
                        type="number"
                        placeholder="3500"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preferred Teaching Format
                      </label>
                      <select
                        value={preferredFormat}
                        onChange={(e) => setPreferredFormat(e.target.value)}
                        className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-primary outline-hidden"
                      >
                        <option value="BOTH">Both Virtual & In-Person</option>
                        <option value="ONLINE">Online / Virtual Only</option>
                        <option value="PHYSICAL">Physical / In-Person Only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Verified Credentials & Diplomas
                    </label>
                    <Input
                      placeholder="e.g. B.S. Mathematics, M.S. Applied Physics"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Biography & Curriculum Methodology
                    </label>
                    <Textarea
                      rows={5}
                      placeholder="Describe your teaching philosophy, experience, and what students can expect from your sessions..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={savingProfile || loadingProfile}
                    className="font-semibold bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 px-5"
                  >
                    {savingProfile ? "Saving Profile..." : "Save Profile Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* TAB 3: VERIFICATION */}
        {activeTab === "VERIFICATION" && (
          <FadeIn className="space-y-6">
            {/* Status Banner */}
            {verificationStatus === "APPROVED" ? (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">Identity Verified & Background Approved</h3>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    Your government ID, residential address, and background authorization have been verified. You can publish unlimited courses and receive automated escrow payouts.
                  </p>
                </div>
              </div>
            ) : verificationStatus === "PENDING_REVIEW" ? (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-amber-950">Verification Packet Under Review</h3>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Your residential address details, identity documentation, and Background Check Authorization are undergoing verification review. You will receive an email confirmation once approval is granted.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-blue-950">Mandatory Identity & Background Verification</h3>
                  <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                    Please submit your residential address, government ID, and execute the background check authorization below to unlock public class publishing.
                  </p>
                </div>
              </div>
            )}

            {verificationFeedback && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  verificationFeedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {verificationFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{verificationFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              {/* Part 1: Residential Address */}
              <Card className="border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Home className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-navy-950">1. Residential Address Details</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Legal Name (as shown on Government ID)
                    </label>
                    <Input
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="e.g. Marcus Alexander Chen"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Street Address (Line 1)
                      </label>
                      <Input
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="e.g. 123 Academic Way"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Apt / Suite / Unit (Line 2)
                      </label>
                      <Input
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="e.g. Apt 4B (Optional)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        State / Province
                      </label>
                      <Input value={state} onChange={(e) => setState(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Postal / ZIP Code
                      </label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Part 2: Documentation Uploads */}
              <Card className="border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Upload className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-navy-950">2. Verification Documents</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ID Document */}
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2 bg-slate-50/50">
                      <FileText className="w-6 h-6 text-teal-600 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-navy-950">Government Photo ID *</p>
                        <p className="text-[10px] text-slate-500">Driver License, Passport, or State ID</p>
                      </div>
                      <input
                        type="file"
                        id="govIdInput"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleIdFile}
                      />
                      <label
                        htmlFor="govIdInput"
                        className="inline-block text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer underline"
                      >
                        {idFileName || "Choose File"}
                      </label>
                    </div>

                    {/* Address Proof */}
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2 bg-slate-50/50">
                      <Home className="w-6 h-6 text-teal-600 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-navy-950">Proof of Address</p>
                        <p className="text-[10px] text-slate-500">Utility Bill, Lease, or Bank Statement</p>
                      </div>
                      <input
                        type="file"
                        id="addrInput"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleAddressFile}
                      />
                      <label
                        htmlFor="addrInput"
                        className="inline-block text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer underline"
                      >
                        {addressDocFileName || "Choose File"}
                      </label>
                    </div>

                    {/* Credentials / Degree */}
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2 bg-slate-50/50">
                      <ShieldCheck className="w-6 h-6 text-teal-600 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-navy-950">Degree / Certifications</p>
                        <p className="text-[10px] text-slate-500">Transcripts, Diplomas, or Certificates</p>
                      </div>
                      <input
                        type="file"
                        id="degreeInput"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleDegreeFile}
                      />
                      <label
                        htmlFor="degreeInput"
                        className="inline-block text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer underline"
                      >
                        {degreeFileName || "Choose File"}
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Part 3: Background Authorization */}
              <Card className="border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <PenTool className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold text-navy-950">
                      3. Background Check Authorization & Perjury Declaration
                    </h3>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                    <p className="font-semibold text-navy-950">
                      FCRA Compliance & Third-Party Background Screening Authorization
                    </p>
                    <p className="leading-relaxed">
                      By providing your electronic signature below, you authorize Levchary LMS and its accredited screening partners to perform nationwide criminal, identity, and sex offender registry background checks pursuant to the Fair Credit Reporting Act (15 U.S.C. § 1681).
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={certifyAddressFitsId}
                        onChange={(e) => setCertifyAddressFitsId(e.target.checked)}
                        className="mt-0.5 accent-teal-600 rounded"
                        required
                      />
                      <span>
                        I certify that the residential address provided matches my primary legal domicile and the identification uploaded.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeBgCheckAuth}
                        onChange={(e) => setAgreeBgCheckAuth(e.target.checked)}
                        className="mt-0.5 accent-teal-600 rounded"
                        required
                      />
                      <span>
                        I authorize Levchary LMS to conduct comprehensive background checks under FCRA regulations.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={certifyAuthenticity}
                        onChange={(e) => setCertifyAuthenticity(e.target.checked)}
                        className="mt-0.5 accent-teal-600 rounded"
                        required
                      />
                      <span>
                        I declare under penalty of perjury under the laws of the United States that all statements and credentials submitted are true and authentic.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Type Your Full Legal Name (Electronic Signature) *
                    </label>
                    <Input
                      placeholder="e.g. Marcus Alexander Chen"
                      value={electronicSignature}
                      onChange={(e) => setElectronicSignature(e.target.value)}
                      required
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-teal-600" />
                      <span>Encrypted SSL • Private Compliance Audit Queue</span>
                    </span>

                    <Button
                      type="submit"
                      disabled={submittingVerification}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-6"
                    >
                      {submittingVerification
                        ? "Submitting Verification..."
                        : "Execute Authorization & Submit"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </FadeIn>
        )}
      </div>

      <LegalDocumentModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialDoc={activeLegalDoc}
        allowedDocs={["userAgreement", "privacyPolicy", "instructorAgreement", "backgroundCheck"]}
      />
    </PageTransition>
  );
}
