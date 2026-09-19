import React from "react";

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-navy-950">Refund & Cancellation Policy</h1>
        <p className="text-xs text-slate-500 mt-1">Effective Date: January 1, 2026 | Version 1.0</p>
      </div>

      <div className="prose prose-sm max-w-none text-slate-700 space-y-6 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">1. Free Cancellation Window</h2>
          <p>
            Students may cancel any scheduled 1-on-1 session or group class cohort up to twenty-four (24) hours before the scheduled class start time for a 100% full tuition refund to the original payment method via Stripe.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">2. Late Cancellations & Tutor Protection</h2>
          <p>
            Because instructors reserve dedicated time and decline other students, cancellations requested within twenty-four (24) hours of the scheduled start time are generally non-refundable, except in documented emergencies evaluated by Administration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">3. Instructor Unavailability or Technical Failures</h2>
          <p>
            If a tutor fails to attend a scheduled session or if persistent technical issues prevent a session from occurring, the student is entitled to an immediate full refund or a complimentary rescheduled session.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-950">4. Administrative Overrides & Audit Trail</h2>
          <p>
            Every refund transaction is immutably recorded in the platform ledger and audit logs. Administrators cannot silently modify historical records without an associated audit trail.
          </p>
        </section>
      </div>
    </div>
  );
}
