import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  Video,
  DollarSign,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function BecomeATutorPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-5xl space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Educator Network
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-navy-950">
          Teach on Levchary LMS
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Join a curated community of academic instructors, professors, and subject matter experts. Teach online via Google Meet or in-person at our premium academic hubs.
        </p>
        <div className="pt-2">
          <Button asChild size="lg" variant="default" className="shadow-md">
            <Link href="/register">Start Your Tutor Application</Link>
          </Button>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-navy-950">Reliable Stripe Payouts</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Keep 80% of all class fees. Earnings are transferred automatically to your connected bank account upon completion of your sessions.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-navy-950">Zero Scheduling Friction</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Set your weekly availability once. Google Calendar and Meet links are automatically generated and sent to enrolled students.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-navy-950">Verified Badge of Excellence</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our strict administrative audit differentiates qualified professionals from unverified online tutors, commanding higher student demand.
          </p>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-navy-950">
            Tutor Application & Verification Checklist
          </h2>
          <p className="text-xs text-slate-500">
            Review the requirements before submitting your profile for administrative sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-navy-950 mb-0.5">Current Government Photo ID</strong>
              Valid passport, state driver&apos;s license, or national identity card.
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-navy-950 mb-0.5">Degree or Teaching Credentials</strong>
              Bachelor&apos;s degree, master&apos;s, Ph.D., or certified professional credential.
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-navy-950 mb-0.5">Subject & Grade Specialization</strong>
              Define specific subjects, levels (Middle School, High School, AP, College), and format preferences.
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-navy-950 mb-0.5">Stripe Connect Account Setup</strong>
              Direct bank onboarding via Stripe Express to receive direct deposit earnings.
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center bg-gradient-to-r from-navy-900 to-navy-950 text-white rounded-2xl p-10 space-y-4">
        <h2 className="text-2xl font-bold">Ready to inspire the next generation?</h2>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Sign up for free, complete your educator application, and start accepting students once approved by our verification team.
        </p>
        <div className="pt-2">
          <Button asChild size="lg" variant="gold">
            <Link href="/register">Apply Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
