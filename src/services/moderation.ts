// ============================================================
// LEVCHARY LMS - MESSAGING SAFETY & MODERATION SERVICE
// Proactive detection of contact sharing & off-platform payments
// ============================================================

import { MessageFlagType, FlagSeverity } from '@/types';

export interface ModerationResult {
  hasFlags: boolean;
  flags: Array<{
    type: MessageFlagType;
    snippet: string;
    severity: FlagSeverity;
    reason: string;
  }>;
}

export class ModerationService {
  /**
   * Scan message text for policy violations
   */
  static scanText(text: string): ModerationResult {
    const flags: ModerationResult['flags'] = [];

    // 1. Phone numbers detection (various formats)
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/gi;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches) {
      phoneMatches.forEach((match) => {
        flags.push({
          type: 'PHONE',
          snippet: match,
          severity: 'MEDIUM',
          reason: 'Message contains potential phone number or direct calling credentials.',
        });
      });
    }

    // 2. Email address detection
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const emailMatches = text.match(emailRegex);
    if (emailMatches) {
      emailMatches.forEach((match) => {
        flags.push({
          type: 'EMAIL',
          snippet: match,
          severity: 'MEDIUM',
          reason: 'Message contains personal email address.',
        });
      });
    }

    // 3. Off-platform payment methods
    const paymentKeywords = /\b(venmo|zelle|cash\s?app|paypal|wire\s?transfer|bank\s?transfer|crypto|bitcoin|btc|eth|cash\s?in\s?person|pay\s?outside|offline\s?payment)\b/gi;
    const paymentMatches = text.match(paymentKeywords);
    if (paymentMatches) {
      paymentMatches.forEach((match) => {
        flags.push({
          type: 'OFF_PLATFORM_PAYMENT',
          snippet: match,
          severity: 'HIGH',
          reason: 'Attempt to arrange payment or monetary transactions outside the Levchary platform.',
        });
      });
    }

    // 4. Off-platform messaging channels (WhatsApp, Telegram, Discord, Skype)
    const chatAppKeywords = /\b(whatsapp|telegram|discord|skype|wechat|signal|dm\s?me\s?on\s?ig|instagram)\b/gi;
    const chatMatches = text.match(chatAppKeywords);
    if (chatMatches) {
      chatMatches.forEach((match) => {
        flags.push({
          type: 'OFF_PLATFORM_PAYMENT',
          snippet: match,
          severity: 'MEDIUM',
          reason: 'Attempt to redirect classroom communication to unmonitored third-party apps.',
        });
      });
    }

    return {
      hasFlags: flags.length > 0,
      flags,
    };
  }
}
