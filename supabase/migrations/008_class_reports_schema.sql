-- ============================================================
-- LEVCHARY LMS - CLASS REPORTS & ADMIN MODERATION SCHEMA
-- Migration: 008_class_reports_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.class_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    format VARCHAR(20) NOT NULL DEFAULT 'VIRTUAL' CHECK (format IN ('VIRTUAL', 'PHYSICAL')),
    class_type VARCHAR(20) NOT NULL DEFAULT 'ONE_ON_ONE' CHECK (class_type IN ('ONE_ON_ONE', 'GROUP')),
    session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location_id UUID REFERENCES public.class_locations(id) ON DELETE SET NULL,
    topics_covered TEXT NOT NULL,
    homework_assigned TEXT,
    instructor_private_notes TEXT,
    text_class_comments TEXT NOT NULL,
    attendance_records JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_ADMIN_REVIEW' CHECK (status IN ('DRAFT', 'PENDING_ADMIN_REVIEW', 'APPROVED', 'PUBLISHED', 'CHANGES_REQUESTED')),
    admin_reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_class_reports_class_status ON public.class_reports (class_id, status);
CREATE INDEX IF NOT EXISTS idx_class_reports_instructor ON public.class_reports (instructor_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_class_reports_status ON public.class_reports (status);

-- Automatic updated_at trigger function if not already present
CREATE OR REPLACE FUNCTION update_class_report_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_class_reports_timestamp ON public.class_reports;
CREATE TRIGGER trg_class_reports_timestamp
BEFORE UPDATE ON public.class_reports
FOR EACH ROW
EXECUTE FUNCTION update_class_report_timestamp();
