import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-800">
          {/* Brand & Vision */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-navy-950 font-bold shadow">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                LEVCHARY LMS
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A company-controlled education marketplace connecting students with thoroughly vetted tutors for virtual Google Meet and supervised in-person learning sessions.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Identity-Verified Tutors & Secure Stripe Escrow</span>
            </div>
          </div>

          {/* Marketplace Discovery */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/find-tutors" className="hover:text-teal-400 transition-colors">
                  Find Verified Tutors
                </Link>
              </li>
              <li>
                <Link href="/classes" className="hover:text-teal-400 transition-colors">
                  1-on-1 & Group Classes
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-teal-400 transition-colors">
                  How Levchary Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-teal-400 transition-colors">
                  Tuition & Pricing
                </Link>
              </li>
              <li>
                <Link href="/become-a-tutor" className="hover:text-teal-400 transition-colors">
                  Apply as a Tutor
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Platform & Help
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors">
                  About Levchary
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-teal-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/student/dashboard" className="hover:text-teal-400 transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/tutor/dashboard" className="hover:text-teal-400 transition-colors">
                  Tutor Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/terms" className="hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-teal-400 transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <span className="inline-block mt-3 px-2.5 py-1 text-[11px] rounded bg-navy-900 text-teal-300 border border-navy-800">
                  FERPA & Child Safety Compliant
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Levchary LMS Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Enterprise Education Marketplace</span>
            <span>•</span>
            <span>Stripe Connect Protected</span>
            <span>•</span>
            <span>Google Calendar & Meet Integrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
