"use client";

import React, { useState, useMemo } from "react";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import {
  Plus,
  Trash2,
  GripVertical,
  Building2,
  UserCheck,
  Search,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
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
  const [grades, setGrades] = useState<GradeItem[]>([
    {
      id: "grd-1",
      name: "Middle School (Grades 6-8)",
      level: 1,
      description: "Foundational core subjects and early preparatory coursework",
      instructor_type: "TUTOR",
    },
    {
      id: "grd-2",
      name: "High School (Grades 9-10)",
      level: 2,
      description: "Secondary school honors courses and foundational exam strategies",
      instructor_type: "TUTOR",
    },
    {
      id: "grd-3",
      name: "High School (Grades 11-12)",
      level: 3,
      description: "Advanced Placement (AP), IB, standardized testing, and college prep",
      instructor_type: "BOTH",
    },
    {
      id: "grd-4",
      name: "Undergraduate / College",
      level: 4,
      description: "University-level STEM, pre-med, computer science, and engineering",
      instructor_type: "FACULTY",
    },
    {
      id: "grd-5",
      name: "Graduate & Professional",
      level: 5,
      description: "Post-graduate, doctoral research, professional certifications & executive training",
      instructor_type: "FACULTY",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<keyof GradeItem | null>("level");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [allowTutor, setAllowTutor] = useState(true);
  const [allowFaculty, setAllowFaculty] = useState(false);

  // Drag and Drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sorting Handler
  const handleSort = (key: keyof GradeItem) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Filter & Sort
  const processedGrades = useMemo(() => {
    let result = grades.filter(
      (g) =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
        return sortOrder === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [grades, searchTerm, sortKey, sortOrder]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...grades];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, movedItem);

    // Recalibrate consecutive levels 1, 2, 3...
    const recalibrated = reordered.map((item, idx) => ({
      ...item,
      level: idx + 1,
    }));

    setGrades(recalibrated);
    setSortKey(null); // Switch to manual drag order
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleOpenModal = () => {
    setNewName("");
    setNewDescription("");
    setAllowTutor(true);
    setAllowFaculty(false);
    setIsModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let computedType: InstructorType = "TUTOR";
    if (allowTutor && allowFaculty) computedType = "BOTH";
    else if (allowFaculty) computedType = "FACULTY";

    const nextLevel = grades.length + 1;

    setGrades([
      ...grades,
      {
        id: `grd-${Date.now()}`,
        name: newName.trim(),
        level: nextLevel,
        description: newDescription.trim(),
        instructor_type: computedType,
      },
    ]);

    setNewName("");
    setNewDescription("");
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const remaining = grades.filter((g) => g.id !== id);
    setGrades(remaining.map((g, idx) => ({ ...g, level: idx + 1 })));
  };

  const renderSortIcon = (key: keyof GradeItem) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-teal-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-teal-600 font-bold" />
    );
  };

  const academicTabs = [
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    { label: "Assignment Oversight", href: "/admin/assignments" },
    { label: "Curriculum Suggestions", href: "/admin/suggestions" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Academics & Curriculum Hub"
        badgeText="Grade Tiers"
        description="Configure educational grade levels, student targeting brackets, and tutor/faculty instructional eligibility."
        tabs={academicTabs}
        actions={
          <Button
            size="sm"
            onClick={handleOpenModal}
            className="text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Grade Tier</span>
          </Button>
        }
      />

      {/* Search and Table View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search grade tiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-lg"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {processedGrades.length} of {grades.length} entries
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="w-10 px-3 py-3 text-center" title="Drag to reorder"></th>
                
                {/* Level Column Header (Sortable) */}
                <th
                  onClick={() => handleSort("level")}
                  className="w-24 px-4 py-3 cursor-pointer select-none hover:text-navy-950 group transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Level</span>
                    {renderSortIcon("level")}
                  </div>
                </th>

                {/* Name Column Header (Sortable) */}
                <th
                  onClick={() => handleSort("name")}
                  className="px-4 py-3 cursor-pointer select-none hover:text-navy-950 group transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Grade Tier Name</span>
                    {renderSortIcon("name")}
                  </div>
                </th>

                {/* Instructor Type Column Header (Sortable) */}
                <th
                  onClick={() => handleSort("instructor_type")}
                  className="px-4 py-3 cursor-pointer select-none hover:text-navy-950 group transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Instructor Type</span>
                    {renderSortIcon("instructor_type")}
                  </div>
                </th>

                <th className="w-20 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedGrades.map((grade) => {
                const actualIndex = grades.findIndex((g) => g.id === grade.id);
                const isDragging = draggedIndex === actualIndex;
                const isDragOver = dragOverIndex === actualIndex;

                return (
                  <tr
                    key={grade.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, actualIndex)}
                    onDragOver={(e) => handleDragOver(e, actualIndex)}
                    onDrop={(e) => handleDrop(e, actualIndex)}
                    onDragEnd={handleDragEnd}
                    className={`transition-colors select-none ${
                      isDragging ? "opacity-30 bg-teal-50" : "hover:bg-slate-50/80"
                    } ${isDragOver ? "border-t-2 border-indigo-500 bg-teal-50/30" : ""}`}
                  >
                    {/* Drag Handle */}
                    <td
                      className="px-3 py-3 text-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4 mx-auto" />
                    </td>

                    {/* Tier Level */}
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Tier {grade.level}
                      </span>
                    </td>

                    {/* Name & Description */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-xs text-navy-950">{grade.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{grade.description}</p>
                    </td>

                    {/* Instructor Type Tag */}
                    <td className="px-4 py-3">
                      {grade.instructor_type === "FACULTY" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">
                          <Building2 className="w-3 h-3 text-purple-600" />
                          Faculty
                        </span>
                      ) : grade.instructor_type === "BOTH" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                          Tutor &amp; Faculty
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-semibold">
                          <UserCheck className="w-3 h-3 text-teal-600" />
                          Tutor
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(grade.id)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                        title="Delete Grade Tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-navy-950">Add Academic Grade Tier</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tier Name</label>
                <Input
                  placeholder="e.g. Graduate / Professional"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              {/* Clean Instructor Classification Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Instructor Type (Select who can instruct this tier)
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
                    <span>Tutor</span>
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
                  placeholder="Curriculum scope and target student background"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs bg-teal-600 hover:bg-indigo-700 text-white font-medium">
                  Save Tier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
