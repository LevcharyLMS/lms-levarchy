"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { NotificationsView } from "@/components/notifications/notifications-view";

export default function InstructorNotificationsPage() {
  const { user } = useAuth();

  return (
    <NotificationsView
      userId={user?.id}
      role="INSTRUCTOR"
      settingsUrl="/instructor/settings?tab=notifications"
    />
  );
}
