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
} from "lucide-react";

export default function FindTutorsPage() {
  const [allTutors, setAllTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [maxRate, setMaxRate] = useState<number>(10000); // in cents ($100)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/tutors");
        const data = await res.json();
        setAllTutors(data.tutors || []);
      } catch (err) {
        console.error("Failed to load tutors:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTutors = useMemo(() => {
    return allTutors.filter((t) => {
      const user = t.user;
      if (!user) return false;

      // Format filter
      if (selectedFormat !== "ALL") {
        if (selectedFormat === "VIRTUAL" && t.preferred_format === "PHYSICAL") return false;
        if (selectedFormat === "PHYSICAL" && t.preferred_format === "VIRTUAL") return false;
      }

      // Max rate filter
      if (t.hourly_rate > maxRate) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${user.first_name} ${user.last_name}`.toLowerCase().includes(q);
        const matchesBio = (t.bio || "").toLowerCase().includes(q);
        const matchesHeadline = (t.headline || "").toLowerCase().includes(q);
        const matchesQuals = (t.qualifications || "").toLowerCase().includes(q);
        const matchesCity = (user.city || "").toLowerCase().includes(q);
        return matchesName || matchesBio || matchesHeadline || matchesQuals || matchesCity;
      }

      return true;
    });
  }, [allTutors, searchQuery, selectedFormat, maxRate]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-950">
            Find Verified Faculty & Mentors
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-primary text-xs font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vetted Instructors</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Connect with university professors, certified specialists, and experienced academic mentors for 1-on-1 tutoring.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Search by subject, educator name, university, or city..."
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

          {/* Delivery Format Filter */}
          <div>
            <select
              className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-primary"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="ALL">All Teaching Formats</option>
              <option value="VIRTUAL">Virtual (Google Meet)</option>
              <option value="PHYSICAL">In-Person (Approved Centers)</option>
            </select>
          </div>

          {/* Max Hourly Rate Filter */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">
              Max: ${(maxRate / 100).toFixed(0)}/hr
            </span>
            <input
              type="range"
              min="3000"
              max="12000"
              step="500"
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Filter Chips & View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-navy-950">{filteredTutors.length}</strong> verified educators
            </span>
            {(searchQuery || selectedFormat !== "ALL" || maxRate < 10000) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFormat("ALL");
                  setMaxRate(10000);
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

      {/* Tutors Grid / List */}
      {filteredTutors.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredTutors.map((t) => (
            <TutorCard key={t.user_id} tutor={t} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No verified tutors match your search"
          description="Try broadening your search keywords, adjusting maximum hourly rate, or removing format filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedFormat("ALL");
            setMaxRate(10000);
          }}
        />
      )}
    </div>
  );
}
