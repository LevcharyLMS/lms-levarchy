"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, Plus, Trash2, RefreshCw, FileSpreadsheet, Search, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

interface SubjectItem {
  id: string;
  name: string;
  category: string;
  category_id?: string;
  slug: string;
  description: string;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch both subjects and categories concurrently
      const [subjectsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/subjects"),
        fetch("/api/admin/categories"),
      ]);

      let cats: { id: string; name: string }[] = [];
      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        cats = (catData.categories || []).map((c: any) => ({ id: c.id, name: c.name }));
        setCategories(cats);
        if (cats.length > 0 && !newCategoryId) {
          setNewCategoryId(cats[0].id);
        }
      }

      if (subjectsRes.ok) {
        const subData = await subjectsRes.json();
        setSubjects(subData.subjects || []);
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCategoryId) return;

    try {
      setSaving(true);
      setModalError(null);
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          category_id: newCategoryId,
          description: newDescription.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create subject");
      }

      setNewName("");
      setNewDescription("");
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/subjects?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadData();
      } else {
        alert("Could not delete subject. It may be referenced by existing classes.");
      }
    } catch (err) {
      console.error("Failed to delete subject:", err);
      alert("Error deleting subject");
    }
  };

  const filteredSubjects = useMemo(() => {
    if (selectedCategoryFilter === "ALL") return subjects;
    return subjects.filter((s) => s.category === selectedCategoryFilter || s.category_id === selectedCategoryFilter);
  }, [subjects, selectedCategoryFilter]);

  const academicTabs = [
    { label: "Categories", href: "/admin/categories" },
    { label: "Subjects", href: "/admin/subjects" },
    { label: "Grades", href: "/admin/grades" },
    { label: "Assignment Oversight", href: "/admin/assignments" },
    { label: "Curriculum Suggestions", href: "/admin/suggestions" },
    { label: "Post-Class Reports", href: "/admin/post-class-reports" },
  ];

  const columns = [
    {
      key: "name",
      header: "Subject Title",
      sortable: true,
      render: (item: SubjectItem) => (
        <div>
          <p className="font-semibold text-xs text-navy-950">{item.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Academic Discipline",
      sortable: true,
      render: (item: SubjectItem) => (
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100/60">
          {item.category}
        </span>
      ),
    },
    {
      key: "slug",
      header: "System Slug",
      render: (item: SubjectItem) => (
        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
          {item.slug}
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
            onClick={() => handleDelete(item.id, item.name)}
            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Delete subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminHubHeader
        title="Academics & Curriculum Hub"
        badgeText="Subject Catalog"
        description="Authoritative registry of academic subjects, syllabus domains, and teaching specializations across all departments."
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
              <span>Add Subject</span>
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Discipline:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Disciplines ({subjects.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-400 self-end sm:self-center">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredSubjects}
        columns={columns}
        searchPlaceholder="Search subjects by title or syllabus..."
        searchKey="name"
        emptyTitle="No subjects configured"
        emptyDescription="Create academic subjects to categorize class offerings and tutor expertise."
      />

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div>
              <h3 className="text-sm font-bold text-navy-950">Add Academic Subject</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define a new course curriculum subject under an approved discipline.</p>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject Name *</label>
                <Input
                  placeholder="e.g. Molecular Biochemistry"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Parent Discipline *</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-medium"
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No categories available</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Syllabus Overview</label>
                <Textarea
                  placeholder="Brief curriculum description, topics covered, and mastery expectations..."
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
                  disabled={saving || !newName.trim() || !newCategoryId}
                  className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs"
                >
                  {saving ? "Saving..." : "Save Subject"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
