"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition, FadeIn } from "@/components/animations";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ExternalLink,
  Award,
  Upload,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Assignment } from "@/types";

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progression, setProgression] = useState({
    totalSubmitted: 0,
    totalGraded: 0,
    averageScore: 0,
    progressionLevel: "Foundational",
  });
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  // Submission Drawer / Modal state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; size: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/assignments?studentId=${user.id}`);
      const data = await res.json();
      setAssignments(data.assignments || []);
      if (data.progressionMetrics) {
        setProgression(data.progressionMetrics);
      }
    } catch (err) {
      console.error("Failed to load student assignments:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "student-submissions");

      const res = await fetch("/api/assignments/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "File upload failed");

      setUploadedFile({
        url: data.fileUrl,
        name: data.fileName || file.name,
        size: data.fileSize || file.size,
      });
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !user?.id) return;

    setSubmitting(true);
    setSubmitSuccess(null);

    try {
      const res = await fetch("/api/assignments/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          studentId: user.id,
          submissionText,
          fileUrl: uploadedFile?.url || null,
          fileName: uploadedFile?.name || null,
          fileSize: uploadedFile?.size || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit assignment.");

      setSubmitSuccess("Assignment submitted successfully! Your instructor has been notified.");
      setSelectedAssignment(null);
      setSubmissionText("");
      setUploadedFile(null);
      await loadData();
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const isSubmittedOrGraded = !!a.user_submission;
    const isCompleted = a.user_submission?.status === "COMPLETED";

    if (filterTab === "PENDING") return !isSubmittedOrGraded;
    if (filterTab === "COMPLETED") return isCompleted;
    return true;
  });

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header & Academic Progression Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-navy-950">
                Post-Class Assignments & Progress
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                Academic Portfolio
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Complete homework, review instructor grading, and track your curriculum progress level.
            </p>
          </div>

          {/* Progression Metric Pill */}
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-teal-600/10 flex items-center justify-center text-teal-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Progression Tier:</span>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {progression.progressionLevel}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                {progression.totalGraded} Graded • Avg Score:{" "}
                <span className="text-teal-700">{progression.averageScore}%</span>
              </p>
            </div>
          </div>
        </div>

        {submitSuccess && (
          <FadeIn>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          </FadeIn>
        )}

        {/* Tab Filter Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          {(["ALL", "PENDING", "COMPLETED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === tab
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab === "ALL" && `All (${assignments.length})`}
              {tab === "PENDING" &&
                `Action Required (${assignments.filter((a) => !a.user_submission).length})`}
              {tab === "COMPLETED" &&
                `Graded & Completed (${assignments.filter((a) => a.user_submission?.status === "COMPLETED").length})`}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading assignments and progression...</p>
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((a) => {
              const sub = a.user_submission;
              const isGraded = sub?.status === "COMPLETED";
              const isSubmitted = !!sub && !isGraded;
              const isPastDue = new Date(a.due_date).getTime() < Date.now();

              return (
                <Card
                  key={a.id}
                  className="bg-white border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {a.class_title || "Academic Session"}
                          </span>
                          {isGraded ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Graded: {sub?.grade_letter || "A"} ({sub?.marks_awarded}/{a.max_marks})
                            </span>
                          ) : isSubmitted ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Under Instructor Review
                            </span>
                          ) : isPastDue ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Past Due
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Due Soon
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-navy-950 mt-1">
                          {a.title}
                        </h3>

                        {a.instructor && (
                          <p className="text-xs text-slate-500">
                            Instructor:{" "}
                            <strong className="text-slate-800">
                              {a.instructor.first_name} {a.instructor.last_name}
                            </strong>
                          </p>
                        )}
                      </div>

                      {/* Score / Due Date Info */}
                      <div className="text-left md:text-right shrink-0">
                        <span className="text-xs font-semibold text-slate-600 block">
                          Maximum Score: {a.max_marks} pts
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 flex items-center md:justify-end gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {new Date(a.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </span>
                      </div>
                    </div>

                    {/* Assignment Instructions / Prompt */}
                    {a.description && (
                      <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                        {a.description}
                      </p>
                    )}

                    {/* Attachments & Reference Links */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2">
                      {a.file_url && (
                        <a
                          href={a.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-700" />
                          <span>{a.file_name || "Assignment Handout (PDF)"}</span>
                          <Download className="w-3 h-3 ml-0.5" />
                        </a>
                      )}

                      {a.resource_links?.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-medium transition-colors border border-teal-200/60"
                        >
                          <ExternalLink className="w-3 h-3 text-teal-600" />
                          <span>{link.label || link.url}</span>
                        </a>
                      ))}
                    </div>

                    {/* Graded Feedback Box (Rule 11: Permanent Metadata Preservation) */}
                    {isGraded && (
                      <div className="mt-4 p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-950">
                            <Award className="w-4 h-4 text-teal-700" />
                            <span>Instructor Feedback & Review</span>
                          </div>
                          <span className="text-[10px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                            Grade: {sub?.grade_letter} ({sub?.marks_awarded} / {a.max_marks})
                          </span>
                        </div>
                        {sub?.instructor_feedback ? (
                          <p className="text-xs text-slate-700 leading-relaxed italic">
                            &ldquo;{sub.instructor_feedback}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No additional notes provided.</p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Completed on {new Date(sub?.graded_at || "").toLocaleDateString()} • Storage purged & metadata securely archived.
                        </p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        {isGraded
                          ? "Progression validated by instructor."
                          : isSubmitted
                          ? "Submitted on " + new Date(sub?.submitted_at || "").toLocaleDateString()
                          : "Submit answer sheet or response before deadline."}
                      </div>

                      {!isSubmitted && (
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-xs font-semibold"
                          onClick={() => setSelectedAssignment(a)}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Work</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No assignments found"
            description="All caught up! Post-class assignments given by instructors after sessions will appear here."
            actionLabel="Explore Classes"
            actionHref="/student/classes"
          />
        )}

        {/* Submission Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-950">
                    Submit Assignment Work
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedAssignment.title} (Max: {selectedAssignment.max_marks} pts)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Written notes / response */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Student Notes / Written Response (Optional)
                  </label>
                  <Textarea
                    placeholder="Enter any answers, notes, or comments for the instructor..."
                    rows={4}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* PDF / Document Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Attach Answer Sheet / PDF File
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-teal-500 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer space-y-1 block">
                      <Upload className="w-6 h-6 text-teal-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        {uploadingFile
                          ? "Uploading document..."
                          : uploadedFile
                          ? uploadedFile.name
                          : "Click to upload your completed PDF"}
                      </p>
                      <p className="text-[10px] text-slate-400">PDF, Word, or Scanned Images up to 10MB</p>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedAssignment(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting || uploadingFile || (!submissionText.trim() && !uploadedFile)}
                    className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    {submitting ? "Submitting..." : "Confirm & Submit"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
