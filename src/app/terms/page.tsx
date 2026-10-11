import React from "react";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents-data";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "Levchary User Agreement | Platform Terms of Service",
  description: "User Agreement governing student and tutor platform participation, bookings, cancellations, payments, and account integrity.",
};

export default function TermsPage() {
  const doc = LEGAL_DOCUMENTS.userAgreement;

  return (
    <LegalPageLayout
      currentDocId="userAgreement"
      doc={doc}
      summaryHighlights={{
        targetAudience: "All Users (Students, Parents & Tutors)",
        badge: "Master Platform Terms",
        badgeColor: "bg-blue-100 text-blue-800",
        keyPoints: [
          "Mandatory compliance with educational conduct & classroom safety rules.",
          "Parental authorization required for minors using student accounts.",
          "Payments and bookings must strictly occur within the Levchary platform.",
          "Clear cancellation and refund policies apply at the time of booking.",
          "Prohibits unauthorized circumvention, account sharing, or fraudulent activity.",
          "Dispute resolution governed by binding individual arbitration.",
        ],
      }}
    />
  );
}
