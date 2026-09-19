import { NextRequest, NextResponse } from "next/server";
import { supabaseDb } from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json({ error: "Missing tutorId" }, { status: 400 });
    }

    const payouts = await supabaseDb.getPayouts(tutorId);
    const user = await supabaseDb.getUserById(tutorId);

    return NextResponse.json({
      payouts: payouts || [],
      stripeConnected: Boolean((user as any)?.stripe_account_id),
      stripeAccountId: (user as any)?.stripe_account_id || null,
    });
  } catch (error) {
    console.error("Error fetching tutor payouts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
