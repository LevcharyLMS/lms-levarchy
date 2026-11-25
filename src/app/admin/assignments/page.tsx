"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/animations";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Search,
  SlidersHorizontal,
  Users,
  Edit2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Assignment } from "@/types";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMaxMarks, setEditMaxMarks] = useState("100");
  const [editStatus, setEditStatus] = useState("PUBLISHED");
  const [saving, setSaving] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assignments");
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error("Failed to load admin assignments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleOpenEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setEditTitle(a.title);
    setEditDescription(a.description || "");
    setEditMaxMarks(String(a.max_marks || 100));
    setEditStatus(a.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    setSaving(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAssignment.id,
          title: editTitle,
          description: editDescription,
          max_marks: parseFloat(editMaxMarks) || 100,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update assignment");

      setEditingAssignment(null);
      await loadAssignments();
    } catch (err: any) {
      alert("Error saving assignment: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.instructor?.first_name || "").toLowerCase().includes(q) ||
      (a.instructor?.last_name || "").toLowerCase().includes(q) ||
      (a.class_title || "").toLowerCase().includes(q)
    );
  });

  const academicTabs = [
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    { label: "Assignment Oversight", href: "/admin/assignments" },
    { label: "Curriculum Suggestions", href: "/admin/suggestions" },
    { label: "Physical Venues", href: "/admin/locations" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <AdminHubHeader
          title="Academics & Curriculum Hub"
          badgeText="Assignments Oversight"
          description="Inspect, edit, or put assignments under review across all instructor cohorts. Pre-approval is not mandated."
          tabs={academicTabs}
          actions={
            <div className="flex items-center gap-3">
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search assignments or tutors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs pl-8 h-8 bg-slate-50 border-slate-200"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAssignments}
                disabled={loading}
                className="h-8 text-xs border-slate-200 gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>
          }
        />

        {/* Directory List */}
        {loading ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading platform assignments...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((a) => (
              <Card
                key={a.id}
                className="bg-white border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3.5 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {a.class_title || "Mentorship Session"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            a.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : a.status === "IN_REVIEW"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {a.status}
                        </span>
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

                    <div className="text-left md:text-right shrink-0">
                      <span className="text-xs font-semibold text-slate-700 block">
                        Max Marks: {a.max_marks} pts
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 flex items-center md:justify-end gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  {a.description && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                      {a.description}
                    </p>
                  )}

                  {/* Actions & Metrics */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>Submissions: <strong>{a.submissions_count || 0}</strong></span>
                      <span className="text-emerald-700">Graded: <strong>{a.graded_count || 0}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.file_url && (
                        <a
                          href={a.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                        >
                          <FileText className="w-3 h-3 text-teal-700" />
                          <span>Brief PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => handleOpenEdit(a)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Manage / Edit</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No assignments found"
            description="Assignments created across the platform will be cataloged here for oversight."
          />
        )}

        {/* Admin Edit Modal */}
        {editingAssignment && (
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-950">
                    Edit Assignment (Admin Oversight)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modify title, descriptions, max marks, or set review status.
                  </p>
                </div>
                <button
                  onClick={() => setEditingAssignment(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assignment Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Max Marks</label>
                    <Input
                      type="number"
                      value={editMaxMarks}
                      onChange={(e) => setEditMaxMarks(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="PUBLISHED">Published (Active)</option>
                      <option value="IN_REVIEW">Under Admin Review</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Instructions / Prompt</label>
                  <Textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setEditingAssignment(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold"
                  >
                    {saving ? "Saving..." : "Save Changes"}
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
