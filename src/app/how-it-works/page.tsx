import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  CalendarCheck,
  CreditCard,
  Video,
  Award,
  ShieldCheck,
  FileCheck2,
  Users,
  Building,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-5xl space-y-16">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          The Marketplace Framework
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-navy-950">
          How Levchary Works
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Levchary operates as a company-controlled education marketplace. We manage tutor credential verification, classroom facilities, and payment escrow to guarantee an uncompromising standard of learning.
        </p>
      </div>

      {/* Student Journey */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8">
        <div>
          <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> The Student Journey
          </h2>
          <p className="text-xs text-slate-500 mt-1">From discovery to attending virtual or in-person classes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 border-l-2 border-teal-500 pl-4">
            <span className="text-xs font-bold text-teal-600">Step 1</span>
            <h3 className="text-sm font-semibold text-navy-950">Discover Tutors & Classes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filter by subject, grade level, and choose between private 1-on-1 sessions or small group cohorts.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-teal-500 pl-4">
            <span className="text-xs font-bold text-teal-600">Step 2</span>
            <h3 className="text-sm font-semibold text-navy-950">Select Time & Book</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our scheduling engine atomically locks tutor availability or group seats, eliminating double-booking risks.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-teal-500 pl-4">
            <span className="text-xs font-bold text-teal-600">Step 3</span>
            <h3 className="text-sm font-semibold text-navy-950">Frozen Financial Snapshot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tuition is calculated in integer cents and locked permanently in the financial ledger via Stripe.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-teal-500 pl-4">
            <span className="text-xs font-bold text-teal-600">Step 4</span>
            <h3 className="text-sm font-semibold text-navy-950">Attend & Review</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Join via dedicated Google Meet or attend at our approved learning centers, then rate your educator.
            </p>
          </div>
        </div>
      </div>

      {/* Tutor Journey */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8">
        <div>
          <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-600" /> The Tutor Journey
          </h2>
          <p className="text-xs text-slate-500 mt-1">Institutional verification and seamless payouts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 border-l-2 border-navy-800 pl-4">
            <span className="text-xs font-bold text-navy-800">Step 1</span>
            <h3 className="text-sm font-semibold text-navy-950">Apply & Submit Credentials</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create your profile and securely upload a government ID and university degrees for admin review.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-navy-800 pl-4">
            <span className="text-xs font-bold text-navy-800">Step 2</span>
            <h3 className="text-sm font-semibold text-navy-950">Administrative Audit</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our administration inspects documents with expiring signed URLs and approves qualified educators.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-navy-800 pl-4">
            <span className="text-xs font-bold text-navy-800">Step 3</span>
            <h3 className="text-sm font-semibold text-navy-950">Set Availability & Classes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configure weekly recurring availability windows and create virtual or in-person classes.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-navy-800 pl-4">
            <span className="text-xs font-bold text-navy-800">Step 4</span>
            <h3 className="text-sm font-semibold text-navy-950">Stripe Connect Payouts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Earnings are calculated automatically and routed directly to your connected bank account.
            </p>
          </div>
        </div>
      </div>

      {/* Classroom Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-navy-950">Virtual Google Meet Classrooms</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our server-side Google Calendar API integration generates dedicated conference rooms for each confirmed booking. Access is strictly limited to the assigned tutor and enrolled student participants.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-navy-950">Supervised Physical Learning Hubs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In-person classes occur exclusively at our approved education facilities in Boston, Cambridge, and Manhattan. We maintain fully equipped study rooms with digital whiteboards and check-in security.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Button asChild size="lg" variant="default">
          <Link href="/register">Get Started with Levchary</Link>
        </Button>
      </div>
    </div>
  );
}
