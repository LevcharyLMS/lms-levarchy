"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";

interface SubjectItem {
  id: string;
  name: string;
  category: string;
  slug: string;
  description: string;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([
    { id: "sub-1", name: "AP Calculus BC", category: "Mathematics", slug: "ap-calculus-bc", description: "Advanced limits, differentiation, and integral calculus" },
    { id: "sub-2", name: "Linear Algebra", category: "Mathematics", slug: "linear-algebra", description: "Matrices, eigenvalues, vector transformations, and spaces" },
    { id: "sub-3", name: "Organic Chemistry", category: "Science", slug: "organic-chemistry", description: "Reaction mechanisms, stereochemistry, and laboratory synthesis" },
    { id: "sub-4", name: "Python & Algorithms", category: "Computer Science", slug: "python-algorithms", description: "Modern Python 3, binary search trees, and dynamic programming" },
    { id: "sub-5", name: "Physics: Mechanics", category: "Science", slug: "physics-mechanics", description: "Kinematics, Newtonian dynamics, and conservation laws" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mathematics");
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubjects([
      ...subjects,
      {
        id: `sub-${Date.now()}`,
        name: newName,
        category: newCategory,
        slug: newName.toLowerCase().replace(/\s+/g, "-"),
        description: newDescription,
      },
    ]);
    setNewName("");
    setNewDescription("");
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: "name",
      header: "Subject Title",
      sortable: true,
      render: (item: SubjectItem) => (
        <div>
          <p className="font-semibold text-xs text-navy-950">{item.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Academic Field",
      sortable: true,
      render: (item: SubjectItem) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {item.category}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item: SubjectItem) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSubjects(subjects.filter((s) => s.id !== item.id))}
            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy-950">
            Subject Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic subjects, syllabus domains, and teaching specializations.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs h-8 bg-primary hover:bg-primary/90 text-white gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subject</span>
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={subjects}
        columns={columns}
        searchPlaceholder="Search subjects by title or field..."
        searchKey="name"
        emptyTitle="No subjects configured"
        emptyDescription="Create academic subjects to categorize class offerings and tutor expertise."
      />

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-navy-950">Add Academic Subject</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject Name</label>
                <Input
                  placeholder="e.g. Molecular Biochemistry"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Parent Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white focus:ring-primary/20"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Languages">Languages</option>
                  <option value="Test Preparation">Test Preparation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Syllabus Overview</label>
                <Textarea
                  placeholder="Brief curriculum description..."
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
                <Button type="submit" size="sm" className="text-xs bg-primary hover:bg-primary/90 text-white">
                  Save Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
