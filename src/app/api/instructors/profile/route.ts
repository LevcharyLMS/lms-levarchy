import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SupabaseDbService } from "@/lib/supabase-db";

function getUserIdFromSession(req: Request): string | null {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("levchary_session");
  if (sessionCookie?.value) {
    try {
      return JSON.parse(sessionCookie.value).userId;
    } catch {}
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId") || searchParams.get("tutorId");
    const userId = queryUserId || getUserIdFromSession(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await SupabaseDbService.getUserById(userId);
    const instructor = await SupabaseDbService.getInstructorById(userId);

    return NextResponse.json({ user, instructor });
  } catch (err: any) {
    console.error("Error in GET /api/instructors/profile:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = getUserIdFromSession(req);
    const body = await req.json();
    const targetUserId = body.userId || userId;

    if (!targetUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      firstName,
      lastName,
      phone,
      headline,
      qualifications,
      bio,
      hourlyRate,
      preferredFormat,
    } = body;

    // 1. Update basic profile
    const userUpdates: any = {};
    if (firstName) userUpdates.first_name = firstName.trim();
    if (lastName) userUpdates.last_name = lastName.trim();
    if (phone !== undefined) userUpdates.phone = phone;

    let updatedUser = null;
    if (Object.keys(userUpdates).length > 0) {
      updatedUser = await SupabaseDbService.updateUserProfile(targetUserId, userUpdates);
    }

    // 2. Update instructor_profiles
    const instUpdates: string[] = [];
    const instParams: any[] = [targetUserId];

    if (headline !== undefined) {
      instParams.push(headline);
      instUpdates.push(`headline = $${instParams.length}`);
    }
    if (qualifications !== undefined) {
      instParams.push(qualifications);
      instUpdates.push(`qualifications = $${instParams.length}`);
    }
    if (bio !== undefined) {
      instParams.push(bio);
      instUpdates.push(`bio = $${instParams.length}`);
    }
    if (hourlyRate !== undefined) {
      instParams.push(parseInt(hourlyRate, 10));
      instUpdates.push(`hourly_rate = $${instParams.length}`);
    }
    if (preferredFormat !== undefined) {
      instParams.push(preferredFormat);
      instUpdates.push(`preferred_format = $${instParams.length}`);
    }

    if (instUpdates.length > 0) {
      instUpdates.push(`updated_at = NOW()`);
      await SupabaseDbService.query(
        `UPDATE instructor_profiles SET ${instUpdates.join(", ")} WHERE user_id = $1`,
        instParams
      );
    }

    const instructor = await SupabaseDbService.getInstructorById(targetUserId);

    return NextResponse.json({
      success: true,
      user: updatedUser || (await SupabaseDbService.getUserById(targetUserId)),
      instructor,
      message: "Instructor profile updated successfully.",
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/instructors/profile:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
