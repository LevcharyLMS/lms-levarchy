"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Bell } from "lucide-react";

export default function TutorSettingsPage() {
  const profile = db.getProfileById("usr-tut-1");
  const [firstName, setFirstName] = useState(profile?.first_name || "Marcus");
  const [lastName, setLastName] = useState(profile?.last_name || "Chen");
  const [phone, setPhone] = useState(profile?.phone || "+1 (617) 555-0102");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateProfile("usr-tut-1", { first_name: firstName, last_name: lastName, phone });
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <Button type="submit" variant="default" className="font-semibold">
              Update Contact Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-teal-600" /> Teaching Notification Preferences
          </h2>
          <div className="space-y-3 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
              <span>Email notification immediately when a student books a session</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
              <span>Reminder alert 1 hour prior to session start with Google Meet conference link</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-600 rounded" />
              <span>Instant notification for student messages in the chat</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
