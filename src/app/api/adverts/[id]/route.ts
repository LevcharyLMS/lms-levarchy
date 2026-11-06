import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    const updated = await SupabaseDbService.updateAdvert(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Advert not found" }, { status: 404 });
    }

    return NextResponse.json({ advert: updated });
  } catch (err: any) {
    console.error("Error in PATCH /api/adverts/[id]:", err);
    return NextResponse.json({ error: err.message || "Failed to update advert" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const success = await SupabaseDbService.deleteAdvert(id);

    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Error in DELETE /api/adverts/[id]:", err);
    return NextResponse.json({ error: "Failed to delete advert" }, { status: 500 });
  }
}
