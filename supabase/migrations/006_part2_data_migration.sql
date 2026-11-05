-- ============================================================
-- LEVCHARY LMS - MIGRATION 006 (PART 2 of 2): DATA MIGRATION & INDEXING
-- Run this AFTER 006_part1_schema_refactor.sql has finished successfully!
-- ============================================================

-- 1. MIGRATE EXISTING PROFILES FROM 'TUTOR' TO 'INSTRUCTOR'
UPDATE public.profiles 
SET role = 'INSTRUCTOR' 
WHERE role = 'TUTOR';

-- 2. CREATE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_approved 
ON public.instructor_profiles(is_approved);

CREATE INDEX IF NOT EXISTS idx_instructor_profiles_type 
ON public.instructor_profiles(instructor_type);

CREATE INDEX IF NOT EXISTS idx_classes_instructor 
ON public.classes(instructor_id);

CREATE INDEX IF NOT EXISTS idx_bookings_instructor 
ON public.bookings(instructor_id);
