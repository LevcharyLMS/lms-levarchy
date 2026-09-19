"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClassItem, ClassType, ClassFormat } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/ui/stat-card";
import { MultiStepWizard, Step } from "@/components/shared/multi-step-wizard";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import {
  Plus,
  BookOpen,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  Layers,
} from "lucide-react";

export default function TutorClassesPage() {
  const tutorId = "usr-tut-1";
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);

  // Wizard Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classType, setClassType] = useState<ClassType>("ONE_ON_ONE");
  const [format, setFormat] = useState<ClassFormat>("VIRTUAL");
  const [duration, setDuration] = useState(60);
  const [priceDollars, setPriceDollars] = useState("75");
  const [capacity, setCapacity] = useState(1);
  const [subjectId, setSubjectId] = useState("sub-1");

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/classes");
      const data = await res.json();
      const myClasses = (data.classes || []).filter(
        (c: any) => c.tutor_id === tutorId || !c.tutor_id
      );
      setClasses(myClasses);
    } catch (err) {
      console.error("Failed to load classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleFinishWizard = async () => {
    const priceCents = Math.round(parseFloat(priceDollars || "0") * 100);
    const newClass = {
      id: `cls-${Date.now()}`,
      title,
      description,
      tutor_id: tutorId,
      category_id: "cat-1",
      subject_id: subjectId,
      grade_id: "grd-3",
      class_type: classType,
      format,
      duration_minutes: Number(duration),
      price: priceCents,
      currency: "USD",
      capacity: classType === "GROUP" ? Number(capacity) : 1,
      enrolled_count: 0,
      meeting_link: format === "VIRTUAL" ? `https://meet.google.com/lv-${Math.random().toString(36).substring(2, 7)}` : undefined,
      status: "PUBLISHED",
      created_at: new Date().toISOString(),
    };

    setClasses([newClass, ...classes]);
    setShowWizard(false);
    setCurrentStep(0);
    setSuccessMsg(`Class "${title}" published to marketplace.`);

    // Reset fields
    setTitle("");
    setDescription("");
  };

  const wizardSteps: Step[] = [
    {
      id: "course-info",
      title: "Class Information",
      description: "Define the course title and curriculum summary",
    },
    {
      id: "delivery-logistics",
      title: "Delivery & Logistics",
      description: "Format, session length, and student capacity",
    },
    {
      id: "pricing-earnings",
      title: "Tuition & Payout",
      description: "Set price and review your 80% net instructor earnings",
    },
  ];

  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 1), 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              My Classes & Cohorts
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              Multi-Format Catalog
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Publish and manage your academic offerings across virtual Google Meet classrooms and physical venues.
          </p>
        </div>

        <Button
          onClick={() => setShowWizard(true)}
          className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Publish New Class</span>
        </Button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="underline font-semibold text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Classes"
          value={classes.length}
          subtitle="Catalog offerings"
          icon={Layers}
          variant="indigo"
        />
        <StatCard
          title="Total Student Seats"
          value={totalCapacity}
          subtitle="Maximum capacity"
          icon={Users}
          variant="purple"
        />
        <StatCard
          title="Enrolled Students"
          value={totalEnrolled}
          subtitle="Confirmed bookings"
          icon={BookOpen}
          variant="teal"
        />
        <StatCard
          title="Tutor Share Rate"
          value="80% Net"
          subtitle="Guaranteed by Rule 12"
          icon={TrendingUp}
          variant="emerald"
        />
      </div>

      {/* MultiStepWizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-navy-950">Publish New Class Course</h2>
              <button
                onClick={() => setShowWizard(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Cancel
              </button>
            </div>

            <MultiStepWizard
              steps={wizardSteps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              onBack={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              onNext={() => setCurrentStep((prev) => Math.min(wizardSteps.length - 1, prev + 1))}
              onSubmit={handleFinishWizard}
              submitLabel="Publish Class to Marketplace"
            >
              {/* Step 0: Course Info */}
              {currentStep === 0 && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Class Title
                    </label>
                    <Input
                      placeholder="e.g. AP Calculus BC: High-Yield Problem Solving & Exam Prep"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs h-9 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject Area
                    </label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                    >
                      <option value="sub-1">AP Calculus BC (Mathematics)</option>
                      <option value="sub-2">Organic Chemistry (Science)</option>
                      <option value="sub-3">Data Structures & Algorithms (Computer Science)</option>
                      <option value="sub-4">Macroeconomics (Economics)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course Description & Syllabus
                    </label>
                    <Textarea
                      placeholder="Summarize key topics covered, problem sets provided, and prerequisite knowledge required..."
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="text-xs bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Delivery & Logistics */}
              {currentStep === 1 && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Class Type
                      </label>
                      <select
                        value={classType}
                        onChange={(e) => setClassType(e.target.value as any)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                      >
                        <option value="ONE_ON_ONE">1-on-1 Mentorship</option>
                        <option value="GROUP">Group Cohort</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Delivery Method
                      </label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as any)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                      >
                        <option value="VIRTUAL">Virtual (Google Meet)</option>
                        <option value="PHYSICAL">In-Person (Approved Center)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration (Minutes)
                      </label>
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min={30}
                        step={15}
                        className="text-xs h-9 bg-slate-50 border-slate-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Maximum Student Capacity
                      </label>
                      <Input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        disabled={classType === "ONE_ON_ONE"}
                        min={1}
                        max={30}
                        className="text-xs h-9 bg-slate-50 border-slate-200"
                        required
                      />
                    </div>
                  </div>

                  {format === "VIRTUAL" ? (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        An authenticated Google Meet room link will be automatically provisioned upon student booking.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>
                        Classes will be conducted at our vetted central campus learning hub.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Pricing & Payout */}
              {currentStep === 2 && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tuition Price ($ USD per enrollment)
                    </label>
                    <Input
                      type="number"
                      value={priceDollars}
                      onChange={(e) => setPriceDollars(e.target.value)}
                      min={10}
                      step={5}
                      className="text-xs h-9 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>

                  {/* Real Financial Split Calculator */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-navy-950 block">Authoritative Earnings Split</span>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-600">Gross Student Tuition:</span>
                      <span className="font-bold text-navy-950">
                        ${parseFloat(priceDollars || "0").toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-purple-800">
                      <span>Platform Commission (20%):</span>
                      <span className="font-semibold">
                        -${(parseFloat(priceDollars || "0") * 0.2).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-emerald-800 font-bold text-sm pt-2 border-t border-slate-200">
                      <span>Your Net Payout (80%):</span>
                      <span>${(parseFloat(priceDollars || "0") * 0.8).toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Net payouts are deposited directly to your linked Stripe Connect bank account upon session completion.
                  </p>
                </div>
              )}
            </MultiStepWizard>
          </div>
        </div>
      )}

      {/* Classes Grid / Cards */}
      <div className="space-y-3.5">
        {classes.map((c) => (
          <Card
            key={c.id}
            className="border-slate-200/80 shadow-xs hover:border-slate-300 transition-all bg-white"
          >
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.class_type} />
                  <StatusBadge status={c.format} />
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="text-base font-bold text-navy-950 truncate">{c.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{c.duration_minutes || 60} mins</span>
                  </span>
                  {c.class_type === "GROUP" && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {c.enrolled_count || 0}/{c.capacity} enrolled
                      </span>
                    </span>
                  )}
                  {c.format === "VIRTUAL" ? (
                    <span className="flex items-center gap-1 text-indigo-700 font-medium">
                      <Video className="w-3.5 h-3.5" />
                      <span>Google Meet Auto-Attached</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Physical Learning Center</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-right">
                  <div className="font-bold text-navy-950 text-base">
                    <MoneyDisplay cents={c.price} />
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    Net: ${((c.price * 0.8) / 100).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-primary hover:bg-indigo-50 flex items-center gap-1"
                    onClick={() => setSelectedClass(c)}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Inspect</span>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs border-slate-200">
                    <Link href={`/classes/${c.id}`}>Public Preview</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title="Class Course Overview"
        subtitle={`ID: ${selectedClass?.id || ""}`}
      >
        {selectedClass && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Status:</span>
                <StatusBadge status={selectedClass.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Class Format:</span>
                <StatusBadge status={selectedClass.format} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Class Type:</span>
                <StatusBadge status={selectedClass.class_type} />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-navy-950 block">Description</span>
              <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                {selectedClass.description}
              </p>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-emerald-950">
              <span className="font-bold block">Financial Economics</span>
              <div className="flex items-center justify-between">
                <span>Tuition (Gross):</span>
                <span className="font-bold">
                  <MoneyDisplay cents={selectedClass.price} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Your Net Payout (80%):</span>
                <span className="font-bold text-emerald-800">
                  ${((selectedClass.price * 0.8) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
