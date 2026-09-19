import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { StripeService } from "@/services/stripe";
import { db } from "@/lib/data-store";

export async function GET() {
  try {
    const refunds = await SupabaseDbService.getRefunds();
    return NextResponse.json({ refunds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refundId, actorId = "usr-admin-1", adminNotes } = body;

    if (!refundId) {
      return NextResponse.json({ error: "Missing refundId" }, { status: 400 });
    }

    // Call Stripe refund reversal
    const stripeRes = await StripeService.processRefund("ch_test_refund", 3500);

    // Update DB
    await SupabaseDbService.updateRefundStatus(refundId, "REFUNDED", actorId, adminNotes);

    // Audit log
    db.logAudit({
      actor_id: actorId,
      actor_role: "ADMIN",
      action: "ADMIN_REFUND_OVERRIDE_PROCESSED",
      entity_type: "REFUND",
      entity_id: refundId,
      metadata: { stripe_refund_id: stripeRes.refundId, status: "REFUNDED" },
    });

    return NextResponse.json({ success: true, stripeRefundId: stripeRes.refundId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
