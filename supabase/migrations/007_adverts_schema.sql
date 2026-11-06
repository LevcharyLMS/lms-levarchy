-- ============================================================
-- LEVCHARY LMS - ADVERT SHOWCASE & TIMER EXPIRY SCHEMA
-- Migration: 007_adverts_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.adverts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_type VARCHAR(20) NOT NULL DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    target_url TEXT,
    downloadable BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ, -- If NULL, never expires. If set, expires automatically when NOW() > end_date
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    download_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for real-time active non-expired advertisements query
CREATE INDEX IF NOT EXISTS idx_adverts_active_schedule 
ON public.adverts (is_active, start_date, end_date);

-- Function to record advert views atomically
CREATE OR REPLACE FUNCTION increment_advert_view(p_advert_id UUID)
RETURNS INT AS $$
DECLARE
    v_views INT;
BEGIN
    UPDATE public.adverts
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = p_advert_id
    RETURNING view_count INTO v_views;
    RETURN COALESCE(v_views, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record advert downloads atomically
CREATE OR REPLACE FUNCTION increment_advert_download(p_advert_id UUID)
RETURNS INT AS $$
DECLARE
    v_downloads INT;
BEGIN
    UPDATE public.adverts
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = p_advert_id
    RETURNING download_count INTO v_downloads;
    RETURN COALESCE(v_downloads, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
