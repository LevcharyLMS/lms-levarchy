"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { User, Mail, Phone, MapPin, GraduationCap, Target, Save, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";

export default function StudentProfilePage() {
  const { user, studentProfile, updateStudentProfile, isLoading } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gradeLevel: "",
    city: "",
    state: "",
    learningGoals: "",
  });

  // Sync formData when user or studentProfile loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        gradeLevel: studentProfile?.grade_level || "",
        city: user.city || "",
        state: user.state || "",
        learningGoals: studentProfile?.learning_goals || "",
      });
    }
  }, [user, studentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const success = await updateStudentProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      gradeLevel: formData.gradeLevel,
      learningGoals: formData.learningGoals,
    });

    setSaving(false);
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const initials = user
    ? `${user.first_name?.[0] || "S"}${user.last_name?.[0] || "T"}`
    : "ST";

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
              {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
              <AvatarFallback className="text-base font-bold bg-indigo-50 text-indigo-900">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                {user ? `${user.first_name} ${user.last_name}` : "Student Profile"}
              </h3>
              <p className="text-xs text-slate-500">{user?.email || "No email provided"}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={user?.account_status || "ACTIVE"} />
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ID Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">First Name</label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Last Name</label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="h-9 text-xs"
              required
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
              placeholder="+1 (555) 000-0000"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Grade / Academic Level</label>
            <Input
              value={formData.gradeLevel}
              placeholder="e.g. High School Junior (Grade 11)"
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Location (City, State)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-9 text-xs"
              />
              <Input
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Learning Goals */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Learning Goals & Target Focus Areas</label>
          <Textarea
            rows={3}
            placeholder="Describe what subjects you want to focus on and what goals you want to achieve..."
            value={formData.learningGoals}
            onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
            className="text-xs"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {isSaved ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated in PostgreSQL database!</span>
            </span>
          ) : (
            <span />
          )}
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="h-9 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
