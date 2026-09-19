import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, CreditCard, RefreshCw, HelpCircle } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-5xl space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Fair & Transparent Financials
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-navy-950">
          Tuition & Platform Pricing
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          No hidden membership subscriptions. No surprise fees. Every historical booking is locked with an immutable financial snapshot.
        </p>
      </div>

      {/* Model Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* For Students */}
        <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-600">
                For Students & Parents
              </span>
              <h2 className="text-2xl font-bold text-navy-950">Pay Per Session or Cohort</h2>
              <p className="text-xs text-slate-500">
                Transparent per-hour or per-class pricing set by certified tutors and approved by administration.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>1-on-1 Virtual Mentorship:</span>
                <strong className="text-navy-950">$45 – $95 / hour</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>1-on-1 In-Person Lab:</span>
                <strong className="text-navy-950">$60 – $120 / session</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Group Virtual Cohorts:</span>
                <strong className="text-navy-950">$25 – $45 / student</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Campus Group Workshops:</span>
                <strong className="text-navy-950">$35 – $65 / student</strong>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Zero recurring monthly platform dues
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                100% money-back satisfaction guarantee
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Dedicated Google Meet link included with virtual classes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Free 24-hour cancellation window
              </li>
            </ul>
          </CardContent>

          <div className="p-6 pt-0">
            <Button asChild className="w-full" size="lg">
              <Link href="/find-tutors">Find an Instructor</Link>
            </Button>
          </div>
        </Card>

        {/* For Tutors */}
        <Card className="border-teal-500/30 bg-teal-50/20 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-700">
                For Certified Tutors
              </span>
              <h2 className="text-2xl font-bold text-navy-950">Keep 80% of All Tuition</h2>
              <p className="text-xs text-slate-500">
                Standard platform commission is 20%. Levchary covers video infrastructure, learning centers, and payment processing.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-teal-100 space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>Tutor Net Payout:</span>
                <strong className="text-teal-700 font-bold text-sm">80.0%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform Operations & Facilities:</span>
                <strong className="text-slate-900">20.0%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Payout Processing:</span>
                <strong className="text-slate-900">Stripe Connect Direct</strong>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Free verification and credential auditing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Automatic Google Calendar & Meet link creation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Guaranteed payment: zero chargeback risk on completed classes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                Direct bank transfers via Stripe Connect Express
              </li>
            </ul>
          </CardContent>

          <div className="p-6 pt-0">
            <Button asChild variant="navy" className="w-full" size="lg">
              <Link href="/become-a-tutor">Apply as an Instructor</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Financial Guarantees */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-navy-950 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          Marketplace Financial Safeguards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-navy-950 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-teal-600" /> Immutable Snapshots
            </h4>
            <p className="leading-relaxed">
              When a booking is made, the price, platform fee, and tutor payout values are permanently stored in an immutable snapshot that cannot be retroactively altered.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-navy-950 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-teal-600" /> Automated Refunds
            </h4>
            <p className="leading-relaxed">
              Cancellations requested 24 hours prior to class start receive full tuition refunds directly to the originating card via Stripe.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-navy-950 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-600" /> Dispute Resolution
            </h4>
            <p className="leading-relaxed">
              Levchary administrators review class completion evidence, attendance records, and support tickets to provide impartial dispute mediation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
