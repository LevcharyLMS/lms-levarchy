"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageTransition, FadeIn } from "@/components/animations";
import { Send, ShieldAlert, Lock, Info, MessageSquare, User } from "lucide-react";
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
}

export default function TutorMessagesPage() {
  const { user } = useAuth();
  const tutorId = user?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputBody, setInputBody] = useState("");
  const [flagNotice, setFlagNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real conversations
  useEffect(() => {
    if (!tutorId) return;

    fetch(`/api/messages?userId=${tutorId}`)
      .then((res) => res.json())
      .then((data) => {
        const convs = data.conversations || [];
        setConversations(convs);
        if (convs.length > 0) {
          setActiveConvId(convs[0].id);
        }
      })
      .catch((err) => console.error("Error loading tutor conversations:", err))
      .finally(() => setLoading(false));
  }, [tutorId]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConvId) return;

    fetch(`/api/messages?conversationId=${activeConvId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
      })
      .catch((err) => console.error("Error loading messages:", err));
  }, [activeConvId]);

  const activeContact = conversations.find((c) => c.id === activeConvId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBody.trim() || !activeConvId || !tutorId) return;

    const bodyText = inputBody.trim();
    setInputBody("");

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
        setMessages((prev) => [...prev, data.message]);
      }

      if (data.hasFlags && data.flags?.length > 0) {
        setFlagNotice(
          `Safety notice: Message flagged for administrative review due to detected ${data.flags[0].type.replace(/_/g, " ")}. Please maintain communication on Levchary.`
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
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-950">
              Student Communications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct messaging with enrolled students for lesson coordination and prep questions.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Moderated In-App Chat</span>
          </div>
        </div>

        {flagNotice && (
          <FadeIn>
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">{flagNotice}</div>
              <button onClick={() => setFlagNotice(null)} className="font-semibold underline">
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
              <Link href="/tutor/classes">
                <Button size="sm" className="text-xs bg-primary hover:bg-primary/90 text-white">
                  Manage Your Classes
                </Button>
              </Link>
            </Card>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Conversations Sidebar */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                Enrolled Students ({conversations.length})
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
                    <p className="font-bold text-xs text-navy-950 truncate">
                      {conv.other_first_name} {conv.other_last_name}
                    </p>
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
            <Card className="md:col-span-2 border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              {activeContact && (
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activeContact.other_avatar_url} />
                      <AvatarFallback>
                        {activeContact.other_first_name?.[0]}
                        {activeContact.other_last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-sm text-navy-950">
                        {activeContact.other_first_name} {activeContact.other_last_name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Enrolled Student
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
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
                              ? "bg-navy-900 text-white rounded-br-xs"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                          }`}
                        >
                          <p>{m.body}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input
                    placeholder="Reply to student regarding lesson prep or questions..."
                    value={inputBody}
                    onChange={(e) => setInputBody(e.target.value)}
                    disabled={!activeConvId}
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputBody.trim() || !activeConvId}
                    className="bg-navy-900 hover:bg-navy-800 text-white"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    <span>Send</span>
                  </Button>
                </form>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
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
