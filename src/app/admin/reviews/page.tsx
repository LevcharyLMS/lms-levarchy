"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, AlertCircle, Home, RefreshCw } from "lucide-react";
import { PageTransition, FadeIn } from "@/components/animations";
import { DataFilterToolbar, SortOption, FilterTabOption } from "@/components/shared/data-filter-toolbar";
import { AdminHubHeader } from "@/components/admin/admin-hub-header";

interface ReviewItem {
  id: string;
  booking_id: string;
  student_id: string;
  tutor_id: string;
  student_first_name?: string;
  student_last_name?: string;
  tutor_first_name?: string;
  tutor_last_name?: string;
  rating: number;
  comment?: string;
  is_published: boolean;
  is_moderated: boolean;
  is_featured_testimonial?: boolean;
  created_at: string;
}

const SORT_OPTIONS: SortOption[] = [
  { id: "RATING_DESC", label: "Highest to Lowest Rating" },
  { id: "RATING_ASC", label: "Lowest to Highest Rating" },
  { id: "DATE_DESC", label: "Newest First" },
  { id: "DATE_ASC", label: "Oldest First" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Filter toolbar states
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("RATING_DESC");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reviews?admin=true");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // One-click toggle publish status
  const togglePublish = async (revId: string, currentPublished: boolean) => {
    const nextPublished = !currentPublished;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === revId
          ? {
              ...r,
              is_published: nextPublished,
              // If hiding from public, also remove from homepage
              is_featured_testimonial: nextPublished ? r.is_featured_testimonial : false,
              is_moderated: true,
            }
          : r
      )
    );

    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: revId,
          is_published: nextPublished,
          is_featured_testimonial: nextPublished ? undefined : false,
          is_moderated: true,
        }),
      });
      setNotice(
        `Review publication updated: ${nextPublished ? "Approved & Published" : "Hidden from Public"}`
      );
    } catch {
      loadReviews();
    }
  };

  // Modern toggle switch for Homepage Testimonial
  const toggleHomepageFeatured = async (revId: string, currentFeatured: boolean, isPublished: boolean) => {
    const nextFeatured = !currentFeatured;

    // Must be published to be featured
    if (nextFeatured && !isPublished) {
      setNotice("Review must be published before featuring on the homepage.");
      return;
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === revId ? { ...r, is_featured_testimonial: nextFeatured, is_moderated: true } : r
      )
    );

    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: revId,
          is_featured_testimonial: nextFeatured,
          is_moderated: true,
        }),
      });
      setNotice(
        nextFeatured
          ? "Pinned to Homepage Testimonials Section!"
          : "Removed from Homepage Testimonials Section."
      );
    } catch {
      loadReviews();
    }
  };

  // Filter & sort logic
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.comment || "").toLowerCase().includes(q) ||
          (r.student_first_name || "").toLowerCase().includes(q) ||
          (r.student_last_name || "").toLowerCase().includes(q) ||
          (r.tutor_first_name || "").toLowerCase().includes(q) ||
          (r.tutor_last_name || "").toLowerCase().includes(q)
      );
    }

    // Tab filter
    if (selectedTab === "FEATURED") {
      list = list.filter((r) => r.is_featured_testimonial);
    } else if (selectedTab === "PUBLISHED") {
      list = list.filter((r) => r.is_published);
    } else if (selectedTab === "PENDING" || selectedTab === "HIDDEN") {
      list = list.filter((r) => !r.is_published);
    } else if (selectedTab === "FIVE_STARS") {
      list = list.filter((r) => r.rating === 5);
    }

    // Sorting (Highest to Lowest Rating as Default)
    list.sort((a, b) => {
      if (selectedSort === "RATING_DESC") {
        return b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (selectedSort === "RATING_ASC") {
        return a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (selectedSort === "DATE_DESC") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (selectedSort === "DATE_ASC") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return 0;
    });

    return list;
  }, [reviews, search, selectedTab, selectedSort]);

  // Tab counts
  const tabOptions: FilterTabOption[] = [
    { id: "ALL", label: "All Reviews", count: reviews.length },
    {
      id: "PENDING",
      label: "Pending Approval",
      count: reviews.filter((r) => !r.is_published).length,
    },
    {
      id: "PUBLISHED",
      label: "Approved & Live",
      count: reviews.filter((r) => r.is_published).length,
    },
    {
      id: "FEATURED",
      label: "Homepage Testimonials",
      count: reviews.filter((r) => r.is_featured_testimonial).length,
    },
    {
      id: "FIVE_STARS",
      label: "5 Stars",
      count: reviews.filter((r) => r.rating === 5).length,
    },
  ];

  const moderationTabs = [
    { label: "Safety Flags", href: "/admin/flags" },
    {
      label: "Review Approvals",
      href: "/admin/reviews",
      badge: reviews.filter((r) => !r.is_published).length || undefined,
    },
    { label: "Class Reports", href: "/admin/reports" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <AdminHubHeader
          title="Moderation & Support Hub"
          badgeText="Student Reviews"
          description="Audit student feedback, rank by rating, approve comments, and toggle reviews to feature on the homepage."
          tabs={moderationTabs}
          actions={
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold">
                <Home className="w-4 h-4 text-teal-600" />
                <span>
                  {reviews.filter((r) => r.is_featured_testimonial).length} Featured
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadReviews}
                disabled={loading}
                className="h-8 text-xs border-slate-200 gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>
          }
        />

        {notice && (
          <FadeIn>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{notice}</span>
              </div>
              <button onClick={() => setNotice(null)} className="underline font-semibold ml-4">
                Dismiss
              </button>
            </div>
          </FadeIn>
        )}

        {/* Reusable Filter & Sorting Toolbar */}
        <DataFilterToolbar
          searchPlaceholder="Search reviews by student, instructor, or keywords..."
          searchValue={search}
          onSearchChange={setSearch}
          tabs={tabOptions}
          selectedTab={selectedTab}
          onTabSelect={setSelectedTab}
          sortOptions={SORT_OPTIONS}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          hasActiveFilters={search !== "" || selectedTab !== "ALL" || selectedSort !== "RATING_DESC"}
          onReset={() => {
            setSearch("");
            setSelectedTab("ALL");
            setSelectedSort("RATING_DESC");
          }}
          totalCount={filteredReviews.length}
        />

        {/* Table of Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {!loading && filteredReviews.length === 0 ? (
            <FadeIn>
              <div className="p-16 text-center">
                <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-sm text-navy-950">No reviews found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Try adjusting your search query, tab selection, or rating filter.
                </p>
              </div>
            </FadeIn>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Rating & Date</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Student Review Comment</th>
                    <th className="p-4 text-center">Featured on Homepage</th>
                    <th className="p-4 text-right">Moderation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredReviews.map((r) => {
                    const isFeatured = !!r.is_featured_testimonial;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 whitespace-nowrap">
                          <RatingStars rating={r.rating} />
                          <span className="text-[11px] font-medium text-slate-400 block mt-1">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-navy-950 whitespace-nowrap">
                          {r.student_first_name
                            ? `${r.student_first_name} ${r.student_last_name || ""}`
                            : r.student_id}
                        </td>
                        <td className="p-4 text-slate-800 whitespace-nowrap">
                          {r.tutor_first_name
                            ? `${r.tutor_first_name} ${r.tutor_last_name || ""}`
                            : r.tutor_id}
                        </td>
                        <td className="p-4 max-w-md text-slate-600 leading-relaxed">
                          &ldquo;{r.comment || "No written comment provided"}&rdquo;
                        </td>

                        {/* Modern Toggle Switch for Homepage Testimonial */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isFeatured}
                              onClick={() => toggleHomepageFeatured(r.id, isFeatured, r.is_published)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                                isFeatured ? "bg-teal-600" : "bg-slate-300 hover:bg-slate-400"
                              }`}
                              title={
                                isFeatured
                                  ? "Active on Homepage Testimonials. Click to remove."
                                  : "Click to feature this review on the Homepage."
                              }
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  isFeatured ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isFeatured ? "text-teal-700 font-extrabold" : "text-slate-400"
                              }`}
                            >
                              {isFeatured ? "Live" : "Off"}
                            </span>
                          </div>
                        </td>

                        {/* Publish / Hide Moderation Button */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.is_published
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {r.is_published ? "PUBLISHED" : "HIDDEN"}
                            </span>
                            <Button
                              variant={r.is_published ? "outline" : "default"}
                              size="sm"
                              onClick={() => togglePublish(r.id, r.is_published)}
                              className="h-8 text-xs"
                            >
                              {r.is_published ? "Hide" : "Approve"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
