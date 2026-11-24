import { describe, it, expect, vi } from "vitest";
import { BrevoService } from "../src/lib/brevo";

describe("Forgot Password & Reset Password Authentication Flow", () => {
  it("generates branded password reset email with secure reset link", async () => {
    const sendSpy = vi.spyOn(BrevoService, "sendEmail").mockResolvedValue({
      success: true,
    });

    await BrevoService.sendPasswordResetEmail({
      to: "student@example.com",
      firstName: "Manoj",
      resetUrl: "http://localhost:3000/reset-password?token=rst_test123&email=student%40example.com",
    });

    expect(sendSpy).toHaveBeenCalled();
    const callArgs = sendSpy.mock.calls[0][0];
    expect(callArgs.to).toBe("student@example.com");
    expect(callArgs.subject.toLowerCase()).toContain("reset your levchary");
    expect(callArgs.htmlContent).toContain("Reset Password");
    expect(callArgs.htmlContent).toContain("rst_test123");
    expect(callArgs.htmlContent).toContain("Manoj");

    sendSpy.mockRestore();
  });

  it("creates, verifies, and resets password in SupabaseDbService", async () => {
    const { SupabaseDbService } = await import("../src/lib/supabase-db");
    const { db } = await import("../src/lib/data-store");

    const testEmail = "reset-tester@levchary.com";
    db.createUser({
      email: testEmail,
      role: "STUDENT",
      firstName: "Reset",
      lastName: "Tester",
    });

    // 1. Create token
    const res = await SupabaseDbService.createPasswordResetToken(testEmail);
    expect(res).not.toBeNull();
    expect(res?.token).toBeDefined();
    const token = res!.token;

    // 2. Verify valid token
    const verifySuccess = await SupabaseDbService.verifyPasswordResetToken(testEmail, token);
    expect(verifySuccess.valid).toBe(true);

    // 3. Verify invalid token rejection
    const verifyBad = await SupabaseDbService.verifyPasswordResetToken(testEmail, "bad-token-xyz");
    expect(verifyBad.valid).toBe(false);

    // 4. Reset password
    const resetRes = await SupabaseDbService.resetPasswordWithToken(
      testEmail,
      token,
      "new_hashed_password_123"
    );
    expect(resetRes.success).toBe(true);

    // 5. Token is now consumed/invalidated
    const verifyAfter = await SupabaseDbService.verifyPasswordResetToken(testEmail, token);
    expect(verifyAfter.valid).toBe(false);
  });
});
