import { NextRequest, NextResponse } from "next/server";
import { supabaseDb } from "@/lib/supabase-db";
import { ModerationService } from "@/services/moderation";
import { db as memoryDb } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      const messages = await supabaseDb.getMessages(conversationId);
      return NextResponse.json({ messages });
    }

    if (userId) {
      const conversations = await supabaseDb.getConversations(userId);
      return NextResponse.json({ conversations });
    }

    return NextResponse.json({ error: "Provide userId or conversationId" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching messages/conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderId, text } = body;

    if (!conversationId || !senderId || !text?.trim()) {
      return NextResponse.json({ error: "Missing required message fields" }, { status: 400 });
    }

    // Safety scan
    const scan = ModerationService.scanText(text);

    // Save to memory store / DB
    const res = memoryDb.sendMessage({
      conversationId,
      senderId,
      body: text,
    });

    return NextResponse.json({
      message: res.message,
      flags: scan.flags,
      hasFlags: scan.hasFlags,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
