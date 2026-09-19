"use client";

import React from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories?: FilterChip[];
  selectedCategory?: string;
  onCategorySelect?: (id: string) => void;
  formats?: { id: string; label: string }[];
  selectedFormat?: string;
  onFormatSelect?: (id: string) => void;
  onReset?: () => void;
  totalCount?: number;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = "Search by keyword...",
  searchValue,
  onSearchChange,
  categories = [],
  selectedCategory = "ALL",
  onCategorySelect,
  formats = [],
  selectedFormat = "ALL",
  onFormatSelect,
  onReset,
  totalCount,
  className = "",
}: FilterBarProps) {
  const hasActiveFilters =
    searchValue.trim() !== "" ||
    (selectedCategory && selectedCategory !== "ALL") ||
    (selectedFormat && selectedFormat !== "ALL");

  return (
    <div className={`space-y-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs ${className}`}>
      {/* Top Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs bg-slate-50/70 border-slate-200 focus:bg-white focus:ring-primary/20 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          {formats.length > 0 && onFormatSelect && (
            <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60">
              <button
                type="button"
                onClick={() => onFormatSelect("ALL")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  selectedFormat === "ALL"
                    ? "bg-white text-navy-950 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-navy-950"
                }`}
              >
                All Formats
              </button>
              {formats.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFormatSelect(f.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                    selectedFormat === f.id
                      ? "bg-white text-navy-950 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-navy-950"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {hasActiveFilters && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 px-2.5 text-xs text-slate-500 hover:text-red-600 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}

          {typeof totalCount === "number" && (
            <span className="text-xs text-slate-400 font-medium pl-2 hidden md:inline-block">
              {totalCount} {totalCount === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      {categories.length > 0 && onCategorySelect && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => onCategorySelect("ALL")}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedCategory === "ALL"
                ? "bg-primary text-white border-primary shadow-xs font-semibold"
                : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onCategorySelect(c.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                selectedCategory === c.id
                  ? "bg-primary text-white border-primary shadow-xs font-semibold"
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{c.label}</span>
              {typeof c.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === c.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {c.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
