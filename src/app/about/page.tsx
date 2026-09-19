import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldCheck, Award, Building2, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Our Foundation
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-navy-950">
          About Levchary LMS
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Reimagining education through company-controlled quality, institutional integrity, and modern technology.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 text-sm text-slate-700 leading-relaxed shadow-xs">
        <h2 className="text-xl font-bold text-navy-950">Our Mission</h2>
        <p>
          Levchary was established to bridge the gap between unvetted online tutor listings and rigid academic institutions. We believe that true learning occurs when students are paired with verified subject experts in structured environments—whether virtually over dedicated Google Meet links or in-person at supervised physical learning laboratories.
        </p>
        <p>
          Unlike open ad boards where anyone can market themselves without qualification checks, Levchary acts as the ultimate guarantor of quality. We personally review educator government IDs, university diplomas, and criminal background checks before granting teaching privileges.
        </p>

        <h2 className="text-xl font-bold text-navy-950 pt-4">Our Core Commitments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-semibold text-navy-950 text-xs mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Complete Platform Authority
            </h3>
            <p className="text-xs text-slate-500">
              The company retains ultimate control over pricing fairness, commissions, cancellation policies, and tutor verification.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-semibold text-navy-950 text-xs mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" /> Supervised Physical Centers
            </h3>
            <p className="text-xs text-slate-500">
              Approved classroom facilities in Boston, Cambridge, and Manhattan provide secure, noise-free learning environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
