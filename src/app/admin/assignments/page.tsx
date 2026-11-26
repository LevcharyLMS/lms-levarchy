"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
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
  FileSpreadsheet,
  X,
  FileCheck,
  ShieldAlert,
} from "lucide-react";
import { Assignment } from "@/types";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function AdminAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Admin Edit Modal State
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
          adminId: user?.id || "usr-admin-1",
          title: editTitle.trim(),
          description: editDescription.trim(),
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

  // KPIs
  const totalCount = assignments.length;
  const inReviewCount = assignments.filter((a) => a.status === "IN_REVIEW").length;
  const publishedCount = assignments.filter((a) => a.status === "PUBLISHED").length;
  const totalSubmissions = assignments.reduce((acc, curr) => acc + (curr.submissions_count || 0), 0);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      if (statusFilter !== "ALL" && a.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchInstructor =
          (a.instructor?.first_name || "").toLowerCase().includes(q) ||
          (a.instructor?.last_name || "").toLowerCase().includes(q);
        const matchClass = (a.class_title || "").toLowerCase().includes(q);
        const matchDesc = (a.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchInstructor && !matchClass && !matchDesc) return false;
      }

      return true;
    });
  }, [assignments, search, statusFilter]);

  const academicTabs = [
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    {
      label: "Assignment Oversight",
      href: "/admin/assignments",
      badge: inReviewCount > 0 ? inReviewCount : undefined,
    },
    { label: "Curriculum Suggestions", href: "/admin/suggestions" },
    { label: "Post-Class Reports", href: "/admin/post-class-reports" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <AdminHubHeader
          title="Academics & Curriculum Hub"
          badgeText="Assignments Oversight"
          description="Inspect, verify, or place assignments under quality review across all instructor cohorts. Pre-approval is not mandated."
          tabs={academicTabs}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/admin/reports">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-slate-200 text-slate-600 hover:text-slate-900 gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                  <span>Reports Hub CSV</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAssignments}
                disabled={loading}
                className="h-8 text-xs border-slate-200 gap-1.5 text-slate-600 hover:text-slate-900"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>
          }
        />

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StatCard
            title="Total Active Assignments"
            value={publishedCount}
            subtitle={`${totalCount} total cataloged`}
            icon={BookOpen}
            variant="teal"
          />
          <StatCard
            title="Under Quality Review"
            value={inReviewCount}
            subtitle={inReviewCount > 0 ? "Requires admin clearance" : "All assignments active"}
            icon={ShieldAlert}
            variant={inReviewCount > 0 ? "amber" : "slate"}
          />
          <StatCard
            title="Student Submissions"
            value={totalSubmissions}
            subtitle="Turned in across all cohorts"
            icon={FileCheck}
            variant="teal"
          />
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search assignments, instructors, or courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 h-8 bg-slate-50 border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-hidden font-medium"
            >
              <option value="ALL">All Statuses ({assignments.length})</option>
              <option value="PUBLISHED">Published Only ({publishedCount})</option>
              <option value="IN_REVIEW">Under Review ({inReviewCount})</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              Showing {filtered.length} of {assignments.length}
            </span>
          </div>
        </div>

        {/* Directory List */}
        {loading ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading platform assignments...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3.5">
            {filtered.map((a) => (
              <Card
                key={a.id}
                className="bg-white border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all overflow-hidden"
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
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : a.status === "IN_REVIEW"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {a.status === "PUBLISHED"
                            ? "Active"
                            : a.status === "IN_REVIEW"
                            ? "Under Review"
                            : "Archived"}
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
                        <Calendar className="w-3 h-3 text-slate-400" />
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
                      <span>Submissions: <strong className="text-navy-950">{a.submissions_count || 0}</strong></span>
                      <span className="text-emerald-700">Graded: <strong className="text-emerald-800">{a.graded_count || 0}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.file_url && (
                        <a
                          href={a.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-700" />
                          <span>Brief PDF</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5 font-medium border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() => handleOpenEdit(a)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-teal-600" />
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
                  <h3 className="text-sm font-bold text-navy-950">
                    Edit Assignment (Admin Oversight)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modify title, instructions, maximum points, or adjust platform review status.
                  </p>
                </div>
                <button
                  onClick={() => setEditingAssignment(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assignment Title *</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Max Marks (Points)</label>
                    <Input
                      type="number"
                      value={editMaxMarks}
                      onChange={(e) => setEditMaxMarks(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Oversight Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 bg-white font-medium"
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
                    className="text-xs min-h-[90px]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setEditingAssignment(null)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs"
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
