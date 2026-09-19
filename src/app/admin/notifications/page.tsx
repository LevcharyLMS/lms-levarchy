"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bell, Send, CheckCircle2 } from "lucide-react";

export default function AdminNotificationsPage() {
  const [targetRole, setTargetRole] = useState("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setSentNotice(`System broadcast "${title}" successfully dispatched to ${targetRole} users.`);
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          System Broadcasts & Notifications
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dispatch platform-wide alerts, holiday schedules, or urgent compliance notifications.
        </p>
      </div>

      {sentNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sentNotice}</span>
          </div>
          <button onClick={() => setSentNotice(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <form onSubmit={handleBroadcast} className="space-y-4">
            <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Bell className="w-4 h-4 text-purple-700" /> Send System Broadcast
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg bg-white outline-none"
              >
                <option value="ALL">All Users (Students + Tutors)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="TUTORS">Certified Tutors Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Title</label>
              <Input
                placeholder="e.g. Schedule Update: Labor Day Holiday Center Hours"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Message</label>
              <Textarea
                placeholder="Message body displayed in user notification feed..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="default" className="font-semibold bg-purple-900 hover:bg-purple-800 gap-1.5">
              <Send className="w-3.5 h-3.5" /> Dispatch Broadcast
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
