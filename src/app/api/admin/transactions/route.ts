import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function GET() {
  try {
    const transactions = await SupabaseDbService.getTransactions();
    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
