"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ModerationService } from "@/services/moderation";
import { PageTransition, FadeIn } from "@/components/animations";
import {
  Send,
  ShieldAlert,
  Lock,
  Info,
  AlertTriangle,
  User,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface Conversation {
  id: string;
  other_user_id: string;
  other_first_name: string;
  other_last_name: string;
  other_avatar_url?: string;
  other_role: string;
  last_message_body?: string;
  unread_count: number;
}

interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  has_flag: boolean;
  created_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
}

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputBody, setInputBody] = useState("");
  const [lastFlagAlert, setLastFlagAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real conversations for current authenticated user
  useEffect(() => {
    if (!currentUserId) return;

    fetch(`/api/messages?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        const convs = data.conversations || [];
        setConversations(convs);
        if (convs.length > 0) {
          setActiveConvId(convs[0].id);
        }
      })
      .catch((err) => console.error("Error loading conversations:", err))
      .finally(() => setLoading(false));
  }, [currentUserId]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    fetch(`/api/messages?conversationId=${activeConvId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
      })
      .catch((err) => console.error("Error loading messages:", err));
  }, [activeConvId]);

  const activeContact = useMemo(() => {
    return conversations.find((c) => c.id === activeConvId);
  }, [conversations, activeConvId]);

  // Client-side instant policy preview check
  const inlineScan = useMemo(() => {
    if (!inputBody.trim()) return null;
    const scan = ModerationService.scanText(inputBody);
    return scan.hasFlags ? scan.flags[0] : null;
  }, [inputBody]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBody.trim() || !activeConvId || !currentUserId) return;

    const bodyText = inputBody.trim();
    setInputBody("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          senderId: currentUserId,
          text: bodyText,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }

      if (data.hasFlags && data.flags?.length > 0) {
        setLastFlagAlert(
          `Safety Notice: Your message was flagged for review (${data.flags[0].type.replace(/_/g, " ")}: "${data.flags[0].snippet}"). Communications must stay within Levchary.`
        );
      } else {
        setLastFlagAlert(null);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <PageTransition>
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
          <FadeIn>
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
          </FadeIn>
        )}

        {/* Empty state when user has 0 conversations */}
        {!loading && conversations.length === 0 ? (
          <FadeIn>
            <Card className="p-12 text-center bg-white border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-navy-950">No messages yet</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Your conversations with instructors will appear here once you enroll in a class or reach out for lesson preparation.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/classes">
                  <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explore Classes</span>
                  </Button>
                </Link>
                <Link href="/find-tutors">
                  <Button size="sm" variant="outline" className="text-xs border-slate-200">
                    Find a Tutor
                  </Button>
                </Link>
              </div>
            </Card>
          </FadeIn>
        ) : (
          /* Main Chat Layout */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Conversations Sidebar */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                Instructors ({conversations.length})
              </span>

              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    activeConvId === conv.id
                      ? "bg-indigo-50/80 border border-primary/20"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar className="w-9 h-9 ring-1 ring-slate-200 shrink-0">
                    <AvatarImage src={conv.other_avatar_url} />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-navy-950 truncate">
                        {conv.other_first_name} {conv.other_last_name}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {conv.last_message_body || "New conversation"}
                    </p>
                  </div>

                  {conv.unread_count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Chat Thread */}
            <Card className="md:col-span-2 border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[560px] bg-white">
              {/* Thread Header */}
              {activeContact && (
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={activeContact.other_avatar_url} />
                      <AvatarFallback>
                        {activeContact.other_first_name?.[0]}
                        {activeContact.other_last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-xs text-navy-950">
                        {activeContact.other_first_name} {activeContact.other_last_name}
                      </h3>
                      <p className="text-[11px] text-primary font-medium">
                        Instructor
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
                <div className="text-center my-1">
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-semibold">
                    Protected Classroom Communication Channel
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No messages exchanged in this session yet.
                  </div>
                ) : (
                  messages.map((m) => {
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
                  })
                )}
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
                    disabled={!activeConvId}
                    className="flex-1 text-xs h-9 bg-slate-50 border-slate-200"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputBody.trim() || !activeConvId}
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
        )}
      </div>
    </PageTransition>
  );
}
