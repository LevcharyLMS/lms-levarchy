import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const count = await SupabaseDbService.incrementAdvertDownload(id);
    return NextResponse.json({ success: true, download_count: count });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to record download" }, { status: 500 });
  }
}
