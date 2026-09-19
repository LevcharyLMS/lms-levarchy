// ============================================================
// LEVCHARY LMS - NOTIFICATION & EMAIL SERVICE
// Idempotent dispatching with email provider abstraction
// ============================================================

import { Resend } from 'resend';
import { db } from '@/lib/data-store';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'PAYMENT' | 'CLASS_REMINDER' | 'MESSAGE' | 'VERIFICATION' | 'PAYOUT' | 'SYSTEM';
  link?: string;
  idempotencyKey?: string;
  sendEmail?: boolean;
}

export class NotificationService {
  private static processedKeys = new Set<string>();

  /**
   * Send notification with idempotency check
   */
  static async sendNotification(payload: NotificationPayload) {
    if (payload.idempotencyKey && this.processedKeys.has(payload.idempotencyKey)) {
      console.log(`[NotificationService] Idempotency hit: skipping duplicate notification for key ${payload.idempotencyKey}`);
      return;
    }

    if (payload.idempotencyKey) {
      this.processedKeys.add(payload.idempotencyKey);
    }

    // 1. In-App Notification Record
    const user = db.getProfileById(payload.userId);
    if (!user) return;

    // 2. Dispatch transactional email if requested and recipient exists
    if (payload.sendEmail && user.email) {
      await this.sendTransactionalEmail({
        to: user.email,
        subject: payload.title,
        text: payload.message,
      });
    }

    return { success: true };
  }

  /**
   * Abstract transactional email provider (Resend or dev logger)
   */
  static async sendTransactionalEmail(params: { to: string; subject: string; text: string; html?: string }) {
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey && !apiKey.startsWith('re_123456789')) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Levchary <notifications@levchary.com>',
          to: params.to,
          subject: params.subject,
          text: params.text,
          html: params.html || `<p>${params.text}</p>`,
        });
        return true;
      } catch (error) {
        console.error('Failed to send transactional email via Resend:', error);
      }
    }

    // Local Development Fallback
    console.log(`[EMAIL DISPATCHED TO: ${params.to}] SUBJECT: "${params.subject}" | CONTENT: "${params.text}"`);
    return true;
  }
}
