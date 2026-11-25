import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { db } from "@/lib/data-store";

export async function GET(req: NextRequest) {
  try {
    const { data: dbSettings, error } = await supabaseAdmin
      .from("platform_settings")
      .select("key, value, updated_at");

    if (!error && dbSettings && dbSettings.length > 0) {
      const settingsMap: Record<string, any> = {};
      dbSettings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      return NextResponse.json({ settings: settingsMap });
    }
  } catch (err) {
    console.error("GET /api/admin/settings DB fetch error, falling back to data-store:", err);
  }

  // Fallback to in-memory platform_settings
  const settingsMap: Record<string, any> = {};
  db.state.platform_settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return NextResponse.json({ settings: settingsMap });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platformName,
      supportEmail,
      emergencyPhone,
      cancelHours,
      fullRefundHours,
      minLeadTimeHours,
      maintenanceMode,
      maintenanceMessage,
      socialInstagram,
      socialYouTube,
      socialWhatsApp,
      socialSpotify,
      landingContactNumber,
      landingAddress,
      adminId,
    } = body;

    const platformInfo = {
      name: platformName || "Levchary LMS",
      support_email: supportEmail || "support@levchary.com",
      emergency_phone: emergencyPhone || "+1 (800) 555-0199",
      maintenance_mode: !!maintenanceMode,
      maintenance_message: maintenanceMessage || "Levchary is undergoing scheduled maintenance. We'll be back shortly.",
      currency: "USD",
    };

    const refundPolicy = {
      cancellation_window_hours: cancelHours ?? 24,
      full_refund_window_hours: fullRefundHours ?? 48,
      min_lead_time_hours: minLeadTimeHours ?? 2,
      partial_refund_percent: 50,
    };

    const landingInfo = {
      contact_number: landingContactNumber || "+1 (800) 555-0199",
      address: landingAddress || "100 Innovation Way, Suite 400, Boston, MA 02110",
      social_links: {
        instagram: socialInstagram || "https://instagram.com/levchary",
        youtube: socialYouTube || "https://youtube.com/@levchary",
        whatsapp: socialWhatsApp || "https://wa.me/18005550199",
        spotify: socialSpotify || "https://open.spotify.com/user/levchary",
      },
    };

    // 1. Try persisting to Supabase platform_settings table
    try {
      await supabaseAdmin.from("platform_settings").upsert([
        { key: "platform_info", value: platformInfo, updated_at: new Date().toISOString() },
        { key: "refund_policy", value: refundPolicy, updated_at: new Date().toISOString() },
        { key: "landing_info", value: landingInfo, updated_at: new Date().toISOString() },
      ]);
    } catch (dbErr) {
      console.warn("Could not upsert into Supabase platform_settings, updating local store:", dbErr);
    }

    // 2. Synchronize memory store
    const updateStoreKey = (k: string, val: any) => {
      const idx = db.state.platform_settings.findIndex((s) => s.key === k);
      if (idx >= 0) {
        db.state.platform_settings[idx].value = val;
        db.state.platform_settings[idx].updated_at = new Date().toISOString();
      } else {
        db.state.platform_settings.push({
          key: k,
          value: val,
          updated_at: new Date().toISOString(),
        });
      }
    };

    updateStoreKey("platform_info", platformInfo);
    updateStoreKey("refund_policy", refundPolicy);
    updateStoreKey("landing_info", landingInfo);

    // 3. Log into audit trail
    db.logAudit({
      actor_id: adminId || "usr-admin-1",
      actor_role: "ADMIN",
      action: "PLATFORM_CONFIG_UPDATED",
      entity_type: "SYSTEM_CONFIG",
      metadata: {
        platform_name: platformInfo.name,
        maintenance_mode: platformInfo.maintenance_mode,
        cancel_hours: refundPolicy.cancellation_window_hours,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        platform_info: platformInfo,
        refund_policy: refundPolicy,
        landing_info: landingInfo,
      },
    });
  } catch (err: any) {
    console.error("POST /api/admin/settings error:", err);
    return NextResponse.json({ error: err.message || "Failed to save settings" }, { status: 500 });
  }
}
