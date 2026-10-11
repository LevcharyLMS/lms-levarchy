import React from "react";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents-data";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "Levchary Privacy Policy | Data Privacy & Document Protection",
  description: "Privacy policy detailing collection, encryption, isolation, and processing of student data, parent records, and educator credentials.",
};

export default function PrivacyPage() {
  const doc = LEGAL_DOCUMENTS.privacyPolicy;

  return (
    <LegalPageLayout
      currentDocId="privacyPolicy"
      doc={doc}
      summaryHighlights={{
        targetAudience: "All Users (Students, Parents & Educators)",
        badge: "FERPA & GDPR Compliant",
        badgeColor: "bg-teal-100 text-teal-800",
        keyPoints: [
          "Zero sale of personal data to third-party advertisers or marketers.",
          "Verification documents stored in private, non-public cloud buckets.",
          "Access to IDs strictly restricted to compliance officers via signed URLs.",
          "Child privacy and educational records handled under FERPA standards.",
          "Secure payment handling with certified Level-1 PCI Stripe integration.",
          "Users retain full rights to access, review, or request deletion of data.",
        ],
      }}
    />
  );
}
