"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/data-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Bell } from "lucide-react";

export default function TutorSettingsPage() {
  const { user, refreshUser } = useAuth();
  const tutorId = user?.id || "usr-tut-1";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    db.updateProfile(tutorId, { first_name: firstName, last_name: lastName, phone });
    await refreshUser();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Instructor Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage contact preferences, phone alerts, and notifications.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-teal-600" /> Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
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
              <Input value={user?.email || "tutor@levchary.local"} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (SMS Session Alerts)</label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button type="submit" variant="default" disabled={saving} className="font-semibold bg-teal-600 hover:bg-teal-700 text-white">
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications Preferences */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-teal-600" /> Notifications & Reminders
          </h2>
          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
              <span>Immediate email when a student books a session</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
              <span>SMS reminder 15 minutes before virtual Google Meet begins</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
              <span>Weekly earnings and payout transfer summary</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
