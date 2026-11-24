"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { NotificationsView } from "@/components/notifications/notifications-view";

export default function StudentNotificationsPage() {
  const { user } = useAuth();

  return (
    <NotificationsView
      userId={user?.id}
      role="STUDENT"
      settingsUrl="/student/settings?tab=notifications"
    />
  );
}
