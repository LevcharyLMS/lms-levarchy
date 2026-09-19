"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ClassCard } from "@/components/ui/class-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Search,
  Filter,
  BookOpen,
  X,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";

export default function ClassesPage() {
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/classes");
        const data = await res.json();
        setAllClasses(data.classes || []);
      } catch (err) {
        console.error("Failed to load classes:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredClasses = useMemo(() => {
    return allClasses.filter((c) => {
      if (selectedType !== "ALL" && c.class_type !== selectedType) return false;
      if (selectedFormat !== "ALL" && c.format !== selectedFormat) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (c.title || "").toLowerCase().includes(q);
        const matchesDesc = (c.description || "").toLowerCase().includes(q);
        const matchesSubject = (c.subject?.name || "").toLowerCase().includes(q);
        const matchesTutor = c.tutor
          ? `${c.tutor.first_name || ""} ${c.tutor.last_name || ""}`.toLowerCase().includes(q)
          : false;
        return matchesTitle || matchesDesc || matchesSubject || matchesTutor;
      }

      return true;
    });
  }, [allClasses, searchQuery, selectedType, selectedFormat]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950">
            Explore Classes & Group Cohorts
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-primary text-xs font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Sessions</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Browse 1-on-1 academic mentorship and collaborative group cohorts across virtual and physical learning centers.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search classes by title, subject, or instructor name..."
              className="pl-9 text-xs h-9 bg-slate-50 border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <select
              className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-primary"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Class Types</option>
              <option value="ONE_ON_ONE">1-on-1 Mentorship</option>
              <option value="GROUP">Group Cohort</option>
            </select>
          </div>

          <div>
            <select
              className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-primary"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="ALL">All Delivery Formats</option>
              <option value="VIRTUAL">Virtual (Google Meet)</option>
              <option value="PHYSICAL">In-Person (Approved Centers)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-navy-950">{filteredClasses.length}</strong> available classes
            </span>
            {(searchQuery || selectedType !== "ALL" || selectedFormat !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("ALL");
                  setSelectedFormat("ALL");
                }}
                className="text-primary hover:underline font-semibold ml-2"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md ${
                viewMode === "grid" ? "bg-white shadow-xs text-primary" : "text-slate-500"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md ${
                viewMode === "list" ? "bg-white shadow-xs text-primary" : "text-slate-500"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Classes Grid / List */}
      {filteredClasses.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredClasses.map((c) => (
            <ClassCard key={c.id} classItem={c} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No classes match your search"
          description="Try broadening your search query or removing class format filters."
          actionLabel="View All Classes"
          onAction={() => {
            setSearchQuery("");
            setSelectedType("ALL");
            setSelectedFormat("ALL");
          }}
        />
      )}
    </div>
  );
}
