import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-navy-950">Terms of Service</h1>
        <p className="text-xs text-slate-500 mt-1">Effective Date: January 1, 2026 | Version 1.0</p>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 space-y-6 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Levchary LMS platform (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use of the platform immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">2. Marketplace Authority & Control</h2>
          <p>
            Levchary LMS operates as a company-controlled education marketplace. Levchary reserves sole authority over tutor approval, class pricing configurations, platform commission percentages, cancellation and refund policies, and user suspension.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">3. Identity Verification & Document Privacy</h2>
          <p>
            Educators applying to teach on Levchary must provide valid government-issued photographic identification and proof of academic credentials. All verification documents are stored securely and privately, accessible strictly by authorized administrative compliance personnel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">4. Prohibited Off-Platform Transactions & Contact</h2>
          <p>
            Users agree not to arrange, solicit, or accept payments outside the Levchary platform for classes or tutoring sessions initiated through the Service. In-app messaging is proactively filtered for policy enforcement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">5. Payment & Immutable Financial Snapshots</h2>
          <p>
            Tuition is processed securely via Stripe. When a booking is created, the tuition, commission, and tutor payout values are permanently captured in an immutable financial snapshot.
          </p>
        </section>
      </div>
    </div>
  );
}
