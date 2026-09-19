import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MailCheck, GraduationCap } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-5 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto ring-8 ring-teal-50/50">
          <MailCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-navy-950">Verify Your Email Address</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          A verification link has been sent to your registered email address. Please click the link inside to confirm your account and unlock access to the marketplace.
        </p>
        <div className="pt-2">
          <Button asChild variant="default" className="w-full">
            <Link href="/login">Proceed to Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
