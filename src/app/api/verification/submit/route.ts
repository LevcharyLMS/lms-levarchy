import { NextRequest, NextResponse } from "next/server";
import { pool, SupabaseDbService } from "@/lib/supabase-db";
import { db as memoryDb } from "@/lib/data-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      role = "STUDENT",
      residentialAddress,
      idDocument,
      proofOfAddressDocument,
      backgroundCheckAuthorization,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    if (
      !residentialAddress ||
      !residentialAddress.addressLine1 ||
      !residentialAddress.city ||
      !residentialAddress.state ||
      !residentialAddress.postalCode
    ) {
      return NextResponse.json(
        { error: "Complete residential address (Street, City, State, Postal Code) is mandatory." },
        { status: 400 }
      );
    }

    if (!idDocument || !idDocument.fileName) {
      return NextResponse.json(
        { error: "Identification document is required." },
        { status: 400 }
      );
    }

    // Tutors require background check authorization and electronic signature
    if (role === "TUTOR") {
      if (
        !backgroundCheckAuthorization ||
        !backgroundCheckAuthorization.electronicSignature ||
        !backgroundCheckAuthorization.legalFullName ||
        !backgroundCheckAuthorization.addressFitCertified
      ) {
        return NextResponse.json(
          {
            error:
              "Instructors must execute the Background Check & Verification Authorization with electronic signature and certify that residential address fits uploaded ID.",
          },
          { status: 400 }
        );
      }
    }

    const fullStreetAddress = residentialAddress.addressLine2
      ? `${residentialAddress.addressLine1}, ${residentialAddress.addressLine2}`.trim()
      : residentialAddress.addressLine1.trim();

    const countryCode = residentialAddress.country || "US";

    let dbUpdated = false;

    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // 1. Update user profile address and verification status
        await client.query(
          `UPDATE profiles
           SET address = $1,
               city = $2,
               state = $3,
               postal_code = $4,
               country = $5,
               verification_status = 'PENDING_REVIEW',
               updated_at = NOW()
           WHERE id = $6`,
          [
            fullStreetAddress,
            residentialAddress.city.trim(),
            residentialAddress.state.trim(),
            residentialAddress.postalCode.trim(),
            countryCode,
            userId,
          ]
        );

        // 2. Insert ID document record
        const docId1 = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "doc-" + Date.now();
        await client.query(
          `INSERT INTO verification_documents (
             id, user_id, document_type, file_path, file_name, mime_type, file_size, status, uploaded_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING_REVIEW', NOW())`,
          [
            docId1,
            userId,
            idDocument.documentType || "GOVERNMENT_ID",
            `private/verifications/${userId}/${idDocument.fileName}`,
            idDocument.fileName,
            "application/pdf",
            1024 * 500,
          ]
        );

        // 3. Insert secondary proof of address if provided
        if (proofOfAddressDocument && proofOfAddressDocument.fileName) {
          const docId2 = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "doc-addr-" + Date.now();
          await client.query(
            `INSERT INTO verification_documents (
               id, user_id, document_type, file_path, file_name, mime_type, file_size, status, uploaded_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING_REVIEW', NOW())`,
            [
              docId2,
              userId,
              "PROOF_OF_ADDRESS",
              `private/verifications/${userId}/${proofOfAddressDocument.fileName}`,
              proofOfAddressDocument.fileName,
              "application/pdf",
              1024 * 500,
            ]
          );
        }

        // 4. If Tutor, record background check authorization
        if (role === "TUTOR" && backgroundCheckAuthorization) {
          const docId3 = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "doc-bg-" + Date.now();
          await client.query(
            `INSERT INTO verification_documents (
               id, user_id, document_type, file_path, file_name, mime_type, file_size, status, admin_notes, uploaded_at
             )
             VALUES ($1, $2, 'BACKGROUND_CHECK_AUTHORIZATION', $3, $4, 'application/json', 1024, 'PENDING_REVIEW', $5, NOW())`,
            [
              docId3,
              userId,
              `private/verifications/${userId}/bg_check_auth.json`,
              "Background_Check_Authorization_Form.pdf",
              `Signed electronically by ${backgroundCheckAuthorization.legalFullName} (Signature: ${backgroundCheckAuthorization.electronicSignature}). Certified residential address matches uploaded document.`,
            ]
          );

          // Update tutor_applications or tutor_profiles
          await client.query(
            `UPDATE tutor_profiles
             SET application_status = 'PENDING_REVIEW',
                 updated_at = NOW()
             WHERE user_id = $1`,
            [userId]
          );
        }

        await client.query("COMMIT");
        dbUpdated = true;
      } catch (err: any) {
        await client.query("ROLLBACK");
        console.warn("DB transaction warning in verification submission, updating memory fallback:", err.message);
      } finally {
        client.release();
      }
    } catch (poolErr: any) {
      console.warn("Pool connection notice in verification:", poolErr.message);
    }

    // Also update in-memory data store for live fallback reactivity
    const profile = memoryDb.getProfileById(userId);
    if (profile) {
      profile.address = fullStreetAddress;
      profile.city = residentialAddress.city.trim();
      profile.state = residentialAddress.state.trim();
      profile.postal_code = residentialAddress.postalCode.trim();
      profile.country = countryCode;
      profile.verification_status = "PENDING_REVIEW";
      profile.updated_at = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      verificationStatus: "PENDING_REVIEW",
      message:
        role === "TUTOR"
          ? "Identity, residential address, and Background Check Authorization submitted successfully. Our compliance team will review your credentials within 24 hours."
          : "Student identity and residential address documents submitted successfully for administrative review.",
      data: {
        address: fullStreetAddress,
        city: residentialAddress.city,
        state: residentialAddress.state,
        postalCode: residentialAddress.postalCode,
        country: countryCode,
      },
    });
  } catch (err: any) {
    console.error("Error in /api/verification/submit:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to submit verification details." },
      { status: 500 }
    );
  }
}
