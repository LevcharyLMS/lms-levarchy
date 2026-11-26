import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";
import { db } from "@/lib/data-store";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const locations = await SupabaseDbService.getLocations(all);

    // Attach deterministic QR Code Data URL to each location based on unique ID & Check-in URL
    const locationsWithQR = await Promise.all(
      locations.map(async (loc: any) => {
        try {
          // Check-in payload url: /venue/check-in?venueId=...
          const qrPayload = JSON.stringify({
            platform: "LEVCHARY",
            type: "PHYSICAL_VENUE",
            venueId: loc.id,
            name: loc.name,
            address: `${loc.address}, ${loc.city}, ${loc.state}`,
            checkInUrl: `https://levchary.com/venue/check-in?venueId=${loc.id}`,
          });

          const qrDataUrl = await QRCode.toDataURL(qrPayload, {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 320,
            color: {
              dark: "#0f172a", // Navy
              light: "#ffffff",
            },
          });

          return {
            ...loc,
            qr_code_url: qrDataUrl,
          };
        } catch (qrErr) {
          console.error("Error generating QR code:", qrErr);
          return loc;
        }
      })
    );

    return NextResponse.json({ locations: locationsWithQR });
  } catch (err: any) {
    console.error("Error in GET /api/admin/locations:", err);
    return NextResponse.json({ error: err.message || "Failed to load locations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      address,
      city,
      state,
      postal_code,
      country = "US",
      capacity,
      directions,
      adminId = "usr-admin-1",
    } = body;

    if (!name || !address || !city || !state || !postal_code || !capacity) {
      return NextResponse.json({ error: "All required facility fields must be provided" }, { status: 400 });
    }

    const newLoc = await SupabaseDbService.createLocation({
      name,
      address,
      city,
      state,
      postal_code,
      country,
      capacity: Number(capacity),
      directions,
    });

    // Record immutable audit entry
    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "PHYSICAL_LOCATION_CREATED",
        entity_type: "CLASS_LOCATION",
        entity_id: newLoc.id,
        metadata: { name: newLoc.name, city: newLoc.city, capacity: newLoc.capacity },
      });
    } catch {}

    // Generate unique QR Code for the created location
    const qrPayload = JSON.stringify({
      platform: "LEVCHARY",
      type: "PHYSICAL_VENUE",
      venueId: newLoc.id,
      name: newLoc.name,
      address: `${newLoc.address}, ${newLoc.city}, ${newLoc.state}`,
      checkInUrl: `https://levchary.com/venue/check-in?venueId=${newLoc.id}`,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    return NextResponse.json({ location: { ...newLoc, qr_code_url: qrDataUrl } }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/locations:", err);
    return NextResponse.json({ error: err.message || "Failed to create location" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates, adminId = "usr-admin-1" } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: "Location id and updates required" }, { status: 400 });
    }

    const updated = await SupabaseDbService.updateLocation(id, updates);

    // Audit log
    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: updates.is_active !== undefined
          ? (updates.is_active ? "PHYSICAL_LOCATION_ACTIVATED" : "PHYSICAL_LOCATION_DEACTIVATED")
          : "PHYSICAL_LOCATION_UPDATED",
        entity_type: "CLASS_LOCATION",
        entity_id: id,
        metadata: { updates },
      });
    } catch {}

    return NextResponse.json({ location: updated });
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/locations:", err);
    return NextResponse.json({ error: err.message || "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const adminId = searchParams.get("adminId") || "usr-admin-1";

    if (!id) {
      return NextResponse.json({ error: "Location id required" }, { status: 400 });
    }

    // Safety check: verify no classes or upcoming bookings are assigned
    const activeClasses = (db.state.classes || []).filter((c) => c.location_id === id);
    if (activeClasses.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete venue: ${activeClasses.length} active classes are currently assigned to this facility. Please reassign them first.` },
        { status: 400 }
      );
    }

    await SupabaseDbService.deleteLocation(id);

    try {
      db.logAudit({
        actor_id: adminId,
        actor_role: "ADMIN",
        action: "PHYSICAL_LOCATION_DELETED",
        entity_type: "CLASS_LOCATION",
        entity_id: id,
        metadata: { id },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/locations:", err);
    return NextResponse.json({ error: err.message || "Failed to delete location" }, { status: 500 });
  }
}
