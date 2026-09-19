import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const format = searchParams.get("format") || undefined;
  const search = searchParams.get("search") || undefined;

  const classes = db.getClasses({ type, format, search });
  return NextResponse.json({ classes });
}
