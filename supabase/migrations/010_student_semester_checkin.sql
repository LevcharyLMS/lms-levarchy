-- ============================================================
-- LEVCHARY LMS: SEMESTER PROFILE CHECK-IN (6-MONTH MANDATORY UPDATE)
-- ============================================================

ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS profile_last_verified_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill existing students with their creation date so check-in is calculated accurately
UPDATE public.student_profiles
SET profile_last_verified_at = COALESCE(created_at, NOW())
WHERE profile_last_verified_at IS NULL;
