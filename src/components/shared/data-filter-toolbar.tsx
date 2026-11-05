"use client";

import React from "react";
import { Search, RotateCcw, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SortOption {
  id: string;
  label: string;
}

export interface FilterTabOption {
  id: string;
  label: string;
  count?: number;
}

interface DataFilterToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  
  // Tabs (e.g., All, Featured, 5 Stars, etc.)
  tabs?: FilterTabOption[];
  selectedTab?: string;
  onTabSelect?: (id: string) => void;

  // Sorting
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (id: string) => void;

  // Reset
  onReset?: () => void;
  hasActiveFilters?: boolean;
  totalCount?: number;
  className?: string;
}

export function DataFilterToolbar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  tabs = [],
  selectedTab,
  onTabSelect,
  sortOptions = [],
  selectedSort,
  onSortChange,
  onReset,
  hasActiveFilters,
  totalCount,
  className = "",
}: DataFilterToolbarProps) {
  return (
    <div className={`space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs ${className}`}>
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 h-10 text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2.5">
          {sortOptions.length > 0 && onSortChange && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-navy-950 focus:outline-none cursor-pointer pr-1"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-10 text-xs text-slate-600 gap-1.5 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          )}

          {totalCount !== undefined && (
            <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-lg">
              {totalCount} {totalCount === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs Row */}
      {tabs.length > 0 && onTabSelect && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabSelect(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-navy-950 text-white shadow-xs"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
