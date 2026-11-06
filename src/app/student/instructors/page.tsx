"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TutorCard } from "@/components/ui/tutor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Search,
  Filter,
  GraduationCap,
  Video,
  MapPin,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Users,
  Loader2,
} from "lucide-react";

export default function StudentTutorsPage() {
  const [allTutors, setAllTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [instructorType, setInstructorType] = useState<"ALL" | "TUTOR" | "FACULTY">("ALL");
  const [maxRate, setMaxRate] = useState<number>(15000); // in cents ($150)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/tutors");
        if (!res.ok) throw new Error("Failed to load instructors");
        const data = await res.json();
        if (isMounted) {
          setAllTutors(data.instructors || data.tutors || []);
        }
      } catch (err) {
        console.error("Failed to load instructors:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTutors = useMemo(() => {
    return allTutors.filter((t) => {
      const user = t?.user;

      // Instructor subtype filter
      const isFaculty = t.instructor_type === "FACULTY" || (!t.instructor_type && t.experience_years && t.experience_years >= 4);
      if (instructorType === "FACULTY" && !isFaculty) return false;
      if (instructorType === "TUTOR" && isFaculty) return false;

      // Format filter
      if (selectedFormat !== "ALL") {
        if (selectedFormat === "VIRTUAL" && t.preferred_format === "PHYSICAL") return false;
        if (selectedFormat === "PHYSICAL" && t.preferred_format === "VIRTUAL") return false;
      }

      // Max rate filter
      if (t.hourly_rate && t.hourly_rate > maxRate) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${user?.first_name || ""} ${user?.last_name || ""}`.toLowerCase().includes(q);
        const matchesBio = (t.bio || "").toLowerCase().includes(q);
        const matchesHeadline = (t.headline || "").toLowerCase().includes(q);
        const matchesQuals = (t.qualifications || "").toLowerCase().includes(q);
        const matchesCity = (user?.city || "").toLowerCase().includes(q);
        return matchesName || matchesBio || matchesHeadline || matchesQuals || matchesCity;
      }

      return true;
    });
  }, [allTutors, searchQuery, selectedFormat, instructorType, maxRate]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Verified Instructors
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse verified university faculty, certified educators, and experienced mentors for 1-on-1 sessions.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
              viewMode === "grid" ? "bg-white text-navy-950 shadow-xs font-semibold" : "text-slate-500 hover:text-navy-950"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
              viewMode === "list" ? "bg-white text-navy-950 shadow-xs font-semibold" : "text-slate-500 hover:text-navy-950"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              placeholder="Search by educator name, subject, qualification, or city..."
              className="pl-9 text-xs h-9 bg-slate-50/70 border-slate-200"
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

          {/* Delivery Format Filter */}
          <div className="relative">
            <select
              aria-label="Delivery format"
              className="w-full h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="ALL">All Delivery Formats</option>
              <option value="VIRTUAL">Virtual / Online Classroom</option>
              <option value="PHYSICAL">Physical / In-Person</option>
              <option value="HYBRID">Hybrid (Both)</option>
            </select>
          </div>

          {/* Instructor Type Filter */}
          <div className="relative">
            <select
              aria-label="Instructor type"
              className="w-full h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
              value={instructorType}
              onChange={(e) => setInstructorType(e.target.value as any)}
            >
              <option value="ALL">All Instructors</option>
              <option value="TUTOR">Tutors</option>
              <option value="FACULTY">Faculty</option>
            </select>
          </div>

          {/* Rate Filter */}
          <div className="flex items-center gap-2 px-3 h-9 bg-slate-50/70 border border-slate-200 rounded-md">
            <span className="text-[11px] text-slate-500 whitespace-nowrap">Max:</span>
            <input
              type="range"
              min="2000"
              max="15000"
              step="500"
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-semibold text-navy-950 whitespace-nowrap">
              ${(maxRate / 100).toFixed(0)}/hr
            </span>
          </div>
        </div>

        {/* Results Count Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Active catalog</span>
          <span className="font-semibold text-navy-950">
            Showing {filteredTutors.length} verified {filteredTutors.length === 1 ? "instructor" : "instructors"}
          </span>
        </div>
      </div>

      {/* Tutor Cards Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading verified instructors...</p>
        </div>
      ) : filteredTutors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No instructors match your filters"
          description={
            searchQuery || selectedFormat !== "ALL"
              ? "Try resetting your search query or broadening the delivery format / hourly rate filters."
              : "Verified instructors will appear here once approved by our academic verification committee."
          }
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {filteredTutors.map((t) => (
            <TutorCard key={t.user_id || t.id} tutor={t} />
          ))}
        </div>
      )}
    </div>
  );
}
