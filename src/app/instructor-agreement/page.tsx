import React from "react";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents-data";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "Levchary Instructor Services Agreement | Faculty Contractor Terms",
  description: "Terms and conditions for tutors, instructors, and faculty members offering educational services on Levchary.",
};

export default function InstructorAgreementPage() {
  const doc = LEGAL_DOCUMENTS.instructorAgreement;

  return (
    <LegalPageLayout
      currentDocId="instructorAgreement"
      doc={doc}
      summaryHighlights={{
        targetAudience: "Tutors, Instructors & Faculty Only",
        badge: "Educator Contractor Terms",
        badgeColor: "bg-purple-100 text-purple-800",
        keyPoints: [
          "Instructors operate strictly as Independent Contractors (no employee benefits).",
          "Mandatory identity verification, background screening, and credential validation.",
          "Strict zero-tolerance policy against soliciting off-platform client payments.",
          "Instructors maintain professional standards, punctuality, and curriculum quality.",
          "Tutor profile data must remain current, complete, and fully truthful.",
          "Platform commissions and payout terms governed by immutable platform ledgers.",
        ],
      }}
    />
  );
}
