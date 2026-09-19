"use client";

import React, { useState } from "react";
import { db } from "@/lib/data-store";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, Trash2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(db.state.reviews);
  const [notice, setNotice] = useState<string | null>(null);

  const togglePublish = (revId: string, currentPublished: boolean) => {
    const r = reviews.find((x) => x.id === revId);
    if (r) {
      r.is_published = !currentPublished;
      r.is_moderated = true;
      setReviews([...db.state.reviews]);
      setNotice(`Review ${revId} publication status updated to: ${r.is_published ? "Published" : "Unpublished"}`);
    }
  };

  return (
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
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                    Lucas Miller
                  </td>
                  <td className="p-4 text-slate-800">
                    Dr. Marcus Chen
                  </td>
                  <td className="p-4 max-w-sm text-slate-600 leading-relaxed">
                    &ldquo;{r.comment}&rdquo;
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
                      className="h-8 text-xs"
                      onClick={() => togglePublish(r.id, r.is_published)}
                    >
                      {r.is_published ? "Unpublish" : "Publish"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
