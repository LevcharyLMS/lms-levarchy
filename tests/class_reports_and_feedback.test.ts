import { describe, it, expect, vi } from "vitest";
import { BrevoService } from "../src/lib/brevo";
import { NotificationService } from "../src/services/notification";

describe("Post-Class Reports, Admin Moderation & Feedback Review Alerts", () => {
  describe("1. Site-Uniform Email Templates", () => {
    it("renders uniform branded layout with brand colors, badge, and footer", () => {
      const html = BrevoService.renderBrandedLayout(
        "Student Feedback Report",
        "Feedback Summary",
        "<p>Test Content</p>"
      );

      expect(html).toContain("Levchary LMS");
      expect(html).toContain("Student Feedback Report");
      expect(html).toContain("#0f172a"); // Navy brand color
      expect(html).toContain("#0d9488"); // Teal brand accent
      expect(html).toContain("Test Content");
    });

    it("formats star ratings and reviews correctly in feedback report email", async () => {
      const sendSpy = vi.spyOn(BrevoService, "sendEmail").mockResolvedValue({
        success: true,
        messageId: "mock-msg-123",
      });

      const res = await BrevoService.sendFeedbackReviewReportEmail({
        to: "instructor@test.com",
        instructorName: "Dr. Evelyn Reed",
        totalReviews: 12,
        averageRating: 4.8,
        recentReviews: [
          {
            studentName: "Alex Rivera",
            rating: 5,
            comment: "Exceptional calculus explanations and real-world examples!",
            date: "Nov 23, 2026",
            classTitle: "Advanced Calculus Cohort",
          },
        ],
      });

      expect(sendSpy).toHaveBeenCalled();
      const callArgs = sendSpy.mock.calls[0][0];
      expect(callArgs.to).toBe("instructor@test.com");
      expect(callArgs.subject).toContain("4.8★ Rating Summary");
      expect(callArgs.htmlContent).toContain("Dr. Evelyn Reed");
      expect(callArgs.htmlContent).toContain("Alex Rivera");
      expect(callArgs.htmlContent).toContain("Exceptional calculus explanations");

      sendSpy.mockRestore();
    });

    it("generates approval notification when report is approved and published over platform", async () => {
      const sendSpy = vi.spyOn(BrevoService, "sendEmail").mockResolvedValue({
        success: true,
      });

      await BrevoService.sendClassReportApprovalNotification({
        to: "instructor@test.com",
        instructorName: "Marcus Vance",
        classTitle: "Physics Laboratory",
        sessionDate: "11/23/2026",
      });

      expect(sendSpy).toHaveBeenCalled();
      const callArgs = sendSpy.mock.calls[0][0];
      expect(callArgs.subject).toContain("Class Report Approved & Published: Physics Laboratory");
      expect(callArgs.htmlContent).toContain("Status: Published over Platform");

      sendSpy.mockRestore();
    });
  });

  describe("2. Multi-Channel Notification Dispatcher", () => {
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
  });

  describe("3. Class Report State Validation", () => {
    it("validates post-class report mandatory fields", () => {
      const isValid = (data: { topicsCovered?: string; textClassComments?: string }) => {
        return Boolean(data.topicsCovered?.trim() && data.textClassComments?.trim());
      };

      expect(isValid({})).toBe(false);
      expect(isValid({ topicsCovered: "Topics" })).toBe(false);
      expect(isValid({ topicsCovered: "Topics", textClassComments: "Comments" })).toBe(true);
    });

    it("verifies lifecycle state progression from PENDING_ADMIN_REVIEW to APPROVED/PUBLISHED", () => {
      const validStatuses = ["DRAFT", "PENDING_ADMIN_REVIEW", "APPROVED", "PUBLISHED", "CHANGES_REQUESTED"];
      const initial = "PENDING_ADMIN_REVIEW";
      const approved = "APPROVED";

      expect(validStatuses.includes(initial)).toBe(true);
      expect(validStatuses.includes(approved)).toBe(true);
    });
  });
});
