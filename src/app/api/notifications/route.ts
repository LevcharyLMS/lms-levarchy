import { NextRequest, NextResponse } from "next/server";
import { supabaseDb } from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const [notifications, preferences] = await Promise.all([
      supabaseDb.getNotifications(userId),
      supabaseDb.getNotificationPreferences(userId),
    ]);

    return NextResponse.json({ notifications, preferences });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationId, is_read, action, preferences } = body;

    // Action 1: Toggle single notification read / unread
    if (notificationId !== undefined && is_read !== undefined) {
      const updated = await supabaseDb.toggleNotificationRead(notificationId, is_read);
      return NextResponse.json({ success: true, notification: updated });
    }

    // Action 2: Update notification delivery preferences
    if (action === "UPDATE_PREFERENCES" && userId && preferences) {
      const success = await supabaseDb.updateNotificationPreferences(userId, preferences);
      return NextResponse.json({ success });
    }

    // Action 3: Mark all notifications read for user
    if (userId) {
      const success = await supabaseDb.markAllNotificationsRead(userId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("notificationId");
    const userId = searchParams.get("userId");
    const clearAllRead = searchParams.get("clearAllRead") === "true";

    if (notificationId) {
      const success = await supabaseDb.deleteNotification(notificationId);
      return NextResponse.json({ success });
    }

    if (userId && clearAllRead) {
      const success = await supabaseDb.clearReadNotifications(userId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: "Missing notificationId or userId" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
