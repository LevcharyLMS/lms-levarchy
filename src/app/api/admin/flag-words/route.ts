import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { ModerationService } from "@/services/moderation";
import { db } from "@/lib/data-store";

export async function GET() {
  try {
    // 1. Fetch custom keywords from platform_settings
    let keywords: string[] = [];
    try {
      const rows = await SupabaseDbService.query(
        `SELECT value FROM platform_settings WHERE key = 'custom_flag_words' LIMIT 1`
      );
      if (rows && rows.length > 0 && rows[0]?.value) {
        keywords = Array.isArray(rows[0].value) ? rows[0].value : rows[0].value?.words || [];
      }
    } catch {
      // fallback
    }

    if (keywords.length === 0) {
      const memSetting = db.state.platform_settings.find((s) => s.key === "custom_flag_words");
      keywords = (memSetting?.value as any)?.words || ModerationService.getCustomKeywords();
    }

    ModerationService.setCustomKeywords(keywords);

    return NextResponse.json({ keywords });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const word = (body?.word || "").trim().toLowerCase();

    if (!word || word.length < 2) {
      return NextResponse.json(
        { error: "Flag word must be at least 2 characters in length" },
        { status: 400 }
      );
    }

    const currentKeywords = ModerationService.getCustomKeywords();
    if (!currentKeywords.includes(word)) {
      currentKeywords.push(word);
    }

    ModerationService.setCustomKeywords(currentKeywords);

    // Persist to platform_settings in Supabase
    try {
      await SupabaseDbService.query(
        `INSERT INTO platform_settings (key, value, description, updated_at)
         VALUES ('custom_flag_words', $1, 'Admin custom prohibited keywords for moderation scanner', NOW())
         ON CONFLICT (key) DO UPDATE
         SET value = $1, updated_at = NOW()`,
        [JSON.stringify({ words: currentKeywords })]
      );
    } catch (err) {
      console.warn("Notice persisting custom_flag_words to DB:", err);
    }

    // Keep in-memory store in sync
    const memIdx = db.state.platform_settings.findIndex((s) => s.key === "custom_flag_words");
    if (memIdx >= 0) {
      db.state.platform_settings[memIdx].value = { words: currentKeywords };
    } else {
      db.state.platform_settings.push({
        key: "custom_flag_words",
        value: { words: currentKeywords },
        description: "Admin custom prohibited keywords for moderation scanner",
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Keyword "${word}" added to active moderation scanner.`,
      keywords: currentKeywords,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const word = (searchParams.get("word") || "").trim().toLowerCase();

    if (!word) {
      return NextResponse.json({ error: "Keyword parameter required" }, { status: 400 });
    }

    const currentKeywords = ModerationService.getCustomKeywords().filter((w) => w !== word);
    ModerationService.setCustomKeywords(currentKeywords);

    try {
      await SupabaseDbService.query(
        `UPDATE platform_settings
         SET value = $1, updated_at = NOW()
         WHERE key = 'custom_flag_words'`,
        [JSON.stringify({ words: currentKeywords })]
      );
    } catch {}

    const memIdx = db.state.platform_settings.findIndex((s) => s.key === "custom_flag_words");
    if (memIdx >= 0) {
      db.state.platform_settings[memIdx].value = { words: currentKeywords };
    }

    return NextResponse.json({
      success: true,
      message: `Keyword "${word}" removed from moderation scanner.`,
      keywords: currentKeywords,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
