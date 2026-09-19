"use client";

import React, { useState } from "react";
import { Bell, Check, Clock, ShieldCheck, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRelative } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "BOOKING" | "PAYMENT" | "SYSTEM" | "VERIFICATION";
  is_read: boolean;
  created_at: string;
}

export default function StudentNotificationsPage() {
  // Real notifications state (initialized with user notifications or empty)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Class Booking Confirmed",
      message: "Your upcoming AP Calculus BC session has been reserved and Google Meet conference attached.",
      type: "BOOKING",
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "notif-2",
      title: "Payment Receipt Issued",
      message: "Receipt LEV-TX-8500 for $85.00 has been recorded in your payment ledger.",
      type: "PAYMENT",
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BOOKING":
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "VERIFICATION":
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy-950">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time session reminders, payment confirmations, and system alerts.
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
          title="No notifications yet"
          description="You are all caught up! Booking updates, class reminders, and messages will appear here."
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
