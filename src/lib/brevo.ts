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

  /**
   * Universal Site-Branded Layout Helper
   */
  static renderBrandedLayout(badge: string, title: string, bodyContent: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f4c81 100%); padding: 32px 28px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 14px; background: rgba(255,255,255,0.15); border-radius: 20px; color: #5eead4; font-size: 11px; font-weight: 600; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 28px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 18px 0; }
    .stat-grid { display: flex; gap: 12px; margin: 16px 0; }
    .stat-box { flex: 1; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-val { font-size: 20px; font-weight: 700; color: #0f172a; }
    .stat-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 2px; }
    .btn-container { text-align: center; margin: 26px 0; }
    .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 13px; border-radius: 8px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); }
    .footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; }
    .footer a { color: #0d9488; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Levchary LMS</h1>
      <span class="badge">${badge}</span>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      &copy; 2026 Levchary LMS. All rights reserved.<br>
      Automated system alert &bull; <a href="https://levchary.com">levchary.com</a>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Send Student Feedback Review Report Email Alert to Instructor
   */
  static async sendFeedbackReviewReportEmail(params: {
    to: string;
    instructorName: string;
    totalReviews: number;
    averageRating: number;
    recentReviews: Array<{
      studentName: string;
      rating: number;
      comment: string;
      date: string;
      classTitle?: string;
    }>;
    viewUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const starStr = (r: number) => "★".repeat(Math.round(r)) + "☆".repeat(Math.max(0, 5 - Math.round(r)));

    const reviewsHtml = params.recentReviews
      .map(
        (rev) => `
        <div style="border-bottom: 1px solid #e2e8f0; padding: 12px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #0f172a; font-size: 13px;">${rev.studentName}</strong>
            <span style="color: #f59e0b; font-size: 14px;">${starStr(rev.rating)} (${rev.rating}/5)</span>
          </div>
          ${rev.classTitle ? `<div style="font-size: 11px; color: #0d9488; margin-bottom: 4px;">Class: ${rev.classTitle}</div>` : ""}
          <p style="margin: 0; font-size: 13px; color: #334155; font-style: italic;">"${rev.comment || "No written comments."}"</p>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${rev.date}</div>
        </div>
      `
      )
      .join("");

    const bodyContent = `
      <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        Hello, ${params.instructorName}!
      </div>
      <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 0;">
        Here is your compiled Student Feedback Review Report. Review the summary metrics and detailed ratings submitted by students for your classes below:
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #f8fafc;">
        <tr>
          <td style="padding: 16px; text-align: center; border-right: 1px solid #e2e8f0; width: 50%;">
            <div style="font-size: 26px; font-weight: 800; color: #0f766e;">${params.averageRating.toFixed(1)} / 5.0</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 2px;">Average Rating</div>
          </td>
          <td style="padding: 16px; text-align: center; width: 50%;">
            <div style="font-size: 26px; font-weight: 800; color: #0f172a;">${params.totalReviews}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 2px;">Total Reviews Evaluated</div>
          </td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <h3 style="font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 2px solid #0d9488; padding-bottom: 4px;">
          Student Comments & Evaluations
        </h3>
        ${reviewsHtml || `<p style="font-size: 13px; color: #64748b;">No individual reviews recorded in this period.</p>`}
      </div>

      <div class="btn-container">
        <a href="${params.viewUrl || "https://levchary.com/instructor/dashboard"}" class="btn" target="_blank">
          Open Instructor Dashboard
        </a>
      </div>
    `;

    const htmlContent = this.renderBrandedLayout(
      "Student Feedback Report",
      `Student Feedback Report - ${params.instructorName}`,
      bodyContent
    );

    return this.sendEmail({
      to: params.to,
      subject: `Student Feedback Review Report: ${params.averageRating.toFixed(1)}★ Rating Summary - Levchary`,
      htmlContent,
      textContent: `Student Feedback Report for ${params.instructorName}: Average Rating ${params.averageRating.toFixed(1)}/5 from ${params.totalReviews} student reviews.`,
    });
  }

  /**
   * Send Notification Email to Instructor when Post-Class Report is Approved & Published
   */
  static async sendClassReportApprovalNotification(params: {
    to: string;
    instructorName: string;
    classTitle: string;
    sessionDate: string;
    viewUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const bodyContent = `
      <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        Hello, ${params.instructorName}!
      </div>
      <p style="font-size: 13px; color: #475569; line-height: 1.5;">
        Your post-class report for <strong style="color: #0f172a;">${params.classTitle}</strong> held on ${params.sessionDate} has been reviewed and <strong style="color: #0f766e;">approved by the administrator</strong>.
      </p>
      <div class="card">
        <div style="font-size: 12px; font-weight: 600; color: #0f766e; text-transform: uppercase;">Status: Published over Platform</div>
        <p style="font-size: 13px; color: #334155; margin: 6px 0 0 0;">
          Your text class comments and lesson notes are now published and visible to enrolled students and platform users.
        </p>
      </div>
      <div class="btn-container">
        <a href="${params.viewUrl || "https://levchary.com/instructor/classes"}" class="btn" target="_blank">
          View Class on Platform
        </a>
      </div>
    `;

    const htmlContent = this.renderBrandedLayout(
      "Class Report Approved",
      `Class Report Approved - ${params.classTitle}`,
      bodyContent
    );

    return this.sendEmail({
      to: params.to,
      subject: `Class Report Approved & Published: ${params.classTitle}`,
      htmlContent,
      textContent: `Your post-class report for ${params.classTitle} has been approved by admin and published over the platform.`,
    });
  }

  /**
   * Send Password Reset Email with site-uniform layout
   */
  static async sendPasswordResetEmail(params: {
    to: string;
    firstName: string;
    resetUrl: string;
  }): Promise<{ success: boolean; error?: string }> {
    const bodyContent = `
      <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        Hello, ${params.firstName}!
      </div>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-top: 0;">
        We received a request to reset your password for your Levchary LMS account. Click the button below to set a new password:
      </p>

      <div class="btn-container">
        <a href="${params.resetUrl}" class="btn" target="_blank">
          Reset Password
        </a>
      </div>

      <div class="card">
        <div style="font-size: 12px; font-weight: 600; color: #0f172a;">Security Notice</div>
        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0; line-height: 1.5;">
          This password reset link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email; your account remains secure.
        </p>
      </div>

      <div style="font-size: 11px; color: #94a3b8; word-break: break-all; margin-top: 16px;">
        If the button above does not work, copy and paste this link into your browser:<br/>
        <a href="${params.resetUrl}" style="color: #0d9488;">${params.resetUrl}</a>
      </div>
    `;

    const htmlContent = this.renderBrandedLayout(
      "Password Reset",
      "Reset your Levchary account password",
      bodyContent
    );

    return this.sendEmail({
      to: params.to,
      subject: "Reset your Levchary account password",
      htmlContent,
      textContent: `Hello ${params.firstName}, click the link to reset your password: ${params.resetUrl}. This link expires in 1 hour.`,
    });
  }
}
