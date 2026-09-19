import React from "react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-navy-950">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-1">Effective Date: January 1, 2026 | Version 1.0</p>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 space-y-6 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">1. Data Minimization & Privacy Philosophy</h2>
          <p>
            Levchary LMS respects user privacy and complies with modern data protection standards. We strictly segregate Public Profile Data from Private User Data, Sensitive Verification Documents, and Financial Ledgers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">2. Sensitive Verification Document Handling</h2>
          <p>
            Government-issued identification documents and academic transcripts uploaded by tutors or students are stored in private, non-public cloud buckets. Documents are accessed exclusively by verified administrators via short-lived signed URLs (15-minute expiration) with mandatory audit logging.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">3. Payment Credentials</h2>
          <p>
            Levchary never stores or handles raw credit card numbers or banking passwords. All payment transactions and tutor payout transfers are processed securely by Stripe, a certified PCI Service Provider Level 1.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">4. Classroom Recordings & Video Data</h2>
          <p>
            Virtual classes are hosted via Google Meet through server-authenticated API credentials. Levchary does not monitor or store continuous video streams, except as necessary to resolve verified safety reports or disputes.
          </p>
        </section>
      </div>
    </div>
  );
}
