import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(req: NextRequest) {
  try {
    const curMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-11"
    const cookieName = `levchary_visited_${curMonth}`;
    
    // Check if the user already has a session token for the current month
    const existingCookie = req.cookies.get(cookieName);

    if (existingCookie) {
      return NextResponse.json({ recorded: false, reason: "Already counted for current month" });
    }

    // Atomically increment monthly visitor count in DB
    const newCount = await SupabaseDbService.recordMonthlyVisit();

    const response = NextResponse.json({ recorded: true, count: newCount });

    // Set cookie valid for 30 days so repeated visits within this month don't inflate counts
    response.cookies.set(cookieName, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err: any) {
    console.error("Error tracking visitor:", err);
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
