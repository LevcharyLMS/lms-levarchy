import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FAQPage() {
  const faqs = [
    {
      q: "How does Levchary verify tutor credentials?",
      a: "Every tutor must upload a government-issued photo ID (passport or driver's license) and verified university diploma or teaching certification. Our compliance team manually audits each document before approving tutor profiles.",
    },
    {
      q: "How are virtual classes conducted?",
      a: "Virtual classes leverage our server-side Google Calendar and Google Meet integration. Upon booking confirmation, a dedicated Google Meet room link is generated and attached to the booking. Only authorized participants can access the link.",
    },
    {
      q: "Where are in-person physical classes hosted?",
      a: "All physical classes take place in verified, company-controlled academic centers (e.g. Boston Central Learning Hub, Manhattan Learning Lab). We do not permit sessions at unverified private residences for student safety.",
    },
    {
      q: "Can class pricing or commissions change after I book?",
      a: "No. When a booking occurs, the system generates an immutable financial snapshot locking the tuition, platform commission, and tutor payout values. Even if administration updates marketplace pricing later, existing historical bookings remain permanently unaffected.",
    },
    {
      q: "What is the cancellation and refund policy?",
      a: "Students can cancel up to 24 hours prior to class start time for a 100% full refund back to their payment card via Stripe. Requests inside the 24-hour window are subject to administrative review.",
    },
    {
      q: "How do tutor payouts work?",
      a: "Tutors receive payouts directly into their bank accounts via Stripe Connect Express. Payouts are triggered automatically following the successful completion of each class session.",
    },
    {
      q: "What happens if a group class reaches capacity?",
      a: "Our scheduling engine enforces atomic enrollment counts. When a group class reaches its capacity limit (e.g., 10 students), the class is immediately marked as FULL and additional enrollments are automatically blocked.",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Knowledge Base
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-navy-950">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Comprehensive answers regarding student enrollment, tutor verification, scheduling, and payments.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <h2 className="font-semibold text-sm text-navy-950">{faq.q}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
        <h3 className="text-base font-bold text-navy-950">Have further questions?</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Our administrative support team is on standby to assist you with special arrangements or technical inquiries.
        </p>
        <Button asChild variant="default" size="sm">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
