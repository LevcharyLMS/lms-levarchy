"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ClassType, ClassFormat } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { MoneyDisplay } from "@/components/ui/money-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { MultiStepWizard, Step } from "@/components/shared/multi-step-wizard";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { useAuth } from "@/context/auth-context";
import {
  PageTransition,
  FadeUp,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
} from "@/components/animations";
import {
  Plus,
  BookOpen,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  Users,
  Eye,
  TrendingUp,
  Layers,
  AlertCircle,
  Archive,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Send,
  X,
} from "lucide-react";

export default function TutorClassesPage() {
  const { user } = useAuth();
  const tutorId = user?.id;

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState({ defaultRate: 20, tutorShareRate: 80 });
  const [taxonomy, setTaxonomy] = useState<{
    categories: any[];
    subjects: any[];
    grades: any[];
    locations: any[];
  }>({
    categories: [],
    subjects: [],
    grades: [],
    locations: [],
  });

  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [classBookings, setClassBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Suggestion Modal State
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggType, setSuggType] = useState<"ALL_IN_ONE" | "SUBJECT" | "CATEGORY" | "GRADE">("ALL_IN_ONE");
  const [suggProposedName, setSuggProposedName] = useState("");
  const [suggParentCatId, setSuggParentCatId] = useState("");
  const [suggNewCatName, setSuggNewCatName] = useState("");
  const [suggNewGradeName, setSuggNewGradeName] = useState("");
  const [suggReason, setSuggReason] = useState("");
  const [suggSubmitting, setSuggSubmitting] = useState(false);
  const [suggFeedback, setSuggFeedback] = useState<string | null>(null);

  // Wizard Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [classType, setClassType] = useState<ClassType>("ONE_ON_ONE");
  const [format, setFormat] = useState<ClassFormat>("VIRTUAL");
  const [duration, setDuration] = useState(60);
  const [priceDollars, setPriceDollars] = useState("75");
  const [capacity, setCapacity] = useState(1);
  const [locationId, setLocationId] = useState("");
  const [startTime, setStartTime] = useState("");

  const loadTaxonomy = async () => {
    try {
      const res = await fetch("/api/taxonomy");
      const data = await res.json();
      if (data.categories) {
        setTaxonomy(data);
        if (data.categories.length > 0) setCategoryId(data.categories[0].id);
        if (data.subjects.length > 0) setSubjectId(data.subjects[0].id);
        if (data.grades.length > 0) setGradeId(data.grades[0].id);
        if (data.locations.length > 0) setLocationId(data.locations[0].id);
      }
    } catch (err) {
      console.error("Failed to load taxonomy:", err);
    }
  };

  const loadClasses = useCallback(async () => {
    // Only proceed once auth is resolved
    if (!tutorId) return;

    try {
      setLoading(true);
      const url = `/api/classes?tutorId=${tutorId}`;
      const res = await fetch(url);
      const data = await res.json();
      setClasses(data.classes || []);
      if (data.commissionRate) {
        setCommissionRate(data.commissionRate);
      }
    } catch (err) {
      console.error("Failed to load tutor classes:", err);
    } finally {
      setLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    loadTaxonomy();
  }, []);

  useEffect(() => {
    if (tutorId) {
      loadClasses();
    }
  }, [tutorId, loadClasses]);

  const loadClassDetails = async (c: any) => {
    setSelectedClass(c);
    try {
      setLoadingBookings(true);
      const res = await fetch(`/api/bookings?tutorId=${tutorId || c.tutor_id}`);
      const data = await res.json();
      const filtered = (data.bookings || []).filter((b: any) => b.class_id === c.id);
      setClassBookings(filtered);
    } catch (err) {
      console.error("Error loading class bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleFinishWizard = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const priceCents = Math.round(parseFloat(priceDollars || "0") * 100);

      const payload = {
        title,
        description,
        tutor_id: tutorId,
        category_id: categoryId,
        subject_id: subjectId,
        grade_id: gradeId,
        class_type: classType,
        format,
        duration_minutes: Number(duration),
        price: priceCents,
        currency: "USD",
        capacity: classType === "GROUP" ? Number(capacity) : 1,
        location_id: format === "PHYSICAL" ? locationId : null,
        start_time: startTime || null,
        status: "PUBLISHED",
      };

      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish class");
      }

      setClasses((prev) => [data.class, ...prev]);
      setShowWizard(false);
      setCurrentStep(0);
      setSuccessMsg(`Class "${title}" successfully published to live marketplace.`);

      // Reset form
      setTitle("");
      setDescription("");
      setPriceDollars("75");
      setDuration(60);
      setCapacity(1);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to publish class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveClass = async (classId: string) => {
    if (!confirm("Are you sure you want to archive this class? It will no longer accept new bookings.")) return;

    try {
      const res = await fetch("/api/classes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: classId, status: "ARCHIVED" }),
      });
      if (res.ok) {
        setClasses((prev) =>
          prev.map((c) => (c.id === classId ? { ...c, status: "ARCHIVED" } : c))
        );
        if (selectedClass?.id === classId) {
          setSelectedClass((prev: any) => ({ ...prev, status: "ARCHIVED" }));
        }
      }
    } catch (err) {
      console.error("Failed to archive class:", err);
    }
  };

  const handleOpenSuggestionModal = (presetType?: "ALL_IN_ONE" | "SUBJECT" | "CATEGORY" | "GRADE") => {
    if (presetType) setSuggType(presetType);
    if (!suggParentCatId && taxonomy.categories.length > 0) {
      setSuggParentCatId(categoryId || taxonomy.categories[0].id);
    }
    setSuggFeedback(null);
    setShowSuggestionModal(true);
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert("Please log in to submit a suggestion.");
      return;
    }
    if (!suggReason.trim()) {
      alert("Please provide a description or curriculum reason for the admin to review.");
      return;
    }

    try {
      setSuggSubmitting(true);
      setSuggFeedback(null);

      const payload = {
        instructorId: user.id,
        type: suggType,
        proposedName: suggType === "ALL_IN_ONE" ? suggProposedName.trim() : suggProposedName.trim(),
        parentCategoryId: suggParentCatId || (taxonomy.categories[0]?.id ?? null),
        reasonNotes: suggReason.trim(),
        proposedCategory: suggType === "ALL_IN_ONE" && suggNewCatName.trim() ? suggNewCatName.trim() : null,
        proposedSubject: suggType === "ALL_IN_ONE" ? suggProposedName.trim() : null,
        proposedGrade: suggType === "ALL_IN_ONE" && suggNewGradeName.trim() ? suggNewGradeName.trim() : null,
      };

      const res = await fetch("/api/taxonomy/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit suggestion");

      setSuggFeedback("Your suggestion has been submitted to Levchary Admin for review! You will be notified once reviewed.");
      setSuggProposedName("");
      setSuggNewCatName("");
      setSuggNewGradeName("");
      setSuggReason("");
      setTimeout(() => {
        setShowSuggestionModal(false);
        setSuggFeedback(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Failed to submit suggestion");
    } finally {
      setSuggSubmitting(false);
    }
  };

  const wizardSteps: Step[] = [
    {
      id: "course-info",
      title: "Course Details",
      description: "Title, syllabus summary, subject area, and academic grade",
    },
    {
      id: "delivery-logistics",
      title: "Delivery & Logistics",
      description: "Instruction format, session duration, and seat capacity",
    },
    {
      id: "pricing-earnings",
      title: "Tuition & Financials",
      description: "Tuition rate and authoritative platform payout split",
    },
  ];

  const activeClasses = classes.filter((c) => ["PUBLISHED", "OPEN"].includes(c.status));
  const totalCapacity = activeClasses.reduce((sum, c) => sum + (c.capacity || 1), 0);
  const totalEnrolled = activeClasses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);

  const priceNum = parseFloat(priceDollars || "0");
  const platformFee = (priceNum * (commissionRate.defaultRate / 100)).toFixed(2);
  const tutorNet = (priceNum * (commissionRate.tutorShareRate / 100)).toFixed(2);

  return (
    <PageTransition className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              My Classes & Cohorts
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
              Live Catalog
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Publish and manage your academic offerings across interactive virtual classrooms and physical venues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadClasses}
            disabled={loading}
            className="h-8 text-xs border-slate-200 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenSuggestionModal()}
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            title="Suggest a new Subject, Category, or Grade Level to Admin"
          >
            Suggestion
          </Button>
          <Button
            onClick={() => setShowWizard(true)}
            className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish New Class</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <FadeUp className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="underline font-semibold text-emerald-950 cursor-pointer"
          >
            Dismiss
          </button>
        </FadeUp>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Classes"
          value={activeClasses.length}
          subtitle={activeClasses.length > 0 ? "Currently published" : "No classes published yet"}
          icon={Layers}
          variant="teal"
        />
        <StatCard
          title="Total Student Seats"
          value={totalCapacity}
          subtitle="Total available capacity"
          icon={Users}
          variant="purple"
        />
        <StatCard
          title="Enrolled Students"
          value={totalEnrolled}
          subtitle={totalEnrolled > 0 ? "Active confirmed enrollments" : "Students will appear here after confirmed enrollments"}
          icon={BookOpen}
          variant="teal"
        />
        <StatCard
          title="Tutor Share Rate"
          value={`${commissionRate.tutorShareRate}% Net`}
          subtitle="Admin payout tier"
          icon={TrendingUp}
          variant="emerald"
        />
      </div>

      {/* MultiStepWizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-navy-950">Publish New Class Offering</h2>
              <button
                onClick={() => setShowWizard(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <MultiStepWizard
              steps={wizardSteps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              onBack={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              onNext={() => setCurrentStep((prev) => Math.min(wizardSteps.length - 1, prev + 1))}
              onSubmit={handleFinishWizard}
              submitLabel={submitting ? "Publishing to Marketplace..." : "Publish Class to Marketplace"}
            >
              {/* Step 0: Course Info */}
              {currentStep === 0 && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Class Title *
                    </label>
                    <Input
                      placeholder="e.g. AP Calculus BC: High-Yield Problem Solving & Exam Prep"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs h-9 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Category Area *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleOpenSuggestionModal("CATEGORY")}
                          className="text-[10px] text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-0.5"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> Suggest New
                        </button>
                      </div>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                      >
                        {taxonomy.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Subject *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleOpenSuggestionModal("SUBJECT")}
                          className="text-[10px] text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-0.5"
                        >
                          <Sparkles className="w-2.5 h-2.5" /> Suggest New
                        </button>
                      </div>
                      <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                      >
                        {taxonomy.subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Target Academic Grade / Level *
                      </label>
                      <button
                        type="button"
                        onClick={() => handleOpenSuggestionModal("GRADE")}
                        className="text-[10px] text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-0.5"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Suggest New
                      </button>
                    </div>
                    <select
                      value={gradeId}
                      onChange={(e) => setGradeId(e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                    >
                      {taxonomy.grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course Description & Syllabus *
                    </label>
                    <Textarea
                      placeholder="Summarize key topics covered, problem sets provided, and prerequisite knowledge required..."
                      rows={3}
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
                        Class Type *
                      </label>
                      <select
                        value={classType}
                        onChange={(e) => {
                          const val = e.target.value as ClassType;
                          setClassType(val);
                          if (val === "ONE_ON_ONE") setCapacity(1);
                          else if (capacity <= 1) setCapacity(10);
                        }}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                      >
                        <option value="ONE_ON_ONE">1-on-1 Mentorship</option>
                        <option value="GROUP">Group Cohort</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Delivery Method *
                      </label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as ClassFormat)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                      >
                        <option value="VIRTUAL">Virtual (Interactive Classroom)</option>
                        <option value="PHYSICAL">In-Person (Approved Center)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration (Minutes) *
                      </label>
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min={15}
                        step={15}
                        className="text-xs h-9 bg-slate-50 border-slate-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student Capacity *
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

                  {format === "PHYSICAL" ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Approved Learning Center Location *
                      </label>
                      <select
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                      >
                        {taxonomy.locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} — {loc.address}, {loc.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center gap-2">
                      <Video className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        An interactive Jitsi virtual classroom will be provisioned automatically for this session.
                      </span>
                    </div>
                  )}

                  {classType === "GROUP" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Scheduled Session Start (Optional)
                      </label>
                      <Input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="text-xs h-9 bg-slate-50 border-slate-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Pricing & Financials */}
              {currentStep === 2 && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tuition Price ($ USD per enrollment) *
                    </label>
                    <Input
                      type="number"
                      value={priceDollars}
                      onChange={(e) => setPriceDollars(e.target.value)}
                      min={5}
                      step={5}
                      className="text-xs h-9 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>

                  {/* Authoritative Financial Split Calculator */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-navy-950 block">Authoritative Earnings Split</span>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-600">Gross Student Tuition:</span>
                      <span className="font-bold text-navy-950">${priceNum.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-purple-800">
                      <span>Platform Commission ({commissionRate.defaultRate}%):</span>
                      <span className="font-semibold">-${platformFee}</span>
                    </div>

                    <div className="flex items-center justify-between text-emerald-800 font-bold text-sm pt-2 border-t border-slate-200">
                      <span>Your Net Payout ({commissionRate.tutorShareRate}%):</span>
                      <span>${tutorNet}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Net payouts are deposited directly to your linked Stripe Connect account upon session completion according to platform settlement terms.
                  </p>
                </div>
              )}
            </MultiStepWizard>
          </div>
        </div>
      )}

      {/* Classes List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200/80">
          Loading catalog from live database...
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No classes published yet"
          description="You haven't published any course offerings yet. Create your first 1-on-1 mentorship session or group cohort to start receiving student bookings."
          actionLabel="Publish First Class"
          onAction={() => setShowWizard(true)}
        />
      ) : (
        <StaggerContainer className="space-y-3.5">
          {classes.map((c) => {
            const netAmount = ((c.price * (commissionRate.tutorShareRate / 100)) / 100).toFixed(2);

            return (
              <StaggerItem key={c.id}>
                <AnimatedCard>
                  <Card className="border-slate-200/80 shadow-xs hover:border-slate-300 transition-all bg-white">
                    <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={c.class_type} />
                          <StatusBadge status={c.format} />
                          <StatusBadge status={c.status} />
                          {c.category?.name && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                              {c.category.name}
                            </span>
                          )}
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
                            <span className="flex items-center gap-1 text-teal-700 font-medium">
                              <Video className="w-3.5 h-3.5" />
                              <span>{c.meet_url ? "Virtual Classroom Ready" : "Virtual Classroom Auto-Provisioned"}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{c.location?.name || "Physical Learning Center"}</span>
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
                            Net: ${netAmount}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-primary hover:bg-teal-50 flex items-center gap-1"
                            onClick={() => loadClassDetails(c)}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs border-slate-200">
                            <Link href={`/classes/${c.id}`} target="_blank">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              <span>Public Preview</span>
                            </Link>
                          </Button>
                          {c.status !== "ARCHIVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2"
                              title="Archive Class"
                              onClick={() => handleArchiveClass(c.id)}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* Detail Drawer (Section 11) */}
      <DetailDrawer
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title="Class Offering Details"
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
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Capacity:</span>
                <span className="font-bold text-navy-950">
                  {selectedClass.enrolled_count || 0}/{selectedClass.capacity} Seats Enrolled
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-navy-950 block">Title & Syllabus Description</span>
              <p className="font-semibold text-navy-900">{selectedClass.title}</p>
              <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                {selectedClass.description}
              </p>
            </div>

            {selectedClass.format === "VIRTUAL" && (
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-950 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-teal-600" />
                  <span>Google Meet Integration</span>
                </span>
                {selectedClass.meet_url ? (
                  <a
                    href={selectedClass.meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-mono text-[11px] underline block truncate"
                  >
                    {selectedClass.meet_url}
                  </a>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Meeting links are automatically provisioned upon student booking confirmation.
                  </p>
                )}
              </div>
            )}

            {/* Financial Breakdown (Section 8) */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-emerald-950">
              <span className="font-bold block">Financial Structure</span>
              <div className="flex items-center justify-between">
                <span>Tuition (Gross Price):</span>
                <span className="font-bold">
                  <MoneyDisplay cents={selectedClass.price} />
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Platform Commission ({commissionRate.defaultRate}%):</span>
                <span>
                  -${((selectedClass.price * (commissionRate.defaultRate / 100)) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200 font-bold text-emerald-800">
                <span>Net Instructor Payout ({commissionRate.tutorShareRate}%):</span>
                <span>
                  ${((selectedClass.price * (commissionRate.tutorShareRate / 100)) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Enrolled Students Roster */}
            <div className="space-y-2">
              <span className="font-bold text-navy-950 block">Enrolled Students Roster</span>
              {loadingBookings ? (
                <p className="text-slate-400 text-[11px]">Loading student roster...</p>
              ) : classBookings.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                  No active student reservations for this class yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {classBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-navy-950">
                          {b.student?.first_name} {b.student?.last_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{b.booking_number}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Button asChild size="sm" variant="outline" className="text-xs border-slate-200">
                <Link href={`/classes/${selectedClass.id}`} target="_blank">
                  Open Public Preview
                </Link>
              </Button>
              {selectedClass.status !== "ARCHIVED" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-rose-600 hover:bg-rose-50"
                  onClick={() => handleArchiveClass(selectedClass.id)}
                >
                  Archive Class
                </Button>
              )}
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Suggest Taxonomy Modal */}
      {showSuggestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <div>
                <h3 className="font-bold text-base text-navy-950">
                  Suggest to Admin
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Propose a new subject discipline, category area, or academic grade level.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestionModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {suggFeedback ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-emerald-900">{suggFeedback}</p>
                <p className="text-[11px] text-slate-400">Closing automatically...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSuggestion} className="p-6 space-y-4">
                {/* Clean Segmented Pill Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-lg">
                  {[
                    { id: "ALL_IN_ONE", label: "Full Course Package" },
                    { id: "SUBJECT", label: "Subject" },
                    { id: "CATEGORY", label: "Category" },
                    { id: "GRADE", label: "Grade Level" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSuggType(tab.id as any)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        suggType === tab.id
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Form Fields: All-In-One */}
                {suggType === "ALL_IN_ONE" && (
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Category Area *
                      </label>
                      <select
                        value={suggParentCatId || (taxonomy.categories[0]?.id ?? "")}
                        onChange={(e) => setSuggParentCatId(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-primary"
                      >
                        <option value="">-- Propose a New Category Instead --</option>
                        {taxonomy.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {!suggParentCatId && (
                        <Input
                          placeholder="e.g. Artificial Intelligence & Robotics"
                          value={suggNewCatName}
                          onChange={(e) => setSuggNewCatName(e.target.value)}
                          className="text-xs h-9 mt-2"
                          required={!suggParentCatId}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Proposed Subject Title *
                      </label>
                      <Input
                        placeholder="e.g. Deep Learning & LLM Systems"
                        value={suggProposedName}
                        onChange={(e) => setSuggProposedName(e.target.value)}
                        className="text-xs h-9"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Target Academic Grade / Level <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <Input
                        placeholder="e.g. Professional & Executive, Post-Graduate"
                        value={suggNewGradeName}
                        onChange={(e) => setSuggNewGradeName(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                )}

                {/* Form Fields: Single Subject */}
                {suggType === "SUBJECT" && (
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Parent Category Area *
                      </label>
                      <select
                        value={suggParentCatId || (taxonomy.categories[0]?.id ?? "")}
                        onChange={(e) => setSuggParentCatId(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white outline-hidden focus:ring-1 focus:ring-primary"
                        required
                      >
                        {taxonomy.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Proposed Subject Title *
                      </label>
                      <Input
                        placeholder="e.g. AP Psychology, Organic Chemistry II"
                        value={suggProposedName}
                        onChange={(e) => setSuggProposedName(e.target.value)}
                        className="text-xs h-9"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Form Fields: Single Category or Grade */}
                {(suggType === "CATEGORY" || suggType === "GRADE") && (
                  <div className="pt-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Proposed {suggType === "CATEGORY" ? "Category Name" : "Academic Grade / Level"} *
                    </label>
                    <Input
                      placeholder={
                        suggType === "CATEGORY"
                          ? "e.g. Health Sciences & Medicine"
                          : "e.g. Post-Graduate / Doctoral"
                      }
                      value={suggProposedName}
                      onChange={(e) => setSuggProposedName(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>
                )}

                {/* Curriculum Description & Scope */}
                <div className="pt-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Curriculum Description & Scope *
                  </label>
                  <Textarea
                    placeholder="Briefly summarize topics covered, prerequisites, or why this should be added..."
                    rows={3}
                    value={suggReason}
                    onChange={(e) => setSuggReason(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSuggestionModal(false)}
                    className="text-xs h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      suggSubmitting ||
                      !suggProposedName.trim() ||
                      !suggReason.trim() ||
                      (suggType === "ALL_IN_ONE" && !suggParentCatId && !suggNewCatName.trim())
                    }
                    className="text-xs h-8 bg-primary hover:bg-primary/90 text-white font-medium"
                  >
                    {suggSubmitting ? "Submitting..." : "Send Suggestion"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
