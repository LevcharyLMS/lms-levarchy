import { NextRequest, NextResponse } from "next/server";
import { LEGAL_DOCUMENTS, LegalDocument } from "@/lib/legal-documents-data";
import { db } from "@/lib/data-store";

// In-memory editable cache of legal documents for admin management
const editableLegalDocs: Record<string, LegalDocument> = { ...LEGAL_DOCUMENTS };

export async function GET(req: NextRequest) {
  return NextResponse.json({ documents: editableLegalDocs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { docKey, title, effectiveDate, sections, adminId } = body;

    if (!docKey || !editableLegalDocs[docKey]) {
      return NextResponse.json({ error: "Invalid legal document key" }, { status: 400 });
    }

    editableLegalDocs[docKey] = {
      ...editableLegalDocs[docKey],
      title: title || editableLegalDocs[docKey].title,
      effectiveDate: effectiveDate || editableLegalDocs[docKey].effectiveDate,
      sections: sections || editableLegalDocs[docKey].sections,
    };

    // Log to audit trail
    db.logAudit({
      actor_id: adminId || "usr-admin-1",
      actor_role: "ADMIN",
      action: "LEGAL_DOCUMENT_UPDATED",
      entity_type: "LEGAL_POLICY",
      entity_id: docKey,
      metadata: { title, effectiveDate, sectionsCount: sections?.length },
    });

    return NextResponse.json({
      success: true,
      document: editableLegalDocs[docKey],
    });
  } catch (err: any) {
    console.error("POST /api/admin/legal error:", err);
    return NextResponse.json({ error: err.message || "Failed to update legal document" }, { status: 500 });
  }
}
