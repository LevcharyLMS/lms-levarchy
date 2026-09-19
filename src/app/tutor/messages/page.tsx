"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, ShieldAlert, Lock, Info } from "lucide-react";

export default function TutorMessagesPage() {
  const tutorId = "usr-tut-1";
  const [activeConvId] = useState("conv-1");
  const [messages, setMessages] = useState(db.getMessages("conv-1"));
  const [inputBody, setInputBody] = useState("");
  const [flagNotice, setFlagNotice] = useState<string | null>(null);

  const student = db.getProfileById("usr-stu-1"); // Lucas Miller

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBody.trim()) return;

    const { message, flags } = db.sendMessage({
      conversationId: activeConvId,
      senderId: tutorId,
      body: inputBody,
    });

    setMessages([...db.getMessages(activeConvId)]);
    setInputBody("");

    if (flags.length > 0) {
      setFlagNotice(
        `Safety notice: Message flagged for administrative review due to detected ${flags[0].type.replace(/_/g, " ")}. Please maintain communication on Levchary.`
      );
    } else {
      setFlagNotice(null);
    }
  };

  return (
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
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">{flagNotice}</div>
          <button onClick={() => setFlagNotice(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={student?.avatar_url || ""} />
              <AvatarFallback>LM</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-sm text-navy-950">
                {student?.first_name} {student?.last_name}
              </h3>
              <p className="text-[11px] text-slate-500">
                Enrolled Student • AP Calculus BC
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m) => {
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
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {m.has_flag && (
                    <span className="text-amber-600 font-semibold">• Flagged for review</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Reply to student regarding lesson prep or questions..."
              value={inputBody}
              onChange={(e) => setInputBody(e.target.value)}
              className="flex-1 text-xs"
            />
            <Button type="submit" variant="default" size="sm" className="gap-1.5 px-4 font-semibold">
              <Send className="w-3.5 h-3.5" /> Reply
            </Button>
          </form>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            Safety notice: Levchary monitors chats for off-platform payment solicitations to protect students and tutors.
          </p>
        </div>
      </Card>
    </div>
  );
}
