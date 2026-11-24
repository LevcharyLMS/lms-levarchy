import { NextRequest, NextResponse } from "next/server";
import { db, db as memoryDb } from "@/lib/data-store";
import { supabaseDb } from "@/lib/supabase-db";
import { NotificationService } from "@/services/notification";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = db.getProfiles();
    const audienceList = profiles.map((p) => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      email: p.email,
      role: p.role,
    }));
    return NextResponse.json({ users: audienceList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      targetAudience, // 'EVERYONE' | 'STUDENTS' | 'INSTRUCTORS' | 'SELECTED'
      selectedUserIds = [],
      subject,
      content,
      channels = ["IN_APP", "EMAIL"],
      adminId = "usr-admin-1",
    } = body;

    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Subject and message content are required." },
        { status: 400 }
      );
    }

    const allProfiles = db.getProfiles();
    let recipientProfiles: typeof allProfiles = [];

    switch (targetAudience) {
      case "EVERYONE":
        recipientProfiles = allProfiles.filter((p) => p.account_status !== "SUSPENDED");
        break;
      case "STUDENTS":
        recipientProfiles = allProfiles.filter(
          (p) => p.role === "STUDENT" && p.account_status !== "SUSPENDED"
        );
        break;
      case "INSTRUCTORS":
        recipientProfiles = allProfiles.filter(
          (p) =>
            (p.role === "INSTRUCTOR" || (p.role as any) === "TUTOR") &&
            p.account_status !== "SUSPENDED"
        );
        break;
      case "SELECTED":
        recipientProfiles = allProfiles.filter((p) => selectedUserIds.includes(p.id));
        break;
      default:
        return NextResponse.json({ error: "Invalid target audience selected." }, { status: 400 });
    }

    if (recipientProfiles.length === 0) {
      return NextResponse.json(
        { error: "No recipients found for selected criteria." },
        { status: 400 }
      );
    }

    let dispatchedCount = 0;

    for (const recipient of recipientProfiles) {
      try {
        // Dispatch notification
        await NotificationService.dispatchMultiChannel({
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          channels: channels.length > 0 ? channels : ["IN_APP"],
          title: `[Announcement] ${subject}`,
          message: content,
          htmlContent: `<p><strong>${subject}</strong></p><p>${content.replace(/\n/g, "<br/>")}</p>`,
          idempotencyKey: `broadcast-${Date.now()}-${recipient.id}`,
        });

        // Also create conversation & message record if direct message channel is desired
        try {
          const convId = await supabaseDb.getOrCreateConversation(adminId, recipient.id);
          if (convId) {
            await supabaseDb.createMessage({
              conversationId: convId,
              senderId: adminId,
              body: `[Announcement: ${subject}]\n\n${content}`,
              hasFlag: false,
            });
          }
        } catch {
          // In offline or fallback mode, save to in-memory store
          memoryDb.sendMessage({
            conversationId: `conv-admin-${recipient.id}`,
            senderId: adminId,
            body: `[Announcement: ${subject}]\n\n${content}`,
            hasFlag: false,
          });
        }

        dispatchedCount++;
      } catch (err) {
        console.error(`Failed to dispatch message to recipient ${recipient.id}:`, err);
      }
    }

    // Log in audit trail
    db.logAudit({
      actor_id: adminId,
      actor_role: "ADMIN",
      action: "BROADCAST_MESSAGE_SENT",
      entity_type: "MESSAGE",
      entity_id: `broadcast-${Date.now()}`,
      metadata: {
        targetAudience,
        recipientCount: dispatchedCount,
        subject,
      },
    });

    return NextResponse.json({
      success: true,
      targetAudience,
      dispatchedCount,
      totalSelected: recipientProfiles.length,
    });
  } catch (error: any) {
    console.error("Error processing broadcast message:", error);
    return NextResponse.json({ error: error.message || "Failed to broadcast message" }, { status: 500 });
  }
}
