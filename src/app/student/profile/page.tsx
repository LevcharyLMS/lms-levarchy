"use client";

import React, { useState } from "react";
import { User, Mail, Phone, MapPin, GraduationCap, Target, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";

export default function StudentProfilePage() {
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Lucas",
    lastName: "Miller",
    email: "student@levchary.local",
    phone: "+1 (555) 234-5678",
    gradeLevel: "Grade 12 (High School Senior)",
    city: "Boston",
    state: "MA",
    learningGoals: "Preparing for AP Calculus BC and undergraduate computer science coursework.",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-navy-950">
          Student Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal learning profile, contact details, and educational objectives.
        </p>
      </div>

      {/* Profile Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        {/* Avatar & Verification Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-4 ring-indigo-50">
              <AvatarImage src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150" />
              <AvatarFallback>LM</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-xs text-slate-500">{formData.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status="ACTIVE" />
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ID Verified
                </span>
              </div>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="text-xs h-8">
            Change Photo
          </Button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">First Name</label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Last Name</label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <Input
              value={formData.email}
              disabled
              className="h-9 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Phone Number</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Grade / Academic Level</label>
            <Input
              value={formData.gradeLevel}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Location (City, State)</label>
            <Input
              value={`${formData.city}, ${formData.state}`}
              onChange={(e) => {
                const parts = e.target.value.split(",");
                setFormData({ ...formData, city: parts[0]?.trim() || "", state: parts[1]?.trim() || "" });
              }}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Learning Goals */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Learning Goals & Target Exam Areas</label>
          <Textarea
            rows={3}
            value={formData.learningGoals}
            onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
            className="text-xs"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {isSaved ? (
            <span className="text-xs text-emerald-600 font-semibold">
              Changes saved successfully!
            </span>
          ) : (
            <span />
          )}
          <Button type="submit" size="sm" className="h-9 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
