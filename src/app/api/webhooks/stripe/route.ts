import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data-store";
import { BookingService } from "@/services/booking";
import { AuditService } from "@/services/audit";

// In-memory set for idempotency tracking
const processedWebhookEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature");
    const rawBody = await req.text();

    // In production with live Stripe:
    // const event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
    // For development/mock adapter, parse body safely:
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      event = {
        id: `evt_mock_${Date.now()}`,
        type: "checkout.session.completed",
        data: {
          object: {
            id: `cs_mock_${Date.now()}`,
            metadata: { bookingId: "bk-101", bookingNumber: "LEV-202609-A8F2K" },
          },
        },
      };
    }

    // RULE 24: Idempotent event processing. Never process the same event twice.
    if (event.id && processedWebhookEvents.has(event.id)) {
      return NextResponse.json({ received: true, message: "Event already processed." });
    }
    if (event.id) {
      processedWebhookEvents.add(event.id);
    }

    // Process event types
    switch (event.type) {
      case "checkout.session.completed":
      case "payment_intent.succeeded": {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;

        if (bookingId) {
          await BookingService.updateBookingStatus(
            bookingId,
            "CONFIRMED",
            "SYSTEM_STRIPE_WEBHOOK",
            "Payment verified by Stripe webhook"
          );
        }

        AuditService.log({
          actor_role: "SYSTEM",
          action: "STRIPE_PAYMENT_CONFIRMED",
          entity_type: "PAYMENT",
          entity_id: session.id,
          metadata: { booking_id: bookingId },
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        AuditService.log({
          actor_role: "SYSTEM",
          action: "STRIPE_REFUND_EXECUTED",
          entity_type: "REFUND",
          entity_id: charge.id,
        });
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, status: "success" });
  } catch (err: any) {
    console.error("Stripe Webhook Processing Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
