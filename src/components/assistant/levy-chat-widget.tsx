"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Send,
  Sparkles,
  Star,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Loader2,
  User,
} from "lucide-react";

interface InstructorCard {
  id: string;
  name: string;
  headline: string;
  avatarUrl?: string;
  rating: number;
  hourlyRate: number;
  subjects: string[];
  instructorType: string;
  profileUrl: string;
}

interface ChipItem {
  label: string;
  action?: string;
  link?: string;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  instructors?: InstructorCard[];
  chips?: ChipItem[];
  timestamp: string;
}

const INITIAL_PROMPT_CHIPS: ChipItem[] = [
  { label: "Find Physics Tutors", action: "I want physics tutor" },
  { label: "Find Math Tutors", action: "Find AP Calculus and Math tutors" },
  { label: "In-Person Hubs", action: "Where are in-person classes held?" },
  { label: "Instructor Vetting", action: "How do you verify instructors?" },
];

export function LevyChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Hello! I'm Levy, your Levchary academic concierge. What subject or grade level are you looking for today?",
      chips: INITIAL_PROMPT_CHIPS,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "I'm here to match you with verified educators or answer questions about Levchary.",
        instructors: data.instructors,
        chips: data.chips,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "I'm having a brief connection pause, but you can browse all verified instructors anytime on our platform.",
          chips: [{ label: "Browse Instructors", link: "/find-instructors" }],
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (chip: ChipItem) => {
    if (chip.link) {
      window.location.href = chip.link;
      return;
    }
    if (chip.action) {
      handleSendMessage(chip.action);
    }
  };

  return (
    /* Bottom-Right Placement */
    <aside aria-label="Academic Assistant" className="fixed bottom-6 right-6 z-50 select-none">
      {/* 1. Collapsed Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 hover:bg-teal-700 text-white shadow-2xl shadow-slate-900/30 transition-all duration-200 hover:scale-[1.03] active:scale-95"
          aria-label="Open Academic Concierge"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
              L
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold leading-tight flex items-center gap-1">
              Ask Levy <Sparkles className="w-3 h-3 text-teal-300" />
            </p>
            <p className="text-[10px] text-slate-300 leading-tight">Academic Concierge</p>
          </div>
        </button>
      )}

      {/* 3. Open Interactive Chat Drawer */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[390px] h-[530px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                  L
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5 leading-tight">
                  Levy · Academic Concierge
                </h3>
                <p className="text-[10px] text-teal-300/80 leading-tight">
                  Instant educator matching & platform guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                    m.sender === "user"
                      ? "bg-teal-600 text-white rounded-br-xs font-medium"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>

                {/* Rich Mini Tutor Cards */}
                {m.instructors && m.instructors.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2">
                    {m.instructors.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-teal-400 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                            {t.avatarUrl ? (
                              <img
                                src={t.avatarUrl}
                                alt={t.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-semibold text-slate-900 truncate text-xs">
                                {t.name}
                              </h4>
                              <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{t.headline}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-600">
                              <span className="flex items-center text-amber-600 font-semibold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                {t.rating.toFixed(1)}
                              </span>
                              <span>&bull;</span>
                              <span className="font-medium text-slate-800">${t.hourlyRate}/hr</span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={t.profileUrl}
                          className="shrink-0 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Reply Action Chips */}
                {m.chips && m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip)}
                        className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 rounded-full text-[11px] font-medium transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>{chip.label}</span>
                        {chip.link && <ExternalLink className="w-2.5 h-2.5 text-slate-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Levy is looking up recommendations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask for physics tutor, math tutor, hubs..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              maxLength={500}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
