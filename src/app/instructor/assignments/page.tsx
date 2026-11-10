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
  Plus,
  Users,
  Eye,
  Trash2,
  AlertCircle,
  HelpCircle,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { Assignment, AssignmentSubmission, ClassItem } from "@/types";

export default function InstructorAssignmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"ASSIGNMENTS" | "GRADING">("ASSIGNMENTS");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Creation Drawer / Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [dueDate, setDueDate] = useState("");
  const [linkInput, setLinkInput] = useState({ label: "", url: "" });
  const [resourceLinks, setResourceLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [uploadingBrief, setUploadingBrief] = useState(false);
  const [uploadedBrief, setUploadedBrief] = useState<{ url: string; name: string } | null>(null);
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Review & Grading State
  const [inspectAssignment, setInspectAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [marksAwarded, setMarksAwarded] = useState("");
  const [gradeLetter, setGradeLetter] = useState("A");
  const [instructorFeedback, setInstructorFeedback] = useState("");
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  // All submissions across all assignments for the dedicated "Review and Grading" tab
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [assignRes, classesRes] = await Promise.all([
        fetch(`/api/assignments?instructorId=${user.id}`),
        fetch(`/api/classes?tutorId=${user.id}`),
      ]);
      const assignData = await assignRes.json();
      const classesData = await classesRes.json();
      const loadedAssignments: Assignment[] = assignData.assignments || [];
      setAssignments(loadedAssignments);
      setClasses(classesData.classes || []);

      // Load all submissions for the review & grading tab
      const allSubs: any[] = [];
      for (const a of loadedAssignments) {
        try {
          const subRes = await fetch(`/api/assignments/submissions?assignmentId=${a.id}`);
          const subData = await subRes.json();
          if (subData.submissions) {
            subData.submissions.forEach((s: any) => {
              allSubs.push({ ...s, assignment: a });
            });
          }
        } catch {}
      }
      setAllSubmissions(allSubs);
    } catch (err) {
      console.error("Failed to load instructor assignments:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBriefUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrief(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "assignment-briefs");

      const res = await fetch("/api/assignments/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Brief upload failed");

      setUploadedBrief({ url: data.fileUrl, name: data.fileName || file.name });
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingBrief(false);
    }
  };

  const handleAddLink = () => {
    if (!linkInput.url.trim()) return;
    setResourceLinks((prev) => [
      ...prev,
      { label: linkInput.label.trim() || linkInput.url.trim(), url: linkInput.url.trim() },
    ]);
    setLinkInput({ label: "", url: "" });
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !user?.id) return;

    setSavingAssignment(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: user.id,
          classId: classId || null,
          title,
          description,
          maxMarks: parseFloat(maxMarks) || 100,
          dueDate: new Date(dueDate).toISOString(),
          fileUrl: uploadedBrief?.url || null,
          fileName: uploadedBrief?.name || null,
          resourceLinks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create assignment");

      setCreateModalOpen(false);
      setTitle("");
      setClassId("");
      setDescription("");
      setMaxMarks("100");
      setDueDate("");
      setResourceLinks([]);
      setUploadedBrief(null);
      await loadData();
    } catch (err: any) {
      alert("Error creating assignment: " + err.message);
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleOpenSubmissions = async (assignment: Assignment) => {
    setInspectAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/assignments/submissions?assignmentId=${assignment.id}`);
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGrading = (sub: AssignmentSubmission, parentAssignment?: Assignment) => {
    setGradingSubmission(sub);
    if (parentAssignment) {
      setInspectAssignment(parentAssignment);
    }
    setMarksAwarded(sub.marks_awarded ? String(sub.marks_awarded) : "");
    setGradeLetter(sub.grade_letter || "A");
    setInstructorFeedback(sub.instructor_feedback || "");
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission || !marksAwarded) return;

    setGradingSubmitting(true);
    try {
      const res = await fetch("/api/assignments/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: gradingSubmission.id,
          marksAwarded: parseFloat(marksAwarded),
          gradeLetter,
          instructorFeedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Grading submission failed");

      // Close modal cleanly
      setGradingSubmission(null);
      setInspectAssignment(null);
      await loadData();
    } catch (err: any) {
      alert("Error publishing grade: " + err.message);
    } finally {
      setGradingSubmitting(false);
    }
  };

  const pendingGradingCount = allSubmissions.filter((s) => s.status !== "COMPLETED").length;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-navy-950">
                Post-Class Assignments & Grading
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                Faculty Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your post-class assignments, review submitted student answer sheets, and award marks.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="h-9 px-4 text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </Button>
        </div>

        {/* Dedicated Two Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <button
            onClick={() => setActiveTab("ASSIGNMENTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ASSIGNMENTS"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Assignments Directory ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("GRADING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "GRADING"
                ? "bg-navy-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Review & Grading</span>
            {pendingGradingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingGradingCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: ASSIGNMENTS DIRECTORY */}
        {activeTab === "ASSIGNMENTS" && (
          <div>
            {loading ? (
              <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl">
                <div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading your assignments...</p>
              </div>
            ) : assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((a) => (
                  <Card
                    key={a.id}
                    className="bg-white border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {a.class_title || "Individual Mentorship"}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {a.status}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-navy-950 mt-1">
                            {a.title}
                          </h3>
                          {a.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {a.description}
                            </p>
                          )}
                        </div>

                        <div className="text-left md:text-right shrink-0">
                          <span className="text-xs font-semibold text-slate-700 block">
                            Max: {a.max_marks} pts
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 flex items-center md:justify-end gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>

                      {/* Brief Handout & Links */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {a.file_url && (
                          <a
                            href={a.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                          >
                            <FileText className="w-3.5 h-3.5 text-purple-700" />
                            <span>{a.file_name || "Brief Handout (PDF)"}</span>
                            <Download className="w-3 h-3" />
                          </a>
                        )}

                        {a.resource_links?.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-medium border border-purple-200/60"
                          >
                            <ExternalLink className="w-3 h-3 text-purple-600" />
                            <span>{link.label || link.url}</span>
                          </a>
                        ))}
                      </div>

                      {/* Submission Statistics & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Submissions: <strong>{a.submissions_count || 0}</strong></span>
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Graded: {a.graded_count || 0}</span>
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleOpenSubmissions(a)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Submissions ({a.submissions_count || 0})</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No post-class assignments created yet"
                description="Create homework prompts or syllabus exercises for students to reinforce classroom concepts."
                actionLabel="Create First Assignment"
                onAction={() => setCreateModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB 2: REVIEW & GRADING TAB */}
        {activeTab === "GRADING" && (
          <div>
            {allSubmissions.length > 0 ? (
              <div className="space-y-3">
                {allSubmissions.map((sub) => {
                  const isGraded = sub.status === "COMPLETED";

                  return (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {sub.assignment?.title || "Class Assignment"}
                            </span>
                            {isGraded ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Graded: {sub.grade_letter} ({sub.marks_awarded} pts)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 animate-pulse">
                                Awaiting Your Review
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-navy-950">
                            Student: {sub.student?.first_name} {sub.student?.last_name}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            Submitted on {new Date(sub.submitted_at).toLocaleString()}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          className="h-8 text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold gap-1.5 shrink-0"
                          onClick={() => handleOpenGrading(sub, sub.assignment)}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isGraded ? "Update Grade" : "Grade & Review"}</span>
                        </Button>
                      </div>

                      {/* Student Written Response */}
                      {sub.submission_text && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Student Written Response:
                          </span>
                          {sub.submission_text}
                        </div>
                      )}

                      {/* File Attachment & Open */}
                      <div className="flex items-center gap-2">
                        {sub.file_url && !sub.file_pruned ? (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-teal-700" />
                            <span>Open & Review {sub.file_name || "Student Document"}</span>
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        ) : sub.file_pruned ? (
                          <span className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Storage file cleaned up post-grading • Permanent marks metadata preserved.</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No document file attached.</span>
                        )}
                      </div>

                      {/* Existing Feedback */}
                      {isGraded && sub.instructor_feedback && (
                        <div className="text-xs text-slate-700 bg-teal-50/50 p-3 rounded-xl border border-teal-200/60 italic">
                          <strong>Your Pedagogical Feedback:</strong> &ldquo;{sub.instructor_feedback}&rdquo;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardCheck}
                title="No student submissions pending review"
                description="When enrolled students submit their post-class homework, they will appear here for correction and grading."
              />
            )}
          </div>
        )}

        {/* Create Assignment Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-950">
                    Create Post-Class Assignment
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Post questions, attachment documents, and due dates for your students.
                  </p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Assignment Title *
                  </label>
                  <Input
                    placeholder="e.g. Chapter 4 Thermodynamics & Problem Set 2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Link to Class (Optional)
                    </label>
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="">General Mentorship</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Maximum Marks (Points)
                    </label>
                    <Input
                      type="number"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Submission Due Date *
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Instructions & Syllabus Problem Details
                  </label>
                  <Textarea
                    placeholder="Provide detailed instructions or write the problem set questions here..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Handout Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Attach Handout / Assignment Brief
                  </label>
                  <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center">
                    <input
                      type="file"
                      id="brief-file"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={handleBriefUpload}
                      className="hidden"
                    />
                    <label htmlFor="brief-file" className="cursor-pointer space-y-1 block">
                      <FileText className="w-5 h-5 text-purple-700 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        {uploadingBrief
                          ? "Uploading handout..."
                          : uploadedBrief
                          ? uploadedBrief.name
                          : "Upload Handout (PDF / Word / Image)"}
                      </p>
                    </label>
                  </div>
                </div>

                {/* External Resource Links */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    External Resources / Web Reference Links
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Title (e.g. Reference Formula Sheet)"
                      value={linkInput.label}
                      onChange={(e) => setLinkInput({ ...linkInput, label: e.target.value })}
                      className="text-xs flex-1"
                    />
                    <Input
                      placeholder="https://..."
                      value={linkInput.url}
                      onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
                      className="text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddLink}
                      className="text-xs shrink-0"
                    >
                      Add
                    </Button>
                  </div>

                  {resourceLinks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {resourceLinks.map((l, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs"
                        >
                          {l.label}
                          <button
                            type="button"
                            onClick={() =>
                              setResourceLinks((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="text-slate-400 hover:text-red-600 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={savingAssignment || !title || !dueDate}
                    className="text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold"
                  >
                    {savingAssignment ? "Publishing..." : "Publish Assignment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Standalone Submissions Modal (From directory view) */}
        {inspectAssignment && !gradingSubmission && (
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-navy-950">
                    Submissions: {inspectAssignment.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inspect student answers and grade work.
                  </p>
                </div>
                <button
                  onClick={() => setInspectAssignment(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                >
                  ×
                </button>
              </div>

              {loadingSubmissions ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading submissions...</div>
              ) : submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const isGraded = sub.status === "COMPLETED";

                    return (
                      <div
                        key={sub.id}
                        className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-navy-950">
                            {sub.student?.first_name} {sub.student?.last_name}
                          </span>
                          {isGraded ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Graded: {sub.grade_letter} ({sub.marks_awarded} pts)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Ready for Review
                            </span>
                          )}
                        </div>

                        {sub.file_url && !sub.file_pruned && (
                          <div>
                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Open {sub.file_name || "Submitted File"}</span>
                              <Download className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold"
                            onClick={() => handleOpenGrading(sub)}
                          >
                            {isGraded ? "Update Grade" : "Grade & Review"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No students have submitted work for this assignment yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clean Single-Layer Grading Dialog */}
        {gradingSubmission && (
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs z-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-950">
                    Grade Submission
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Student: {gradingSubmission.student?.first_name} {gradingSubmission.student?.last_name}
                  </p>
                </div>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                >
                  ×
                </button>
              </div>

              {/* Document Quick Open in Grading Modal */}
              {gradingSubmission.file_url && !gradingSubmission.file_pruned && (
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-900">
                    <FileText className="w-4 h-4 text-teal-700" />
                    <span className="truncate max-w-[200px]">{gradingSubmission.file_name || "Submitted Document"}</span>
                  </div>
                  <a
                    href={gradingSubmission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>View File</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Marks (Max: {inspectAssignment?.max_marks || 100}) *
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 92"
                      value={marksAwarded}
                      onChange={(e) => setMarksAwarded(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Grade Letter *
                    </label>
                    <select
                      value={gradeLetter}
                      onChange={(e) => setGradeLetter(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="A+">A+ (Exceptional)</option>
                      <option value="A">A (Excellent)</option>
                      <option value="B+">B+ (Very Good)</option>
                      <option value="B">B (Good)</option>
                      <option value="C">C (Satisfactory)</option>
                      <option value="Needs Revision">Needs Revision</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Pedagogical Feedback & Post-Class Review
                  </label>
                  <Textarea
                    placeholder="Provide constructive feedback, praise strong points, and highlight areas for revision..."
                    rows={4}
                    value={instructorFeedback}
                    onChange={(e) => setInstructorFeedback(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-800 leading-relaxed">
                  <strong>Progression Update:</strong> Publishing this evaluation updates the student's mastery score and archives their progress record permanently.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setGradingSubmission(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={gradingSubmitting || !marksAwarded}
                    className="text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold"
                  >
                    {gradingSubmitting ? "Publishing..." : "Publish Marks & Complete"}
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
