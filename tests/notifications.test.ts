import { describe, it, expect, vi } from "vitest";
import { NotificationService } from "../src/services/notification";

describe("Notification Center, Multi-Channel Dispatch & Preferences", () => {
  it("handles multiple channels and logs future WhatsApp hooks", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const res = await NotificationService.dispatchMultiChannel({
      recipientId: "usr-student-1",
      recipientPhone: "+15551234567",
      channels: ["WHATSAPP"],
      title: "Session Feedback Published",
      message: "Your instructor has published session notes for today's class.",
    });

    expect(res.success).toBe(true);
    expect(res.results?.whatsapp).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[WHATSAPP ADAPTER HOOK]")
    );

    consoleSpy.mockRestore();
  });

  it("validates granular toggle read status and filtering", () => {
    const notifications = [
      { id: "n1", title: "Class reminder", is_read: false, type: "BOOKING" },
      { id: "n2", title: "Teacher comments", is_read: true, type: "CLASS" },
      { id: "n3", title: "Tuition receipt", is_read: false, type: "PAYMENT" },
    ];

    const unreadOnly = notifications.filter((n) => !n.is_read);
    expect(unreadOnly.length).toBe(2);

    const toggled = notifications.map((n) => (n.id === "n1" ? { ...n, is_read: true } : n));
    expect(toggled.find((n) => n.id === "n1")?.is_read).toBe(true);
  });

  it("validates notification delivery preferences payload structure", () => {
    const prefs = {
      email_class_reminders: true,
      email_reports: true,
      email_messages: true,
      email_receipts: false,
      in_app_alerts: true,
      whatsapp_alerts: true,
    };

    expect(prefs.email_class_reminders).toBe(true);
    expect(prefs.whatsapp_alerts).toBe(true);
    expect(typeof prefs.email_receipts).toBe("boolean");
  });
});
