"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/context/auth-context";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";
import {
  Tag,
  BookOpen,
  Plus,
  CheckCircle2,
  RefreshCw,
  Search,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Layers,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const { user: currentAdmin } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);

      const taxRes = await fetch("/api/taxonomy");
      const taxData = await taxRes.json();
      setSubjects(taxData.subjects || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDescription("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || "");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      if (editingCategory) {
        const res = await fetch("/api/admin/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCategory.id,
            updates: { name: catName, description: catDescription },
            adminId: currentAdmin?.id,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update category");
        }
        setNotice(`Discipline "${catName}" updated successfully.`);
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: catName,
            description: catDescription,
            adminId: currentAdmin?.id,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create category");
        }
        setNotice(`Academic discipline "${catName}" created.`);
      }

      setIsModalOpen(false);
      await loadData();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: any) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cat.id,
          updates: { is_active: !cat.is_active },
          adminId: currentAdmin?.id,
        }),
      });

      if (res.ok) {
        setNotice(`"${cat.name}" marked as ${!cat.is_active ? "Active" : "Archived"}.`);
        await loadData();
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (err) {
      console.error("Failed to toggle category active:", err);
    }
  };

  const handleDelete = async (cat: any) => {
    if (!confirm(`Are you sure you want to delete "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}&adminId=${currentAdmin?.id || "usr-admin-1"}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete category");
        return;
      }

      setNotice(`Category "${cat.name}" deleted.`);
      await loadData();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert("Error deleting category: " + err.message);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
  });

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
        title="Academics Hub"
        badgeText="Educational Disciplines"
        description="Oversee top-level academic disciplines, track active subjects, and maintain authoritative curriculum domains."
        tabs={academicTabs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="h-8 text-xs border-slate-200 gap-1.5"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs border-slate-200 gap-1.5 text-teal-700 hover:bg-teal-50">
              <Link href="/admin/reports">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Taxonomy CSV in Reports</span>
              </Link>
            </Button>
            <Button
              onClick={openCreateModal}
              size="sm"
              className="text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-2xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Discipline</span>
            </Button>
          </div>
        }
      />

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="underline font-semibold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search disciplines or domain descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-navy-950 font-medium"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-slate-700">{filteredCategories.length}</strong> academic disciplines
        </div>
      </div>

      {/* Disciplines Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
          Loading academic disciplines...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">No academic disciplines found</p>
          <p className="text-xs text-slate-400 mt-1">
            Click &quot;Add Discipline&quot; above to introduce new subjects and courses to the platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => {
            const childCount = subjects.filter((s) => s.category_id === cat.id).length;
            const isActive = cat.is_active !== false;

            return (
              <Card
                key={cat.id}
                className="border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all group"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isActive ? "Active Discipline" : "Archived"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-navy-950 group-hover:text-teal-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {cat.description || "Core foundational discipline supporting active student and tutor classes."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      <span><strong>{childCount}</strong> Subjects Attached</span>
                    </span>
                    <Link
                      href="/admin/subjects"
                      className="text-[11px] font-semibold text-teal-700 hover:underline"
                    >
                      View Subjects →
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(cat)}
                      className={`h-7 px-2.5 text-xs font-medium ${
                        isActive
                          ? "text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                          : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {isActive ? "Archive" : "Activate"}
                    </Button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        title="Edit Discipline"
                        className="p-1.5 text-slate-400 hover:text-navy-950 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        title="Delete Discipline"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-navy-950">
                {editingCategory ? "Edit Discipline" : "New Academic Discipline"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discipline Name *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Engineering & Technology"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="text-xs h-8.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domain Description
                </label>
                <Textarea
                  rows={3}
                  placeholder="Summary of disciplines, prerequisite topics, and instructional focus..."
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Create Discipline"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
