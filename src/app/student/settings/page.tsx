"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function StudentSettingsPage() {
  const { user, studentProfile, updateStudentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "notifications">("profile");

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [learningGoals, setLearningGoals] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setState(user.state || "");
    }
    if (studentProfile) {
      setGradeLevel(studentProfile.grade_level || "");
      setLearningGoals(studentProfile.learning_goals || "");
    }
  }, [user, studentProfile]);

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
                  <option value="Middle School (Grade 6-8)">Middle School (Grade 6-8)</option>
                  <option value="High School - Freshman/Sophomore (Grade 9-10)">High School - Freshman/Sophomore (Grade 9-10)</option>
                  <option value="High School - Junior/Senior (Grade 11-12)">High School - Junior/Senior (Grade 11-12)</option>
                  <option value="College / Undergraduate">College / Undergraduate</option>
                  <option value="Graduate / Professional">Graduate / Professional</option>
                  <option value="Adult Learner">Adult Learner / Continuing Education</option>
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

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Bell className="w-4 h-4 text-teal-600" /> Notifications & Reminders
            </h2>
            <div className="space-y-3 text-xs text-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
                <div>
                  <p className="font-semibold text-navy-950">24-Hour Session Alert</p>
                  <p className="text-[11px] text-slate-500">Email reminder 24 hours prior to scheduled class</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
                <div>
                  <p className="font-semibold text-navy-950">1-Hour Session Alert</p>
                  <p className="text-[11px] text-slate-500">Urgent alert with virtual classroom entrance link</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
                <div>
                  <p className="font-semibold text-navy-950">Instructor Message Alerts</p>
                  <p className="text-[11px] text-slate-500">Instant notification when your instructor sends a message</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
