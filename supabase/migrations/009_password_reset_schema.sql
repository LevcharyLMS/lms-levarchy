-- ============================================================
-- LEVCHARY LMS - PASSWORD RESET SCHEMA MIGRATION
-- Migration: 009_password_reset_schema.sql
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'reset_password_token'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN reset_password_token TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'reset_password_expires_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN reset_password_expires_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN password_hash TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_reset_token ON public.profiles (reset_password_token) 
WHERE reset_password_token IS NOT NULL;
