"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  User,
  GraduationCap,
  Bell,
  Lock,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Calendar,
  CreditCard,
  Smartphone,
} from "lucide-react";

function StudentSettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("tab") === "notifications" ? "notifications" : "profile";

  const { user, studentProfile, updateStudentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "notifications">(initialTab);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [availableGrades, setAvailableGrades] = useState<{ id: string; name: string }[]>([]);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notification Preferences State
  const [emailClassReminders, setEmailClassReminders] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [emailMessages, setEmailMessages] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifsSaved, setNotifsSaved] = useState(false);

  useEffect(() => {
    if (searchParams?.get("tab") === "notifications") {
      setActiveTab("notifications");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setState(user.state || "");

      // Load saved notification preferences
      fetch(`/api/notifications?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.preferences) {
            const p = data.preferences;
            if (p.email_class_reminders !== undefined) setEmailClassReminders(p.email_class_reminders);
            if (p.email_reports !== undefined) setEmailReports(p.email_reports);
            if (p.email_messages !== undefined) setEmailMessages(p.email_messages);
            if (p.email_receipts !== undefined) setEmailReceipts(p.email_receipts);
            if (p.in_app_alerts !== undefined) setInAppAlerts(p.in_app_alerts);
            if (p.whatsapp_alerts !== undefined) setWhatsappAlerts(p.whatsapp_alerts);
          }
        })
        .catch(() => {});
    }
    if (studentProfile) {
      setGradeLevel(studentProfile.grade_level || "");
      setLearningGoals(studentProfile.learning_goals || "");
    }

    async function loadGrades() {
      try {
        const res = await fetch("/api/admin/grades");
        if (res.ok) {
          const data = await res.json();
          if (data.grades && data.grades.length > 0) {
            setAvailableGrades(data.grades.map((g: any) => ({ id: g.id, name: g.name })));
          }
        }
      } catch {}
    }
    loadGrades();
  }, [user, studentProfile]);

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
            email_class_reminders: emailClassReminders,
            email_reports: emailReports,
            email_messages: emailMessages,
            email_receipts: emailReceipts,
            in_app_alerts: inAppAlerts,
            whatsapp_alerts: whatsappAlerts,
          },
        }),
      });
      if (res.ok) {
        setNotifsSaved(true);
        setTimeout(() => setNotifsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save notification preferences:", err);
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateStudentProfile({
      firstName,
      lastName,
      phone,
      city,
      state,
      gradeLevel,
      learningGoals,
    });
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const initials = user
    ? `${user.first_name?.[0] || "S"}${user.last_name?.[0] || "T"}`
    : "ST";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Account & Profile Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your student profile, academic learning goals, contact info, and preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your profile changes have been saved successfully.</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Academic Profile
        </button>

        <button
          onClick={() => setActiveTab("account")}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "account"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          Account & Contact
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "notifications"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Bell className="w-4 h-4" />
          Notification Alerts
        </button>
      </div>

      {/* TAB 1: ACADEMIC PROFILE */}
      {activeTab === "profile" && (
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <Avatar className="w-14 h-14 border border-slate-200">
                  <AvatarFallback className="bg-teal-700 text-white font-bold text-base">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">
                    {firstName || "Student"} {lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      Verified Learner
                    </span>
                    <span className="text-xs text-slate-400">
                      ID: {user?.id?.slice(0, 8) || "LEVC-STD"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Grade Level / Educational Stage
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">Select your grade level...</option>
                  {availableGrades.length > 0 ? (
                    availableGrades.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Middle School (Grades 6-8)">Middle School (Grades 6-8)</option>
                      <option value="High School (Grades 9-10)">High School (Grades 9-10)</option>
                      <option value="High School (Grades 11-12)">High School (Grades 11-12)</option>
                      <option value="Undergraduate / College">Undergraduate / College</option>
                      <option value="Graduate / Professional">Graduate / Professional</option>
                    </>
                  )}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Helps instructors tailor curriculum depth to your coursework.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Learning Objectives & Target Subjects
                </label>
                <Textarea
                  rows={4}
                  value={learningGoals}
                  placeholder="e.g. Preparing for AP Calculus AB exam in May, focusing on integration techniques and differential equations..."
                  onChange={(e) => setLearningGoals(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <Input
                    value={city}
                    placeholder="e.g. New York"
                    onChange={(e) => setCity(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Region
                  </label>
                  <Input
                    value={state}
                    placeholder="e.g. NY"
                    onChange={(e) => setState(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="font-semibold bg-teal-600 hover:bg-teal-700 text-white text-xs"
              >
                {saving ? "Saving Changes..." : "Save Academic Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: ACCOUNT & CONTACT */}
      {activeTab === "account" && (
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-teal-600" /> Personal Contact Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-slate-50 cursor-not-allowed text-slate-500 text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Verified platform email. To modify, contact support@levchary.com.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone (for class reminder alerts)
                </label>
                <Input
                  value={phone}
                  placeholder="+1 (555) 000-0000"
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="font-semibold bg-teal-600 hover:bg-teal-700 text-white text-xs"
              >
                {saving ? "Saving Changes..." : "Save Contact Info"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: NOTIFICATIONS & DELIVERY PREFERENCES */}
      {activeTab === "notifications" && (
        <div className="space-y-5">
          {notifsSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notification delivery preferences saved successfully.</span>
            </div>
          )}

          {/* Section 1: Email Channel Delivery */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-600" />
                  <span>Email Alerts Delivery</span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  Sent to {email || "your registered email"}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <label className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-navy-950 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>Class Schedule Reminders</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Receive reminders 24 hours and 1 hour before scheduled class sessions.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailClassReminders}
                    onChange={(e) => setEmailClassReminders(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-navy-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Published Post-Class Notes &amp; Reports</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Get alerted when your instructor publishes verified session notes, homework, and comments.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailReports}
                    onChange={(e) => setEmailReports(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-navy-950 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                      <span>Instructor Direct Messages</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Email alerts when an instructor sends you a direct message or reply.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailMessages}
                    onChange={(e) => setEmailMessages(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-navy-950 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                      <span>Tuition Receipts &amp; Invoices</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Immediate receipts for class bookings and payment transactions.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailReceipts}
                    onChange={(e) => setEmailReceipts(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: In-App Platform Alerts */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-600" />
                  <span>In-App Platform Alerts</span>
                </h2>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                  Active
                </span>
              </div>
              <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50/50 p-2 rounded-lg transition-colors text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-navy-950">Show In-App Alert Badges</p>
                  <p className="text-[11px] text-slate-500">
                    Display notification badges on the top header bell and in the Notifications tab.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppAlerts}
                  onChange={(e) => setInAppAlerts(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                />
              </label>
            </CardContent>
          </Card>

          {/* Section 3: WhatsApp Notifications (Prepared & Extensible) */}
          <Card className="border-slate-200 shadow-xs bg-slate-50/50">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Alerts</span>
                </h2>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Ready for Integration
                </span>
              </div>
              <label className="flex items-center justify-between cursor-pointer hover:bg-white/80 p-2 rounded-lg transition-colors text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-navy-950">Receive WhatsApp Class Alerts</p>
                  <p className="text-[11px] text-slate-500">
                    Send real-time session links and reminders directly to your mobile phone via WhatsApp.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pl-2 pt-1">
                <span>Registered Mobile Phone:</span>
                <strong className="text-navy-950">{phone || user?.phone || "Not configured (add in Account tab)"}</strong>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              disabled={savingNotifs}
              onClick={handleSaveNotifPreferences}
              className="font-semibold bg-teal-600 hover:bg-teal-700 text-white text-xs px-6 h-9"
            >
              {savingNotifs ? "Saving Preferences..." : "Save Notification Preferences"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading settings...</div>}>
      <StudentSettingsContent />
    </Suspense>
  );
}
