"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Bell, Check, Calendar, CreditCard, ShieldCheck, UserCheck, BookOpen, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition, FadeIn } from "@/components/animations";
import { formatRelative } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export default function InstructorNotificationsPage() {
  const { user } = useAuth();
  const tutorId = user?.id;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "BOOKING" | "PAYOUT">("ALL");

  const fetchNotifications = useCallback(() => {
    if (!tutorId) return;
    fetch(`/api/notifications?userId=${tutorId}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch((err) => console.error("Error fetching tutor notifications:", err))
      .finally(() => setLoading(false));
  }, [tutorId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    if (!tutorId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tutorId }),
      });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BOOKING":
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case "PAYOUT":
      case "COMMISSION":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "VERIFICATION":
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case "CLASS":
      case "ASSIGNMENT":
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getNotificationLink = (n: NotificationItem) => {
    if (n.link) return n.link;
    if (n.type === "BOOKING") return "/instructor/calendar";
    if (n.type === "PAYOUT" || n.type === "COMMISSION") return "/instructor/finances";
    if (n.type === "VERIFICATION") return "/instructor/settings?tab=verification";
    if (n.type === "ASSIGNMENT") return "/instructor/assignments";
    return null;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "UNREAD") return !n.is_read;
      if (filter === "BOOKING") return n.type === "BOOKING";
      if (filter === "PAYOUT") return n.type === "PAYOUT" || n.type === "COMMISSION";
      return true;
    });
  }, [notifications, filter]);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-navy-950">
                Instructor Notifications & Alerts
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates on student enrollments, attendance check-ins, automated escrow payouts, and compliance verification.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="text-xs h-8 gap-1.5 border-slate-200 hover:bg-slate-50 shrink-0 font-semibold"
            >
              <Check className="w-3.5 h-3.5 text-teal-600" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs w-fit">
          {[
            { id: "ALL", label: `All (${notifications.length})` },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "BOOKING", label: "Bookings" },
            { id: "PAYOUT", label: "Finances" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filter === tab.id
                  ? "bg-white text-navy-950 shadow-xs"
                  : "text-slate-600 hover:text-navy-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!loading && filteredNotifications.length === 0 ? (
          <FadeIn>
            <Card className="p-12 text-center bg-white border-slate-200/80 shadow-xs rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-navy-950">No notifications in this view</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You&apos;ll receive notifications when students enroll in your classes, automated payouts clear to your bank, or profile verification completes.
              </p>
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((n) => {
              const link = getNotificationLink(n);

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 bg-white ${
                    !n.is_read
                      ? "border-teal-300 shadow-xs bg-teal-50/20"
                      : "border-slate-200/80"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.is_read ? "bg-teal-50 border border-teal-200" : "bg-slate-100"
                    }`}
                  >
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-xs text-navy-950">{n.title}</h3>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelative(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    {link && (
                      <div className="mt-2.5">
                        <Link
                          href={link}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
