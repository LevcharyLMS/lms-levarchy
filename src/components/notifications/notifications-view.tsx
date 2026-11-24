"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Calendar,
  CreditCard,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Trash2,
  CheckCheck,
  Settings,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition, FadeIn } from "@/components/animations";
import { formatRelative } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

interface NotificationsViewProps {
  userId?: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  settingsUrl?: string;
}

export function NotificationsView({ userId, role, settingsUrl }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const defaultSettingsUrl =
    settingsUrl ||
    (role === "STUDENT"
      ? "/student/settings?tab=notifications"
      : role === "INSTRUCTOR"
      ? "/instructor/settings?tab=notifications"
      : "/admin/settings");

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Granular Action: Mark all as read
  const handleMarkAllRead = async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "MARK_ALL_READ" }),
      });
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  // Granular Action: Toggle individual read/unread
  const handleToggleRead = async (id: string, currentRead: boolean) => {
    const nextRead = !currentRead;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: nextRead } : n))
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, is_read: nextRead }),
      });
    } catch (err) {
      console.error("Failed to toggle notification status:", err);
    }
  };

  // Granular Action: Dismiss / Delete individual notification
  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications?notificationId=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Granular Action: Clear all read notifications
  const handleClearRead = async () => {
    if (!userId) return;
    setNotifications((prev) => prev.filter((n) => !n.is_read));
    try {
      await fetch(`/api/notifications?userId=${userId}&clearAllRead=true`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to clear read notifications:", err);
    }
  };

  const getIcon = (type: string, title: string) => {
    const t = (type || "").toUpperCase();
    const titleLower = (title || "").toLowerCase();

    if (t === "PAYMENT" || t === "PAYOUT" || t === "COMMISSION") {
      return <CreditCard className="w-4 h-4 text-emerald-600" />;
    }
    if (titleLower.includes("report") || titleLower.includes("notes") || t === "REPORT") {
      return <Sparkles className="w-4 h-4 text-teal-600" />;
    }
    if (t === "BOOKING" || t === "CLASS" || titleLower.includes("class")) {
      return <Calendar className="w-4 h-4 text-teal-600" />;
    }
    if (t === "VERIFICATION") {
      return <ShieldCheck className="w-4 h-4 text-purple-600" />;
    }
    return <Bell className="w-4 h-4 text-slate-600" />;
  };

  const getActionLink = (n: NotificationItem) => {
    if (n.link) return n.link;
    const msg = (n.message || "").toLowerCase();
    const title = (n.title || "").toLowerCase();

    if (title.includes("report") || msg.includes("report") || msg.includes("notes")) {
      return role === "STUDENT" ? "/student/classes" : "/instructor/classes";
    }
    if (title.includes("review") || msg.includes("review")) {
      return role === "STUDENT" ? "/student/reviews" : "/instructor/dashboard";
    }
    if (n.type === "BOOKING" || title.includes("booking") || title.includes("class")) {
      return role === "STUDENT" ? "/student/bookings" : "/instructor/calendar";
    }
    if (n.type === "PAYMENT" || n.type === "PAYOUT") {
      return role === "STUDENT" ? "/student/payments" : "/instructor/finances";
    }
    return null;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.length - unreadCount;

  // Simple filtering
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Tab filter
      if (filter === "UNREAD" && n.is_read) return false;
      if (filter === "CLASSES" && !["BOOKING", "CLASS"].includes(n.type) && !n.title.toLowerCase().includes("class")) {
        return false;
      }
      if (filter === "REPORTS" && !n.title.toLowerCase().includes("report") && !n.title.toLowerCase().includes("notes")) {
        return false;
      }
      if (filter === "PAYMENTS" && !["PAYMENT", "PAYOUT", "COMMISSION"].includes(n.type)) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesMsg = n.message.toLowerCase().includes(q);
        return matchesTitle || matchesMsg;
      }

      return true;
    });
  }, [notifications, filter, searchQuery]);

  return (
    <PageTransition>
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* Header (Clean, minimalist layout) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-navy-950 flex items-center gap-2">
              <span>Notifications &amp; Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Stay updated on class schedules, teacher comments, and account activity.
            </p>
          </div>

          {/* Granular Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs h-8 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Mark all as read</span>
              </Button>
            )}

            {readCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearRead}
                className="text-xs h-8 gap-1.5 border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                title="Clear all read notifications"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear read</span>
              </Button>
            )}

            <Button asChild variant="outline" size="sm" className="text-xs h-8 gap-1.5 border-slate-200 text-slate-700">
              <Link href={defaultSettingsUrl}>
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Preferences</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter Pills & Simple Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: `All (${notifications.length})` },
              { id: "UNREAD", label: `Unread (${unreadCount})` },
              { id: "CLASSES", label: "Classes & Sessions" },
              { id: "REPORTS", label: "Reports & Notes" },
              { id: "PAYMENTS", label: "Payments" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.id
                    ? "bg-navy-950 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Simple Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-teal-600 transition-colors"
            />
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl">
            <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <FadeIn>
            <Card className="p-12 text-center bg-white border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-navy-950">No notifications found</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filter === "UNREAD"
                  ? "You're all caught up! No unread notifications."
                  : searchQuery
                  ? "No notifications matching your search query."
                  : "You'll receive alerts here when class schedules update, notes are published, or receipts are issued."}
              </p>
            </Card>
          </FadeIn>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((n) => {
              const actionUrl = getActionLink(n);

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 bg-white group ${
                    !n.is_read
                      ? "border-teal-500/30 shadow-xs bg-teal-50/15 hover:border-teal-500/50"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  {/* Category Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      !n.is_read ? "bg-teal-100/60" : "bg-slate-100"
                    }`}
                  >
                    {getIcon(n.type, n.title)}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-semibold text-xs text-navy-950 truncate">
                          {n.title}
                        </h3>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" title="Unread alert" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelative(n.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Action Link if available */}
                    {actionUrl && (
                      <div className="mt-2.5">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-6 text-[11px] px-2.5 gap-1 border-teal-200 text-teal-800 bg-white hover:bg-teal-50"
                        >
                          <Link href={actionUrl}>
                            <span>View Details</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Granular Action Controls (Toggle read, Dismiss) */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(n.id, n.is_read)}
                      className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all ${
                        !n.is_read ? "text-teal-600" : ""
                      }`}
                      title={n.is_read ? "Mark as unread" : "Mark as read"}
                    >
                      {n.is_read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
