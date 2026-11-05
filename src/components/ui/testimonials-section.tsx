"use client";

import React, { useState, useEffect } from "react";
import { RatingStars } from "@/components/ui/rating-stars";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Quote, CheckCircle2, Award, ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialReview {
  id: string;
  rating: number;
  comment?: string;
  student_first_name?: string;
  student_last_name?: string;
  student_avatar_url?: string;
  tutor_first_name?: string;
  tutor_last_name?: string;
  created_at: string;
}

export function TestimonialsSection({ reviews }: { reviews: TestimonialReview[] }) {
  // Guard condition: If no reviews are approved & featured, DO NOT render the section
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive items per page: 1 on mobile, 2 on tablet, 3 on desktop
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  // Ensure current index is within bounds on resize
  useEffect(() => {
    if (currentIndex >= totalPages && totalPages > 0) {
      setCurrentIndex(totalPages - 1);
    }
  }, [totalPages, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // Slice reviews for current active page
  const visibleReviews = reviews.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200/80 relative overflow-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Carousel Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5 text-teal-600" />
              <span>Verified Student Success Stories</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950">
              Trusted by Dedicated Learners
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 leading-relaxed">
              Authentic evaluations from students and parents following verified class completion.
            </p>
          </div>

          {/* Carousel Arrows (Displayed only when more items than view capacity exist) */}
          {reviews.length > itemsPerPage && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="w-10 h-10 p-0 rounded-full border-slate-200 hover:bg-slate-100 hover:text-navy-950 transition-colors"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="w-10 h-10 p-0 rounded-full border-slate-200 hover:bg-slate-100 hover:text-navy-950 transition-colors"
                aria-label="Next testimonials"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Carousel Slide Cards Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto min-h-[260px]">
          {visibleReviews.map((rev) => {
            const studentName = `${rev.student_first_name || "Student"} ${rev.student_last_name || ""}`.trim();
            const instructorName = `${rev.tutor_first_name || "Instructor"} ${rev.tutor_last_name || ""}`.trim();

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group hover:-translate-y-0.5 animate-fadeIn"
              >
                {/* Decorative Quote Watermark */}
                <Quote className="absolute top-5 right-5 w-8 h-8 text-slate-100 group-hover:text-teal-100/70 transition-colors pointer-events-none" />

                <div className="space-y-3 relative z-10">
                  {/* Stars & Verified Badge */}
                  <div className="flex items-center justify-between">
                    <RatingStars rating={rev.rating} size="sm" />
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      Verified Booking
                    </span>
                  </div>

                  {/* Comment Quote */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Student Info & Instructor Attribution */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-9 h-9 border border-slate-200 shadow-xs">
                      <AvatarImage src={rev.student_avatar_url || ""} />
                      <AvatarFallback className="bg-navy-950 text-white font-bold text-xs">
                        {rev.student_first_name?.[0] || "S"}
                        {rev.student_last_name?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xs font-bold text-navy-950 leading-tight">
                        {studentName}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Taught by <span className="font-semibold text-slate-600">{instructorName}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                    {new Date(rev.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-7 bg-teal-600" : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to testimonial page ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
