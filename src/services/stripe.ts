// ============================================================
// LEVCHARY LMS - STRIPE & STRIPE CONNECT SERVICE
// Real Stripe integration with fallback development adapter
// ============================================================

import Stripe from 'stripe';

export class StripeService {
  private static stripeClient: Stripe | null = null;

  private static getClient(): Stripe | null {
    if (!this.stripeClient && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('sample')) {
      this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-11-20.acacia' as any,
      });
    }
    return this.stripeClient;
  }

  /**
   * Create a checkout session for a class booking
   */
  static async createCheckoutSession(params: {
    bookingId: string;
    bookingNumber: string;
    title: string;
    amountCents: number;
    currency: string;
    studentEmail: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const stripe = this.getClient();

    if (!stripe) {
      // Local development simulation
      return {
        sessionId: `cs_test_mock_${Date.now()}`,
        url: `${params.successUrl}?session_id=cs_test_mock_${Date.now()}`,
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: params.studentEmail,
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: params.title,
              description: `Levchary Booking Reference: ${params.bookingNumber}`,
            },
            unit_amount: params.amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        bookingId: params.bookingId,
        bookingNumber: params.bookingNumber,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create Stripe Connect onboarding link for verified tutors
   */
  static async createConnectAccountLink(params: {
    tutorId: string;
    email: string;
    returnUrl: string;
    refreshUrl: string;
  }) {
    const stripe = this.getClient();

    if (!stripe) {
      return {
        accountLinkUrl: `${params.returnUrl}?stripe_connect=success&account_id=acct_mock_${params.tutorId}`,
      };
    }

    // 1. Create or retrieve account
    const account = await stripe.accounts.create({
      type: 'express',
      email: params.email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    // 2. Generate Account Link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: 'account_onboarding',
    });

    return {
      accountLinkUrl: accountLink.url,
      accountId: account.id,
    };
  }

  /**
   * Process refund via Stripe
   */
  static async processRefund(chargeId: string, amountCents?: number) {
    const stripe = this.getClient();

    if (!stripe || chargeId.startsWith('ch_test_')) {
      return {
        refundId: `re_mock_${Date.now()}`,
        status: 'succeeded',
      };
    }

    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: amountCents,
    });

    return {
      refundId: refund.id,
      status: refund.status,
    };
  }
}
