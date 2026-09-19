"use client";

import React, { useState, useEffect } from "react";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle2, Star, AlertCircle, Award, Clock } from "lucide-react";

export default function StudentReviewsPage() {
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, reviewsRes] = await Promise.all([
        fetch("/api/bookings?studentId=usr-stu-1"),
        fetch("/api/reviews"),
      ]);
      const bookingsData = await bookingsRes.json();
      const reviewsData = await reviewsRes.json();

      const completed = (bookingsData.bookings || []).filter(
        (b: any) => b.status === "COMPLETED"
      );
      setCompletedBookings(completed);
      setReviews(reviewsData.reviews || []);

      if (completed.length > 0 && !selectedBookingId) {
        setSelectedBookingId(completed[0].id);
      }
    } catch (err) {
      console.error("Failed to load review data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const booking = completedBookings.find((b) => b.id === selectedBookingId);
    if (!booking) {
      setError("Please select a completed session to review.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          studentId: "usr-stu-1",
          tutorId: booking.tutor_id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setComment("");
        await loadData();
      } else {
        setError(data.error || "Failed to submit review.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold tracking-tight text-navy-950">
              Verified Ratings & Feedback
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-600" />
              <span>Verified Student Review</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ratings are only accepted from verified students who completed a scheduled class session.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! Your verified review has been published to the marketplace.</span>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="underline font-semibold text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Review Submission Form */}
      {completedBookings.length > 0 ? (
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-6">
            <h2 className="font-bold text-sm text-navy-950 mb-3">
              Write a Review for a Completed Class
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Completed Class Session
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-primary outline-hidden"
                  required
                >
                  {completedBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.class_item?.title || "Class Session"} • Tutor: {b.tutor?.first_name}{" "}
                      {b.tutor?.last_name} (#{b.booking_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Overall Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-navy-950 ml-2">
                    {hoverRating || rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Detailed Review
                </label>
                <Textarea
                  placeholder="Describe how the educator explained difficult concepts, session pacing, and whether you recommend them to other students..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-xs bg-slate-50 border-slate-200"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-9 px-5 text-xs bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                {submitting ? "Publishing..." : "Publish Verified Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Award}
          title="No completed sessions available to review yet"
          description="Once you finish a scheduled 1-on-1 tutoring session or group class cohort, you'll be able to leave verified feedback here."
          actionLabel="View My Bookings"
          actionHref="/student/bookings"
        />
      )}

      {/* Published Reviews Feed */}
      {reviews.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Recent Verified Student Reviews
          </h3>
          <div className="space-y-3">
            {reviews.map((r: any) => (
              <Card key={r.id} className="border-slate-200/80 shadow-xs bg-white">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-navy-950 text-xs">
                        Review for {r.tutor_first_name} {r.tutor_last_name}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Booking: #{r.booking_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                  <p className="text-[10px] text-slate-400">
                    Published on {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
