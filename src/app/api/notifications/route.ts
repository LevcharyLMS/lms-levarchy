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

    const notifications = await supabaseDb.getNotifications(userId);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const success = await supabaseDb.markAllNotificationsRead(userId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error marking notifications read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
