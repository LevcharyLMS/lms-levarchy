"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Bell, Lock } from "lucide-react";

export default function StudentSettingsPage() {
  const profile = db.getProfileById("usr-stu-1");
  const [firstName, setFirstName] = useState(profile?.first_name || "Lucas");
  const [lastName, setLastName] = useState(profile?.last_name || "Miller");
  const [email, setEmail] = useState(profile?.email || "student@levchary.local");
  const [phone, setPhone] = useState(profile?.phone || "+1 (617) 555-0201");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateProfile("usr-stu-1", {
      first_name: firstName,
      last_name: lastName,
      phone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your student profile, contact info, and notification preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile updates saved successfully.</span>
        </div>
      )}

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-teal-600" /> Student Profile Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
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
                className="bg-slate-50 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">
                To change your verified email, contact administration.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Phone (for class reminder alerts)
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button type="submit" variant="default" className="font-semibold">
              Save Changes
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
              <span>Email reminder 24 hours prior to scheduled class</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
              <span>Email reminder 1 hour prior to scheduled class (with Google Meet link)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
              <span>Instant notification when instructor sends an in-app message</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
