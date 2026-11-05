-- ============================================================
-- LEVCHARY LMS - MIGRATION 004: MONTHLY VISITOR TRACKING
-- Lightweight atomic table and function to track monthly unique visitors
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_monthly_visitors (
    year_month VARCHAR(7) PRIMARY KEY, -- format: 'YYYY-MM', e.g., '2026-11'
    visitor_count BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.site_monthly_visitors ENABLE ROW LEVEL SECURITY;

-- Allow public read of monthly visitor totals (for public stats)
DO $$ BEGIN
    CREATE POLICY "Allow public read on site_monthly_visitors"
    ON public.site_monthly_visitors
    FOR SELECT
    TO anon, authenticated
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Atomic RPC function to increment the visitor counter for the current month
CREATE OR REPLACE FUNCTION increment_monthly_visitor()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cur_month VARCHAR(7) := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    new_count BIGINT;
BEGIN
    INSERT INTO public.site_monthly_visitors (year_month, visitor_count, updated_at)
    VALUES (cur_month, 1, NOW())
    ON CONFLICT (year_month)
    DO UPDATE SET 
        visitor_count = site_monthly_visitors.visitor_count + 1,
        updated_at = NOW()
    RETURNING visitor_count INTO new_count;
    
    RETURN new_count;
END;
$$;
