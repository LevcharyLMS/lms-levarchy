"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/data-store";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Send,
  Users,
  UserCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  X,
  Mail,
  Bell,
  MessageSquare,
} from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>(db.state.messages || []);
  const [users, setUsers] = useState<any[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [targetAudience, setTargetAudience] = useState<"EVERYONE" | "STUDENTS" | "INSTRUCTORS" | "SELECTED">("EVERYONE");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [channels, setChannels] = useState<("IN_APP" | "EMAIL")[]>(["IN_APP", "EMAIL"]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/messages/broadcast")
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setUsers(d.users);
      })
      .catch((err) => console.error("Failed to load user directory:", err));
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/messages/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAudience,
          selectedUserIds,
          subject,
          content,
          channels,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Broadcast delivered successfully to ${data.dispatchedCount} user(s).`);
        setIsComposerOpen(false);
        setSubject("");
        setContent("");
        setSelectedUserIds([]);
        setMessages([...db.state.messages]);
      } else {
        setFeedback(data.error || "Failed to dispatch broadcast.");
      }
    } catch (err: any) {
      setFeedback(err.message || "Network error while dispatching broadcast.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChannel = (ch: "IN_APP" | "EMAIL") => {
    if (channels.includes(ch)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== ch));
      }
    } else {
      setChannels([...channels, ch]);
    }
  };

  const toggleSelectedUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              In-App Message Supervision & Announcements
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
              Broadcast Center
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Supervise classroom communications, intercept safety violations, and dispatch platform announcements.
          </p>
        </div>

        <Button
          onClick={() => setIsComposerOpen(true)}
          className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>New Broadcast Message</span>
        </Button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Broadcast Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-primary">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-950 text-sm">Compose Administrative Announcement</h3>
                  <p className="text-[11px] text-slate-500">Dispatch message to everyone, roles, or selected users</p>
                </div>
              </div>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              {/* Audience Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Target Audience</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "EVERYONE", label: "Everyone", icon: Users },
                    { id: "STUDENTS", label: "All Students", icon: GraduationCap },
                    { id: "INSTRUCTORS", label: "All Instructors", icon: UserCheck },
                    { id: "SELECTED", label: "Selected Users", icon: MessageSquare },
                  ].map((aud) => {
                    const Icon = aud.icon;
                    const isSelected = targetAudience === aud.id;
                    return (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => setTargetAudience(aud.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-primary bg-teal-50/60 text-primary font-bold shadow-xs"
                            : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px]">{aud.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Select User Picker if "SELECTED" */}
              {targetAudience === "SELECTED" && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 text-[11px]">
                      Choose Individual Users ({selectedUserIds.length} selected)
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                    {users.map((u) => {
                      const isChecked = selectedUserIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center justify-between py-1.5 px-2 hover:bg-white rounded cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectedUser(u.id)}
                              className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <div>
                              <p className="font-medium text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 text-[9px] rounded font-semibold bg-slate-200 text-slate-700">
                            {u.role}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Channels */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Delivery Channels</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleChannel("IN_APP")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      channels.includes("IN_APP")
                        ? "border-primary bg-teal-50 text-primary"
                        : "border-slate-200 text-slate-500 bg-white"
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>In-App Notification & Direct Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChannel("EMAIL")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      channels.includes("EMAIL")
                        ? "border-primary bg-teal-50 text-primary"
                        : "border-slate-200 text-slate-500 bg-white"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Dispatch</span>
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Header</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Important Schedule Update for Semester Examination"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write clear, comprehensive instructions for recipients..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsComposerOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || (targetAudience === "SELECTED" && selectedUserIds.length === 0)}
                  className="h-8 text-xs bg-primary hover:bg-teal-700 text-white flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{submitting ? "Broadcasting..." : "Dispatch Announcement"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages Supervision Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Message ID</th>
                <th className="p-4">Sender ID</th>
                <th className="p-4">Message Content</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Flag Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-medium text-navy-950">{m.id}</td>
                  <td className="p-4 font-mono text-slate-600">{m.sender_id}</td>
                  <td className="p-4 max-w-md text-slate-800 font-sans">
                    {m.body}
                  </td>
                  <td className="p-4 text-slate-500">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="p-4">
                    {m.has_flag ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                        <ShieldAlert className="w-3 h-3" /> Flagged
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Clear
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
