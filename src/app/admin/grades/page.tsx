"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import {
  Plus,
  Trash2,
  Edit2,
  Building2,
  UserCheck,
  Search,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type InstructorType = "TUTOR" | "FACULTY" | "BOTH";

export interface GradeItem {
  id: string;
  name: string;
  level: number;
  description: string;
  instructor_type: InstructorType;
}

export default function AdminGradesPage() {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLevel, setNewLevel] = useState<number>(1);
  const [allowTutor, setAllowTutor] = useState(true);
  const [allowFaculty, setAllowFaculty] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Edit Modal State
  const [editingGrade, setEditingGrade] = useState<GradeItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLevel, setEditLevel] = useState<number>(1);
  const [editAllowTutor, setEditAllowTutor] = useState(true);
  const [editAllowFaculty, setEditAllowFaculty] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/grades");
      if (res.ok) {
        const data = await res.json();
        const loadedGrades = data.grades || [];
        setGrades(loadedGrades);
        // Default next tier level
        if (loadedGrades.length > 0) {
          const maxLevel = Math.max(...loadedGrades.map((g: GradeItem) => g.level || 0));
          setNewLevel(maxLevel + 1);
        } else {
          setNewLevel(1);
        }
      }
    } catch (err) {
      console.error("Failed to load grades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let instructor_type: InstructorType = "BOTH";
    if (allowTutor && !allowFaculty) instructor_type = "TUTOR";
    else if (!allowTutor && allowFaculty) instructor_type = "FACULTY";

    try {
      setSaving(true);
      setModalError(null);
      const res = await fetch("/api/admin/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          level: Number(newLevel),
          description: newDescription.trim() || undefined,
          instructor_type,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create grade tier");
      }

      setNewName("");
      setNewDescription("");
      setAllowTutor(true);
      setAllowFaculty(false);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to save grade tier");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (grade: GradeItem) => {
    setEditingGrade(grade);
    setEditName(grade.name);
    setEditDescription(grade.description || "");
    setEditLevel(grade.level);
    setEditAllowTutor(grade.instructor_type === "TUTOR" || grade.instructor_type === "BOTH");
    setEditAllowFaculty(grade.instructor_type === "FACULTY" || grade.instructor_type === "BOTH");
    setEditModalError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade || !editName.trim()) return;

    let instructor_type: InstructorType = "BOTH";
    if (editAllowTutor && !editAllowFaculty) instructor_type = "TUTOR";
    else if (!editAllowTutor && editAllowFaculty) instructor_type = "FACULTY";

    try {
      setSaving(true);
      setEditModalError(null);
      const res = await fetch("/api/admin/grades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGrade.id,
          updates: {
            name: editName.trim(),
            level: Number(editLevel),
            description: editDescription.trim() || "",
            instructor_type,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update grade tier");
      }

      setEditingGrade(null);
      await loadData();
    } catch (err: any) {
      setEditModalError(err.message || "Failed to update grade tier");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/grades?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadData();
      } else {
        alert("Could not delete grade tier. It may be assigned to courses or instructors.");
      }
    } catch (err) {
      console.error("Failed to delete grade:", err);
      alert("Error deleting grade tier");
    }
  };

  // Filter & Sort
  const processedGrades = useMemo(() => {
    return grades
      .filter(
        (g) =>
          g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.level - b.level);
  }, [grades, searchTerm]);

  const academicTabs = [
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    { label: "Assignment Oversight", href: "/admin/assignments" },
    { label: "Curriculum Suggestions", href: "/admin/suggestions" },
    { label: "Post-Class Reports", href: "/admin/post-class-reports" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Academics & Curriculum Hub"
        badgeText="Grade Tiers"
        description="Configure academic progression tiers, student brackets, and tutor versus faculty pedagogical authorizations."
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
              onClick={loadData}
              disabled={loading}
              className="h-8 text-xs border-slate-200 gap-1.5 text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setModalError(null);
                setIsModalOpen(true);
              }}
              className="text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-2xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Grade Tier</span>
            </Button>
          </div>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search grade tiers or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-xs bg-slate-50 border-slate-200"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing {processedGrades.length} of {grades.length} grade tiers
        </div>
      </div>

      {/* Grade Tier Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
              Academic Progression Ladder (Ordered by Level)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Higher levels unlock advanced university and research coursework
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {processedGrades.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {loading ? "Loading grade tiers..." : "No grade tiers found matching search criteria."}
            </div>
          ) : (
            processedGrades.map((g) => (
              <div
                key={g.id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center shrink-0 text-teal-700 font-bold text-xs mt-0.5 sm:mt-0">
                    L{g.level}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-xs font-bold text-navy-950">{g.name}</h4>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Level {g.level}
                      </span>
                      {g.instructor_type === "TUTOR" && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Tutors Qualified
                        </span>
                      )}
                      {g.instructor_type === "FACULTY" && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Faculty Only
                        </span>
                      )}
                      {g.instructor_type === "BOTH" && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Tutors & Faculty Qualified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{g.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(g)}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                    title="Edit grade tier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(g.id, g.name)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete grade tier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Add Academic Grade Tier</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define a progressive schooling level and instructor qualifications.</p>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tier Name *</label>
                <Input
                  placeholder="e.g. Graduate & Professional Research"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Progression Level (Sequence)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newLevel}
                  onChange={(e) => setNewLevel(Number(e.target.value))}
                  className="h-9 text-xs"
                  required
                />
                <p className="text-[10px] text-slate-400">Controls order of curriculum difficulty in class creation.</p>
              </div>

              {/* Instructor Eligibility */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Instructor Eligibility
                </label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowTutor}
                      onChange={(e) => {
                        setAllowTutor(e.target.checked);
                        if (!e.target.checked && !allowFaculty) setAllowFaculty(true);
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>Tutors</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowFaculty}
                      onChange={(e) => {
                        setAllowFaculty(e.target.checked);
                        if (!e.target.checked && !allowTutor) setAllowTutor(true);
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>Faculty</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <Textarea
                  placeholder="Curriculum scope and target student background..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="text-xs min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || !newName.trim()}
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs"
                >
                  {saving ? "Saving..." : "Save Tier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Edit Academic Grade Tier</h3>
              <p className="text-xs text-slate-500 mt-0.5">Modify tier name, sequence level, or teaching authorizations.</p>
            </div>

            {editModalError && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tier Name *</label>
                <Input
                  placeholder="e.g. Graduate & Professional Research"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Progression Level (Sequence)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={editLevel}
                  onChange={(e) => setEditLevel(Number(e.target.value))}
                  className="h-9 text-xs"
                  required
                />
                <p className="text-[10px] text-slate-400">Controls order of curriculum difficulty in class creation.</p>
              </div>

              {/* Instructor Eligibility */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Instructor Eligibility
                </label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editAllowTutor}
                      onChange={(e) => {
                        setEditAllowTutor(e.target.checked);
                        if (!e.target.checked && !editAllowFaculty) setEditAllowFaculty(true);
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>Tutors</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editAllowFaculty}
                      onChange={(e) => {
                        setEditAllowFaculty(e.target.checked);
                        if (!e.target.checked && !editAllowTutor) setEditAllowTutor(true);
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>Faculty</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <Textarea
                  placeholder="Curriculum scope and target student background..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-xs min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingGrade(null)}
                  disabled={saving}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || !editName.trim()}
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs"
                >
                  {saving ? "Saving..." : "Update Tier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
