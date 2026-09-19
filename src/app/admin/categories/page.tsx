"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, BookOpen, Plus, CheckCircle2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(db.state.categories);
  const [subjects, setSubjects] = useState(db.state.subjects);
  const [newCatName, setNewCatName] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || "");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, "-"),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.state.categories.push(newCat);
    setCategories([...db.state.categories]);
    setNewCatName("");
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;

    const newSub = {
      id: `sub-${Date.now()}`,
      category_id: selectedCatId,
      name: newSubName,
      slug: newSubName.toLowerCase().replace(/\s+/g, "-"),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.state.subjects.push(newSub);
    setSubjects([...db.state.subjects]);
    setNewSubName("");
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-950">
          Academic Categories & Subject Disciplines
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Define marketplace taxonomy, academic disciplines, and subject filters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Column */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-600" /> Add Academic Category
              </h2>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <Input
                  placeholder="e.g. Social Sciences & Law"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="text-xs"
                  required
                />
                <Button type="submit" variant="default" size="sm">Add</Button>
              </form>
            </CardContent>
          </Card>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 divide-y divide-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 pb-2">Active Categories</h3>
            {categories.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-navy-950">{c.name}</span>
                <span className="text-[10px] font-mono text-slate-400">/{c.slug}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Column */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-700" /> Add Subject to Category
              </h2>
              <form onSubmit={handleAddSubject} className="space-y-3">
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Multivariable Calculus"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="text-xs"
                    required
                  />
                  <Button type="submit" variant="default" size="sm">Add</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 divide-y divide-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 pb-2">Subject Catalogue</h3>
            {subjects.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-navy-950">{s.name}</span>
                <span className="text-[10px] text-slate-500">
                  {categories.find((c) => c.id === s.category_id)?.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
