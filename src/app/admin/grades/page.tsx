"use client";

import React, { useState } from "react";
import { GraduationCap, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";

interface GradeItem {
  id: string;
  name: string;
  level: number;
  description: string;
}

export default function AdminGradesPage() {
  const [grades, setGrades] = useState<GradeItem[]>([
    { id: "grd-1", name: "Middle School (Grades 6-8)", level: 1, description: "Foundational core subjects and early preparatory coursework" },
    { id: "grd-2", name: "High School (Grades 9-10)", level: 2, description: "Secondary school honors courses and foundational exam strategies" },
    { id: "grd-3", name: "High School (Grades 11-12)", level: 3, description: "Advanced Placement (AP), IB, standardized testing, and college prep" },
    { id: "grd-4", name: "Undergraduate / College", level: 4, description: "University-level STEM, pre-med, computer science, and engineering" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState(5);
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setGrades([
      ...grades,
      {
        id: `grd-${Date.now()}`,
        name: newName,
        level: Number(newLevel),
        description: newDescription,
      },
    ]);
    setNewName("");
    setNewDescription("");
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: "level",
      header: "Level",
      sortable: true,
      render: (item: GradeItem) => (
        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          Tier {item.level}
        </span>
      ),
    },
    {
      key: "name",
      header: "Grade Tier Name",
      sortable: true,
      render: (item: GradeItem) => (
        <div>
          <p className="font-semibold text-xs text-navy-950">{item.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item: GradeItem) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGrades(grades.filter((g) => g.id !== item.id))}
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
            Academic Grade Tiers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure educational grade levels, student targeting brackets, and difficulty tiers.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs h-8 bg-primary hover:bg-primary/90 text-white gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Grade Tier</span>
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={grades}
        columns={columns}
        searchPlaceholder="Search grade tiers..."
        searchKey="name"
        emptyTitle="No grade tiers configured"
        emptyDescription="Create your first academic level bracket to associate with tutors and classes."
      />

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-navy-950">Add Academic Grade Tier</h3>
            <form onSubmit={handleCreate} className="space-y-3">
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Level Rank (Number)</label>
                <Input
                  type="number"
                  value={newLevel}
                  onChange={(e) => setNewLevel(Number(e.target.value))}
                  className="h-9 text-xs"
                  required
                />
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
                <Button type="submit" size="sm" className="text-xs bg-primary hover:bg-primary/90 text-white">
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
