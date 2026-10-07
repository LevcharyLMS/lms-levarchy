// ============================================================
// LEVCHARY LMS - BREVO TRANSACTIONAL EMAIL SERVICE
// Production-grade email delivery via Brevo REST API v3
// ============================================================

export interface SendEmailOptions {
  to: string | { email: string; name?: string };
  subject: string;
  htmlContent: string;
  textContent?: string;
  senderName?: string;
  senderEmail?: string;
}

export class BrevoService {
  private static cachedSender: { id?: number; email?: string; name: string } | null = null;

  /**
   * Automatically resolve the verified sender tied to this Brevo API key
   */
  private static async getSender(apiKey: string): Promise<{ id?: number; email?: string; name: string }> {
    if (this.cachedSender) return this.cachedSender;

    try {
      const res = await fetch("https://api.brevo.com/v3/senders", {
        headers: { "api-key": apiKey },
      });
      if (res.ok) {
        const data = await res.json();
        const active = (data.senders || []).find((s: any) => s.active) || data.senders?.[0];
        if (active?.id) {
          this.cachedSender = {
            id: active.id,
            name: "Levchary LMS",
          };
          return this.cachedSender;
        }
      }
    } catch (err) {
      console.warn("Could not auto-fetch Brevo sender:", err);
    }

    // Fallback if unable to query senders
    return { id: 1, name: "Levchary LMS" };
  }

  /**
   * Send a transactional email via Brevo REST API v3 using the API key
   */
  static async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ [BREVO WARNING] BREVO_API_KEY is not configured in .env.local.");
      return { success: false, error: "Brevo API key not configured." };
    }

    const senderInfo = await this.getSender(apiKey);
    const sender = senderInfo.id 
      ? { id: senderInfo.id, name: options.senderName || "Levchary LMS" }
      : { email: senderInfo.email || "noreply@levchary.com", name: options.senderName || "Levchary LMS" };

    const recipient = typeof options.to === "string" 
      ? { email: options.to } 
      : { email: options.to.email, name: options.to.name };

    const payload = {
      sender,
      to: [recipient],
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent || options.subject,
    };

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("❌ Brevo API Error:", res.status, data);
        return {
          success: false,
          error: data?.message || `Brevo API error: ${res.statusText}`,
        };
      }

      return {
        success: true,
        messageId: data?.messageId,
      };
    } catch (err: any) {
      console.error("❌ Network error connecting to Brevo API:", err);
      return {
        success: false,
        error: err?.message || "Failed to reach Brevo email service.",
      };
    }
  }

  /**
   * Send branded Account Verification Email
   */
  static async sendVerificationEmail(params: {
    to: string;
    firstName: string;
    verificationUrl: string;
  }): Promise<{ success: boolean; error?: string }> {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Levchary account</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f4c81 100%); padding: 36px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.15); border-radius: 20px; color: #5eead4; font-size: 11px; font-weight: 600; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
    .lead { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35); }
    .link-alt { font-size: 12px; color: #64748b; line-height: 1.5; word-break: break-all; margin-top: 24px; padding: 16px; background-color: #f1f5f9; border-radius: 8px; }
    .footer { padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; }
    .footer a { color: #0d9488; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Levchary LMS</h1>
      <span class="badge">Account Verification</span>
    </div>
    <div class="content">
      <div class="greeting">Welcome, ${params.firstName}!</div>
      <p class="lead">
        Thank you for joining Levchary. To finalize your account and access verified tutors, classes, and learning dashboards, please confirm your email address:
      </p>
      <div class="btn-container">
        <a href="${params.verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
      </div>
      <p class="lead" style="font-size: 13px; color: #64748b;">
        This verification link will remain active for 24 hours. If you did not create a Levchary account, you can safely disregard this email.
      </p>
      <div class="link-alt">
        If the button above does not work, copy and paste this link into your browser:<br>
        <a href="${params.verificationUrl}" style="color: #0d9488;">${params.verificationUrl}</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Levchary Education Platform. All rights reserved.<br>
      Need help? Reach out to <a href="mailto:support@levchary.com">support@levchary.com</a>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      to: params.to,
      subject: "Verify your email address - Levchary LMS",
      htmlContent,
      textContent: `Welcome ${params.firstName}! Please verify your email by clicking the following link: ${params.verificationUrl}`,
    });
  }
}
