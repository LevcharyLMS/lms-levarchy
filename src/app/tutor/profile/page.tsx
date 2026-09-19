"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Sparkles } from "lucide-react";

export default function TutorProfilePage() {
  const tutorData = db.getTutorById("usr-tut-1");
  const [headline, setHeadline] = useState(tutorData?.headline || "");
  const [qualifications, setQualifications] = useState(tutorData?.qualifications || "");
  const [bio, setBio] = useState(tutorData?.bio || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tutorData) {
      tutorData.headline = headline;
      tutorData.qualifications = qualifications;
      tutorData.bio = bio;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Public Instructor Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          This information is displayed to prospective students on your public instructor page.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes updated successfully.</span>
        </div>
      )}

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline (Displayed on Tutor Cards)
              </label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verified Credentials & Diplomas
              </label>
              <Input
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Biography & Curriculum Methodology
              </label>
              <Textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="default" className="font-semibold">
              Save Profile Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
