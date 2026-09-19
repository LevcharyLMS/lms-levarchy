"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, GraduationCap, ShieldCheck, Upload } from "lucide-react";

export default function TutorApplicationPage() {
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [experienceYears, setExperienceYears] = useState("5");
  const [hourlyRate, setHourlyRate] = useState("50");
  const [bio, setBio] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Tutor Application & Credential Review
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit your academic background and verification documents for administrative review.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 bg-white rounded-2xl border border-emerald-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-950">Application Submitted for Review</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your credentials and identification have been entered into the Admin Verification Queue under state <strong>PENDING_REVIEW</strong>. Our compliance team reviews applications within 24 hours.
          </p>
          <div className="pt-2">
            <Button variant="default" onClick={() => router.push("/tutor/dashboard")}>
              Go to Tutor Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Headline
                </label>
                <Input
                  placeholder="e.g. Stanford M.S. in Computer Science — Algorithmic Specialist"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teaching Experience (Years)
                  </label>
                  <Input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requested Hourly Rate ($ USD)
                  </label>
                  <Input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    min={25}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verified Degrees & University Credentials
                </label>
                <Input
                  placeholder="e.g. Ph.D. in Applied Mathematics (MIT), B.S. in Theoretical Physics (Caltech)"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Educator Biography & Teaching Philosophy
                </label>
                <Textarea
                  placeholder="Detail your instructional approach, areas of expertise, and exam prep methodologies..."
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950">
                  <Upload className="w-4 h-4 text-teal-600" />
                  Upload Government-Issued Photo ID (Passport or Driver&apos;s License)
                </div>
                <Input
                  placeholder="e.g. passport_scan_front.pdf"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  required
                />
                <span className="text-[10px] text-slate-400 block">
                  Accepted formats: PDF, JPG, PNG. Files are stored in private compliance storage.
                </span>
              </div>

              <Button type="submit" variant="default" className="w-full font-semibold">
                Submit Application for Verification
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
