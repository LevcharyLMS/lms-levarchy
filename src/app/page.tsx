import React from "react";
import Link from "next/link";
import { db } from "@/lib/data-store";
import { TutorCard } from "@/components/ui/tutor-card";
import { ClassCard } from "@/components/ui/class-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShieldCheck,
  Video,
  MapPin,
  Users,
  User,
  CheckCircle2,
  GraduationCap,
  Calendar,
  CreditCard,
  Star,
  ArrowRight,
  HelpCircle,
  Award,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const tutors = db.getTutors().slice(0, 4);
  const classes = db.getClasses().slice(0, 4);
  const categories = db.getProfiles(); // or db.state.categories

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold tracking-wide uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              Company-Controlled Quality & Strict Verification
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-200 to-gold-400">verified tutors</span> for virtual & physical learning.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Levchary LMS guarantees rigorous educator vetting, dedicated Google Meet video classrooms, and supervised in-person learning centers with protected payments.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" variant="default" className="gap-2 shadow-lg shadow-teal-900/30">
                <Link href="/find-tutors">
                  <Search className="w-4 h-4" /> Find a Tutor
                </Link>
              </Button>
              <Button asChild size="lg" variant="navy" className="border border-slate-700 hover:bg-slate-800 gap-2">
                <Link href="/classes">
                  <BookOpen className="w-4 h-4" /> Explore Classes
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-slate-200 border-slate-700 hover:bg-slate-800/80">
                <Link href="/become-a-tutor">
                  Become a Tutor
                </Link>
              </Button>
            </div>

            {/* Trust Pills */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Government ID & Credentials Verified
              </span>
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-teal-400" />
                Google Meet Auto-Integration
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-400" />
                Immutable Transaction Snapshot
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR CLASS FORMATS SHOWCASE */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase font-bold tracking-widest text-teal-600 mb-2">
              Flexible Academic Delivery
            </h2>
            <p className="text-3xl font-bold tracking-tight text-navy-950">
              Four Specialized Class Formats
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Tailored to your learning preferences: private 1-on-1 mentorship or collaborative group cohorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Format 1 */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-500/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <Video className="w-6 h-6" />
              </div>
              <Badge variant="navy" className="mb-2">1-on-1 Virtual</Badge>
              <h3 className="text-lg font-semibold text-navy-950 mb-2">Private Online Mentorship</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dedicated Google Meet link generated automatically. Atomic slot locking ensures no double-booking ever occurs.
              </p>
            </div>

            {/* Format 2 */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-500/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="mb-2">1-on-1 Physical</Badge>
              <h3 className="text-lg font-semibold text-navy-950 mb-2">Supervised In-Person Sessions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Conducted exclusively in company-controlled learning centers in Boston, Cambridge, and Manhattan.
              </p>
            </div>

            {/* Format 3 */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-500/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <Badge variant="gold" className="mb-2">Group Virtual</Badge>
              <h3 className="text-lg font-semibold text-navy-950 mb-2">Interactive Online Cohorts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Strict capacity limits. Enrolled students and tutor share a single dedicated Google Meet session.
              </p>
            </div>

            {/* Format 4 */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-500/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="mb-2">Group Physical</Badge>
              <h3 className="text-lg font-semibold text-navy-950 mb-2">Intensive Campus Workshops</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Classroom group sessions with real-time seat decrementing and automatic closure when capacity is reached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CLASSES */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-teal-600 mb-2">
                Curated Academic Offerings
              </h2>
              <p className="text-3xl font-bold tracking-tight text-navy-950">
                Trending Classes & Cohorts
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Explore classes led by verified scholars with guaranteed capacity safety.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0 gap-1.5">
              <Link href="/classes">
                View All Classes <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((c) => (
              <ClassCard key={c.id} classItem={c} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED VERIFIED TUTORS */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-teal-600 mb-2">
                Top Rated Instructors
              </h2>
              <p className="text-3xl font-bold tracking-tight text-navy-950">
                Meet Verified Levchary Tutors
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Every tutor has passed government ID verification and administrative qualification audits.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0 gap-1.5">
              <Link href="/find-tutors">
                Browse All Tutors <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutors.map((t) => (
              <TutorCard key={t.user_id} tutor={t} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW LEVCHARY WORKS */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-teal-400 mb-2">
              Transparent Experience
            </h2>
            <p className="text-3xl font-bold tracking-tight text-white">
              How the Platform Works
            </p>
            <p className="text-slate-400 text-sm mt-2">
              From discovery to completion, Levchary ensures institutional quality at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-white text-base">Find or Request</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by subject, grade level, rate, and preferred virtual or physical classroom format.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-white text-base">Reserve Atomically</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                1-on-1 slots are locked preventing double booking. Group seats are strictly counted.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-white text-base">Locked Payment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay securely via Stripe. Historical financial values are permanently frozen and immutable.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="font-semibold text-white text-base">Attend Class</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Join dedicated Google Meet conference or check in at the authorized physical learning lab.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-lg">
                5
              </div>
              <h3 className="font-semibold text-white text-base">Review & Payout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students review completed classes. Tutors receive automated Stripe Connect payouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & SAFETY PILLARS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-4">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Institutional Oversight
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
                The Company-Controlled Difference.
              </h2>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Unlike open bulletin boards where anyone can post, Levchary LMS acts as the authoritative guarantor of every single booking, tutor credential, and classroom facility.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-950">Verified Government ID & Diplomas</h4>
                    <p className="text-xs text-slate-500">Every tutor submits photo ID and verified degrees before being approved to teach.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-950">Automated Messaging Safety Filter</h4>
                    <p className="text-xs text-slate-500">Proactive detection of unmonitored off-platform channels and unauthorized payment methods.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-950">Strict Refund & Cancellation Policy</h4>
                    <p className="text-xs text-slate-500">Transparent cancellation windows and automated refund calculations controlled by administration.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild size="lg" variant="default">
                  <Link href="/register">Join Levchary LMS Today</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                Levchary Marketplace Integrity Standards
              </h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                  <span className="font-bold text-navy-950 block mb-1">Rule 1: Approved Tutors Only</span>
                  Only tutors with approved verification documents are bookable in search and calendars.
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                  <span className="font-bold text-navy-950 block mb-1">Rule 11: Double Booking Prevention</span>
                  Slot locking algorithms prevent tutors from having overlapping commitments.
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                  <span className="font-bold text-navy-950 block mb-1">Rule 12: Immutable Financial Snapshots</span>
                  Once booked, the class price, commission, and tutor payout values never change.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-bold tracking-widest text-teal-600 mb-2">
              Common Inquiries
            </h2>
            <p className="text-3xl font-bold tracking-tight text-navy-950">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-semibold text-sm text-navy-950 mb-2">
                How does Google Meet integration work for virtual classes?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a virtual 1-on-1 or group class is confirmed, our system automatically creates a dedicated Google Calendar event with a unique Google Meet video link. Both tutor and authorized enrolled students can join directly from their dashboards.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-semibold text-sm text-navy-950 mb-2">
                Where are physical in-person classes held?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All physical sessions take place in vetted, company-approved academic hubs (such as our Boston Central Learning Hub and Manhattan Learning Lab). We never expose private residential addresses.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-semibold text-sm text-navy-950 mb-2">
                What is the tutor verification process?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tutors must complete an application, upload a valid government ID (Passport or Driver&apos;s License) and university degree certificates. Administration manually reviews and signs off on every credential before the tutor can publish classes or set availability.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-semibold text-sm text-navy-950 mb-2">
                How are tutor payouts handled?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tutors connect their bank account via Stripe Connect Express. Upon class completion, tutor earnings calculated in the locked booking financial snapshot are routed directly to their connected account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-teal-700 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to Accelerate Your Academic Journey?
          </h2>
          <p className="text-sm text-teal-100 leading-relaxed">
            Join thousands of students and certified educators on Levchary LMS. Verified tutors, guaranteed quality, and seamless virtual or physical learning.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg" variant="gold">
              <Link href="/register">Sign Up as a Student</Link>
            </Button>
            <Button asChild size="lg" variant="navy" className="border border-teal-500/50 hover:bg-navy-800">
              <Link href="/become-a-tutor">Apply to Teach</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function BookOpen(props: any) {
  return <GraduationCap {...props} />;
}
