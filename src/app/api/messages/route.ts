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
    const recipientId = searchParams.get("recipientId");

    if (conversationId) {
      const messages = await supabaseDb.getMessages(conversationId, userId || undefined);
      return NextResponse.json({ messages });
    }

    if (userId && recipientId) {
      const convId = await supabaseDb.getOrCreateConversation(userId, recipientId);
      const conversations = await supabaseDb.getConversations(userId);
      return NextResponse.json({ conversationId: convId, conversations });
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

    // Save to PostgreSQL DB
    const savedMsg = await supabaseDb.createMessage({
      conversationId,
      senderId,
      body: text,
      hasFlag: scan.hasFlags,
    });

    // If message was flagged by moderation rules, persist to message_flags table
    if (scan.hasFlags && savedMsg?.id) {
      for (const flag of scan.flags) {
        await supabaseDb.createMessageFlag({
          messageId: savedMsg.id,
          flagType: flag.type,
          detectedText: flag.snippet,
          severity: flag.severity,
        }).catch((err) => console.error("Error creating message flag:", err));
      }
    }

    return NextResponse.json({
      message: savedMsg,
      flags: scan.flags,
      hasFlags: scan.hasFlags,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
