"use client";

import React, { useState } from "react";
import { Bell, Check, Clock, DollarSign, Calendar, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRelative } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "BOOKING" | "PAYOUT" | "VERIFICATION" | "STUDENT";
  is_read: boolean;
  created_at: string;
}

export default function TutorNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-tut-1",
      title: "New Student Booking Received",
      message: "Lucas Miller has booked your AP Calculus BC slot for Thursday at 10:00 AM.",
      type: "BOOKING",
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "notif-tut-2",
      title: "Teaching Verification Approved",
      message: "Congratulations! Administration has reviewed and approved your university credentials and ID.",
      type: "VERIFICATION",
      is_read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "notif-tut-3",
      title: "Stripe Connect Onboarding Active",
      message: "Your payout routing credentials have been verified. Completed sessions will disburse directly to your bank.",
      type: "PAYOUT",
      is_read: true,
      created_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy-950">
            Instructor Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time student reservations, schedule updates, verification alerts, and payout notices.
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="text-xs h-8 gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Your notifications regarding class bookings, student inquiries, and payouts will appear here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3.5 transition-colors ${
                !n.is_read ? "bg-indigo-50/20" : "hover:bg-slate-50/60"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-navy-950 truncate">
                    {n.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelative(n.created_at)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {n.message}
                </p>
              </div>
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
