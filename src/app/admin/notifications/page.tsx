"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { PageTransition } from "@/components/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bell, Send, CheckCircle2, Inbox } from "lucide-react";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"FEED" | "DISPATCH">("FEED");
  const [targetRole, setTargetRole] = useState("EVERYONE");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/messages/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAudience: targetRole,
          subject: title,
          content: message,
          channels: ["IN_APP", "EMAIL"],
          adminId: user?.id || "usr-admin-1",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSentNotice(
          `Announcement "${title}" successfully broadcasted to ${data.dispatchedCount} user(s).`
        );
        setTitle("");
        setMessage("");
      } else {
        setSentNotice(data.error || "Failed to dispatch broadcast.");
      }
    } catch (err: any) {
      setSentNotice(err.message || "Failed to dispatch broadcast.");
    } finally {
      setSubmitting(false);
    }
  };

  const commTabs = [
    { label: "Broadcast Announcements", href: "/admin/messages" },
    { label: "Notifications Feed", href: "/admin/notifications" },
  ];

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Communications Hub"
        badgeText="Notifications Feed"
        description="Review incoming administrative notifications and dispatch verified platform-wide alerts."
        tabs={commTabs}
        actions={
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab("FEED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "FEED"
                  ? "bg-white text-navy-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Admin Feed</span>
            </button>
            <button
              onClick={() => setActiveTab("DISPATCH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "DISPATCH"
                  ? "bg-white text-navy-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Alerts</span>
            </button>
          </div>
        }
      />

      {sentNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sentNotice}</span>
          </div>
          <button onClick={() => setSentNotice(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: Live Unified Notification Feed */}
      {activeTab === "FEED" && (
        <NotificationsView
          userId={user?.id || "usr-admin-1"}
          role="ADMIN"
          settingsUrl="/admin/settings"
        />
      )}

      {/* Tab 2: Dispatch Broadcast Form */}
      {activeTab === "DISPATCH" && (
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6">
            <form onSubmit={handleBroadcast} className="space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Bell className="w-4 h-4 text-primary" /> Dispatch Platform Broadcast
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="EVERYONE">Everyone (All Students + Instructors)</option>
                  <option value="STUDENTS">All Students Only</option>
                  <option value="INSTRUCTORS">Verified Instructors Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Title</label>
                <Input
                  placeholder="e.g. System Maintenance Notice: Saturday 2:00 AM UTC"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Message</label>
                <Textarea
                  placeholder="Detailed message displayed in user notification feed..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="font-semibold bg-primary hover:bg-teal-700 text-white gap-1.5 h-9 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Broadcasting..." : "Dispatch Broadcast"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </PageTransition>
  );
}
