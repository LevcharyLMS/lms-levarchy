import React from "react";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents-data";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = {
  title: "Levchary Background Check & Verification Authorization | FCRA Disclosure",
  description: "Mandatory authorization and consent for instructor background screening, identity verification, and residential address auditing.",
};

export default function BackgroundCheckAuthorizationPage() {
  const doc = LEGAL_DOCUMENTS.backgroundCheck;

  return (
    <LegalPageLayout
      currentDocId="backgroundCheck"
      doc={doc}
      summaryHighlights={{
        targetAudience: "Tutors, Instructors & Faculty Only",
        badge: "FCRA Vetting & ID Audit",
        badgeColor: "bg-amber-100 text-amber-800",
        keyPoints: [
          "Authorizes Levchary to verify government photo ID and educational degrees.",
          "Mandatory validation that residential address matches uploaded official ID.",
          "Consent for criminal background screening in compliance with the federal FCRA.",
          "Levchary may independently verify credentials with institutions or approved vendors.",
          "Verification status (Pending, Verified, Resubmission Required) monitored continuously.",
          "Electronic signature conforms to the federal E-SIGN Act (15 U.S.C. § 7001).",
        ],
      }}
    />
  );
}
