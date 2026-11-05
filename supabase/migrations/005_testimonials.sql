-- ============================================================
-- LEVCHARY LMS - MIGRATION 005: FEATURED TESTIMONIALS
-- Adds admin-curated homepage testimonial flag to reviews
-- ============================================================

ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS is_featured_testimonial BOOLEAN NOT NULL DEFAULT FALSE;

-- Composite index for fast public homepage retrieval (sorted highest to lowest rating)
CREATE INDEX IF NOT EXISTS idx_reviews_featured_ranking 
ON public.reviews(is_featured_testimonial, is_published, rating DESC, created_at DESC);
