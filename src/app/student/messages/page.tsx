"use client";

import React, { useState, useMemo } from "react";
import { db } from "@/lib/data-store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ModerationService } from "@/services/moderation";
import {
  Send,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  AlertTriangle,
  User,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || "usr-stu-1";
  const [activeConvId, setActiveConvId] = useState("conv-1");
  const [messages, setMessages] = useState(db.getMessages("conv-1"));
  const [inputBody, setInputBody] = useState("");
  const [lastFlagAlert, setLastFlagAlert] = useState<string | null>(null);

  // Available conversation contacts
  const conversations = [
    {
      id: "conv-1",
      tutorId: "usr-tut-1",
      tutorName: "Dr. Marcus Chen",
      subject: "AP Calculus BC",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      lastMessage: "I've reviewed the problem set. Let's cover integration by parts during our session.",
      time: "10:30 AM",
      unread: 0,
    },
    {
      id: "conv-2",
      tutorId: "usr-tut-2",
      tutorName: "Elena Rostova",
      subject: "Quantum Mechanics",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      lastMessage: "Looking forward to Tuesday's lecture!",
      time: "Yesterday",
      unread: 0,
    },
  ];

  const activeContact = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Client-side instant policy preview check
  const inlineScan = useMemo(() => {
    if (!inputBody.trim()) return null;
    const scan = ModerationService.scanText(inputBody);
    return scan.hasFlags ? scan.flags[0] : null;
  }, [inputBody]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBody.trim()) return;

    const { message, flags } = db.sendMessage({
      conversationId: activeConvId,
      senderId: currentUserId,
      body: inputBody,
    });

    setMessages([...db.getMessages(activeConvId)]);
    setInputBody("");

    if (flags.length > 0) {
      setLastFlagAlert(
        `Safety Notice: Your message was automatically flagged for review (${flags[0].type.replace(/_/g, " ")}: "${flags[0].snippet}"). Communications must stay within Levchary.`
      );
    } else {
      setLastFlagAlert(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Messages & Mentorship Chat
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-teal-600" />
              <span>In-App Encrypted</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Communicate directly with your approved instructors regarding syllabus questions and class preparations.
          </p>
        </div>
      </div>

      {lastFlagAlert && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>Rule 19 Safety Filter:</strong> {lastFlagAlert}
          </div>
          <button
            onClick={() => setLastFlagAlert(null)}
            className="font-semibold underline text-amber-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Conversations Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
            Instructors ({conversations.length})
          </span>

          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConvId(conv.id);
                setMessages(db.getMessages(conv.id));
              }}
              className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                activeConvId === conv.id
                  ? "bg-indigo-50/80 border border-primary/20"
                  : "hover:bg-slate-50"
              }`}
            >
              <Avatar className="w-9 h-9 ring-1 ring-slate-200 shrink-0">
                <AvatarImage src={conv.avatar} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xs text-navy-950 truncate">{conv.tutorName}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">{conv.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{conv.subject}</p>
              </div>

              {conv.unread > 0 && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Chat Thread */}
        <Card className="md:col-span-2 border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[560px] bg-white">
          {/* Thread Header */}
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={activeContact.avatar} />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-xs text-navy-950">{activeContact.tutorName}</h3>
                <p className="text-[11px] text-primary font-medium">
                  Verified Instructor • {activeContact.subject}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Avg response: ~10m
            </span>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
            <div className="text-center my-1">
              <span className="px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-semibold">
                Protected Classroom Communication Channel
              </span>
            </div>

            {messages.map((m) => {
              const isMe = m.sender_id === currentUserId;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-primary text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                    }`}
                  >
                    <p>{m.body}</p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 px-1">
                    <span>
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {m.has_flag && (
                      <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                        • Flagged for safety review
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Proactive Safety Warning Preview */}
          {inlineScan && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Warning:</strong> Detected &ldquo;{inlineScan.snippet}&rdquo;. Sharing external contact or payment info violates Rule 19 and will be logged.
              </span>
            </div>
          )}

          {/* Composer */}
          <div className="p-3.5 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder="Type your message to instructor... (e.g. homework questions, lecture notes)"
                value={inputBody}
                onChange={(e) => setInputBody(e.target.value)}
                className="flex-1 text-xs h-9 bg-slate-50 border-slate-200"
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 px-4 text-xs bg-primary hover:bg-primary/90 text-white font-semibold gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </Button>
            </form>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400 shrink-0" />
              <span>All marketplace communications are monitored by Rule 19 to guarantee student safety.</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
