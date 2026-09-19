"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Bell, Check, Calendar, DollarSign, ShieldCheck, UserCheck } from "lucide-react";
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
}

export default function TutorNotificationsPage() {
  const { user } = useAuth();
  const tutorId = user?.id;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case "PAYOUT":
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case "VERIFICATION":
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-950">
              Instructor Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates on student enrollments, payouts, and compliance verification.
            </p>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="text-xs h-8 gap-1.5 border-slate-200"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>

        {!loading && notifications.length === 0 ? (
          <FadeIn>
            <Card className="p-12 text-center bg-white border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-navy-950">No notifications yet</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You&apos;ll receive notifications when students enroll in your classes, automated payouts clear to your bank, or profile verification completes.
              </p>
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 bg-white ${
                  !n.is_read
                    ? "border-primary/30 shadow-xs bg-indigo-50/20"
                    : "border-slate-200/70"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    !n.is_read ? "bg-primary/10" : "bg-slate-100"
                  }`}
                >
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-xs text-navy-950">{n.title}</h3>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatRelative(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
