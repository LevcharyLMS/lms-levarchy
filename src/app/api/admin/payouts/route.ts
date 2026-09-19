import { NextResponse } from "next/server";
import { supabaseDb } from "@/lib/supabase-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payouts = await supabaseDb.getPayouts();
    return NextResponse.json({ payouts: payouts || [] });
  } catch (error) {
    console.error("Error fetching admin payouts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
