"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageTransition, FadeIn } from "@/components/animations";
import {
  Send,
  ShieldAlert,
  Lock,
  Info,
  MessageSquare,
  User,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ModerationService } from "@/services/moderation";
import { formatDisplayName } from "@/lib/utils";
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

function InstructorMessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get("recipientId");
  const tutorId = user?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputBody, setInputBody] = useState("");
  const [flagNotice, setFlagNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch real conversations for instructor (handling optional recipientId)
  useEffect(() => {
    if (!tutorId) return;

    const url = recipientId
      ? `/api/messages?userId=${tutorId}&recipientId=${recipientId}`
      : `/api/messages?userId=${tutorId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const convs = data.conversations || [];
        setConversations(convs);
        if (data.conversationId) {
          setActiveConvId(data.conversationId);
        } else if (convs.length > 0) {
          setActiveConvId(convs[0].id);
        }
      })
      .catch((err) => console.error("Error loading tutor conversations:", err))
      .finally(() => setLoading(false));
  }, [tutorId, recipientId]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConvId || !tutorId) return;

    fetch(`/api/messages?conversationId=${activeConvId}&userId=${tutorId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        // Reset unread count locally for active conversation
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConvId ? { ...c, unread_count: 0 } : c))
        );
      })
      .catch((err) => console.error("Error loading tutor messages:", err));
  }, [activeConvId, tutorId]);

  // Real-Time Supabase WebSocket Subscription for incoming messages + Fallback Polling
  useEffect(() => {
    if (!activeConvId || !tutorId) return;

    const channel = supabase
      .channel(`conversation:${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload: any) => {
          const newMsg = payload.new as MessageItem;
          setMessages((prev) => {
            if (
              prev.some(
                (m) =>
                  m.id === newMsg.id ||
                  (m.body === newMsg.body &&
                    m.sender_id === newMsg.sender_id &&
                    Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 3000)
              )
            ) {
              return prev.map((m) =>
                m.body === newMsg.body && m.sender_id === newMsg.sender_id ? newMsg : m
              );
            }
            return [...prev, newMsg];
          });

          if (newMsg.sender_id !== tutorId) {
            fetch(`/api/messages?conversationId=${activeConvId}&userId=${tutorId}`).catch(() => {});
          }

          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvId
                ? {
                    ...c,
                    last_message_body: newMsg.body,
                    unread_count: 0,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    // Safety background sync every 6 seconds
    const interval = setInterval(() => {
      fetch(`/api/messages?conversationId=${activeConvId}&userId=${tutorId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && Array.isArray(data.messages)) {
            setMessages((prev) => {
              if (
                data.messages.length !== prev.length ||
                (data.messages.length > 0 &&
                  prev.length > 0 &&
                  data.messages[data.messages.length - 1].id !== prev[prev.length - 1].id)
              ) {
                return data.messages;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 6000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [activeConvId, tutorId, supabase]);

  const activeContact = conversations.find((c) => c.id === activeConvId);

  // Proactive safety check on instructor's input body
  const inlineScan = useMemo(() => {
    if (!inputBody.trim()) return null;
    const scan = ModerationService.scanText(inputBody);
    return scan.hasFlags ? scan.flags[0] : null;
  }, [inputBody]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBody.trim() || !activeConvId || !tutorId) return;

    const bodyText = inputBody.trim();
    setInputBody("");

    // Optimistic message append
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      id: tempId,
      conversation_id: activeConvId,
      sender_id: tutorId,
      body: bodyText,
      is_read: false,
      has_flag: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Update conversation sidebar preview immediately
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, last_message_body: bodyText } : c))
    );

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          senderId: tutorId,
          text: bodyText,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
      }

      if (data.hasFlags && data.flags?.length > 0) {
        setFlagNotice(
          `Safety Notice: Message flagged for administrative review (${data.flags[0].type.replace(
            /_/g,
            " "
          )}: "${data.flags[0].snippet}"). Communications must stay within Levchary.`
        );
      } else {
        setFlagNotice(null);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold tracking-tight text-navy-950">
                Student Communications
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-600" />
                <span>In-App Encrypted</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Direct messaging with enrolled students for lesson coordination, syllabus guidance, and prep questions.
            </p>
          </div>
        </div>

        {flagNotice && (
          <FadeIn>
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong>Rule 19 Safety Filter:</strong> {flagNotice}
              </div>
              <button onClick={() => setFlagNotice(null)} className="font-semibold underline text-amber-950">
                Dismiss
              </button>
            </div>
          </FadeIn>
        )}

        {!loading && conversations.length === 0 ? (
          <FadeIn>
            <Card className="p-12 text-center bg-white border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-navy-950">No student inquiries yet</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                When students enroll in your classes or submit preparation questions, their conversations will appear here.
              </p>
              <Link href="/instructor/classes">
                <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold">
                  Manage Your Classes
                </Button>
              </Link>
            </Card>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Conversations Sidebar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                Enrolled Students ({conversations.length})
              </span>

              {conversations.map((conv) => {
                const studentDisplayName = formatDisplayName(conv.other_first_name, conv.other_last_name);
                const isActive = activeConvId === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      isActive
                        ? "bg-teal-50/90 border border-primary/20 shadow-xs"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Avatar className="w-9 h-9 ring-1 ring-slate-200 shrink-0">
                      <AvatarImage src={conv.other_avatar_url} />
                      <AvatarFallback>
                        <User className="w-4 h-4 text-slate-400" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-navy-950 truncate">
                        {studentDisplayName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.last_message_body || "New conversation"}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Chat Thread */}
            <Card className="md:col-span-2 border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[620px] bg-white rounded-2xl">
              {activeContact && (
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-1 ring-teal-50">
                      <AvatarImage src={activeContact.other_avatar_url} />
                      <AvatarFallback>
                        {activeContact.other_first_name?.[0]}
                        {activeContact.other_last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-sm text-navy-950">
                        {formatDisplayName(activeContact.other_first_name, activeContact.other_last_name)}
                      </h3>
                      <p className="text-[11px] text-teal-700 font-medium">
                        Enrolled Student
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
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No messages in this conversation yet.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === tutorId;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMe
                              ? "bg-primary text-white rounded-br-xs font-normal"
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
                <div ref={messagesEndRef} />
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
                    placeholder="Reply to student regarding lesson prep, homework, or questions..."
                    value={inputBody}
                    onChange={(e) => setInputBody(e.target.value)}
                    disabled={!activeConvId}
                    className="flex-1 text-xs h-9 bg-slate-50 border-slate-200"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputBody.trim() || !activeConvId}
                    className="h-9 px-4 text-xs bg-primary hover:bg-primary/90 text-white font-semibold gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </Button>
                </form>
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>Rule 19 filter active. Messages with direct off-platform contacts are reviewed by admin.</span>
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default function TutorMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InstructorMessagesContent />
    </Suspense>
  );
}
