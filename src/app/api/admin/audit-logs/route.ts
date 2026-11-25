import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  try {
    const { data: dbLogs, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && dbLogs && dbLogs.length > 0) {
      return NextResponse.json({ logs: dbLogs });
    }
  } catch (err) {
    console.error("GET /api/admin/audit-logs DB query notice, using memory fallback:", err);
  }

  // Fallback to data-store audit logs
  const memoryLogs = db.getAuditLogs();
  return NextResponse.json({ logs: memoryLogs });
}
