import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/lib/supabase-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Instructor generates attendance token / QR payload
    if (action === "GENERATE_QR") {
      const { bookingId, instructorId } = body;
      if (!bookingId || !instructorId) {
        return NextResponse.json({ error: "bookingId and instructorId required" }, { status: 400 });
      }

      // Encode payload with short timestamp window
      const timestamp = Date.now();
      const payload = {
        bookingId,
        instructorId,
        ts: timestamp,
        type: "INSTRUCTOR_ATTENDANCE_QR",
      };

      const token = Buffer.from(JSON.stringify(payload)).toString("base64");
      // Provide both raw token and high-res SVG / QR code image URL
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(token)}`;

      return NextResponse.json({
        success: true,
        token,
        qrImageUrl,
        expiresAt: new Date(timestamp + 30 * 60 * 1000).toISOString(),
      });
    }

    // Action 2: Student scans QR code and verifies attendance with GPS
    if (action === "VERIFY_ATTENDANCE") {
      const { token, venueQr, studentId, studentLat, studentLng } = body;

      if (!token && !venueQr) {
        return NextResponse.json({ error: "Attendance token or Venue QR is required" }, { status: 400 });
      }

      let bookingId = "";
      let verificationMethod = "INSTRUCTOR_QR";

      if (token) {
        try {
          const decodedStr = Buffer.from(token, "base64").toString("utf-8");
          const decoded = JSON.parse(decodedStr);
          bookingId = decoded.bookingId;
          verificationMethod = "INSTRUCTOR_QR";
        } catch {
          return NextResponse.json({ error: "Invalid or malformed QR attendance token" }, { status: 400 });
        }
      } else if (venueQr) {
        bookingId = body.bookingId;
        verificationMethod = "VENUE_QR";
      }

      if (!bookingId) {
        return NextResponse.json({ error: "Booking ID not identified" }, { status: 400 });
      }

      // Check distance if coordinates are present
      let distanceMeters: number | null = null;
      let proximityPassed = true;

      // Query booking and venue location coordinates if available
      try {
        const rows = await SupabaseDbService.query(
          `
          SELECT b.*, loc.latitude as venue_lat, loc.longitude as venue_lng, loc.name as venue_name
          FROM bookings b
          LEFT JOIN class_locations loc ON b.location_id = loc.id
          WHERE b.id = $1
          LIMIT 1
          `,
          [bookingId]
        );

        if (rows.length === 0) {
          return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const booking = rows[0];

        if (studentLat && studentLng && booking.venue_lat && booking.venue_lng) {
          // Haversine formula calculation in meters
          const R = 6371e3; // metres
          const φ1 = (studentLat * Math.PI) / 180;
          const φ2 = (booking.venue_lat * Math.PI) / 180;
          const Δφ = ((booking.venue_lat - studentLat) * Math.PI) / 180;
          const Δλ = ((booking.venue_lng - studentLng) * Math.PI) / 180;

          const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceMeters = Math.round(R * c);

          // Allow up to 350 meters for GPS drift
          if (distanceMeters > 350) {
            proximityPassed = false;
          }
        }

        const attendanceMetadata = {
          checked_in: true,
          check_in_time: new Date().toISOString(),
          verification_method: verificationMethod,
          student_id: studentId,
          student_coords: studentLat && studentLng ? { lat: studentLat, lng: studentLng } : null,
          venue_coords: booking.venue_lat ? { lat: booking.venue_lat, lng: booking.venue_lng } : null,
          distance_meters: distanceMeters,
          proximity_passed: proximityPassed,
          venue_name: booking.venue_name || null,
        };

        // Transition booking to IN_PROGRESS upon check-in
        const updated = await SupabaseDbService.updateBookingStatus({
          bookingId,
          status: "IN_PROGRESS",
          actorId: studentId,
          attendanceMetadata,
        });

        return NextResponse.json({
          success: true,
          proximityPassed,
          distanceMeters,
          message: proximityPassed
            ? "Attendance verified successfully! Class marked in progress."
            : `Attendance recorded, but GPS indicates you are ${distanceMeters}m away from the venue.`,
          booking: updated,
        });
      } catch (err: any) {
        console.error("Attendance verification error:", err);
        return NextResponse.json({ error: err.message || "Failed to verify attendance" }, { status: 500 });
      }
    }

    // Action 3: Manual Attendance Check-in by Instructor
    if (action === "MANUAL_CHECKIN") {
      const { bookingId, instructorId, notes } = body;
      const updated = await SupabaseDbService.updateBookingStatus({
        bookingId,
        status: "IN_PROGRESS",
        actorId: instructorId,
        notes: notes || "Checked in manually by instructor",
        attendanceMetadata: {
          checked_in: true,
          check_in_time: new Date().toISOString(),
          verification_method: "MANUAL_INSTRUCTOR",
          verified_by: instructorId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Student checked in manually by instructor.",
        booking: updated,
      });
    }

    return NextResponse.json({ error: "Invalid attendance action" }, { status: 400 });
  } catch (error: any) {
    console.error("Attendance API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
