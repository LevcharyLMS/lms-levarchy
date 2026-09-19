"use client";

import React, { useState, useEffect } from "react";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { PageTransition, FadeIn } from "@/components/animations";

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
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
      })
      .catch((err) => console.error("Error loading reviews:", err))
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = (revId: string, currentPublished: boolean) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === revId ? { ...r, is_published: !currentPublished, is_moderated: true } : r
      )
    );
    setNotice(`Review ${revId} publication status updated to: ${!currentPublished ? "Published" : "Hidden"}`);
  };

  return (
    <PageTransition>
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            Review Moderation & Feedback
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit student evaluations, moderate comments, and maintain instructional feedback integrity.
          </p>
        </div>

        {notice && (
          <FadeIn>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{notice}</span>
              </div>
              <button onClick={() => setNotice(null)} className="underline font-semibold">
                Dismiss
              </button>
            </div>
          </FadeIn>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {!loading && reviews.length === 0 ? (
            <FadeIn>
              <div className="p-16 text-center">
                <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-sm text-navy-950">No reviews submitted yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  When students complete classes and submit instructor ratings and feedback, they will appear here for moderation.
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
                    <th className="p-4">Tutor</th>
                    <th className="p-4">Student Review Comment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <RatingStars rating={r.rating} />
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-navy-950">
                        {r.student_first_name ? `${r.student_first_name} ${r.student_last_name || ""}` : r.student_id}
                      </td>
                      <td className="p-4 text-slate-800">
                        {r.tutor_first_name ? `${r.tutor_first_name} ${r.tutor_last_name || ""}` : r.tutor_id}
                      </td>
                      <td className="p-4 max-w-sm text-slate-600 leading-relaxed">
                        &ldquo;{r.comment || "No written comment provided"}&rdquo;
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.is_published
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {r.is_published ? "PUBLISHED" : "HIDDEN"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={r.is_published ? "outline" : "default"}
                          size="sm"
                          onClick={() => togglePublish(r.id, r.is_published)}
                          className="h-8 text-xs"
                        >
                          {r.is_published ? "Hide from Public" : "Approve & Publish"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
