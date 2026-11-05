-- ============================================================
-- LEVCHARY LMS - MIGRATION 006 (PART 1 of 2): ADD ENUM VALUES & RENAME TABLES
-- Must be executed and committed BEFORE Part 2 uses the new enum value.
-- ============================================================

-- 1. ADD 'INSTRUCTOR' TO user_role ENUM (Committed immediately)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'INSTRUCTOR';

-- 2. CREATE INSTRUCTOR SUBTYPE ENUM
DO $$ BEGIN
    CREATE TYPE instructor_subtype AS ENUM ('TUTOR', 'FACULTY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. RENAME TABLES
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tutor_profiles') THEN
        ALTER TABLE public.tutor_profiles RENAME TO instructor_profiles;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tutor_applications') THEN
        ALTER TABLE public.tutor_applications RENAME TO instructor_applications;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tutor_availability') THEN
        ALTER TABLE public.tutor_availability RENAME TO instructor_availability;
    END IF;
END $$;

-- 4. ADD SUBTYPE TO INSTRUCTOR PROFILES
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'instructor_profiles' 
          AND column_name = 'instructor_type'
    ) THEN
        ALTER TABLE public.instructor_profiles 
        ADD COLUMN instructor_type instructor_subtype NOT NULL DEFAULT 'TUTOR';
    END IF;
END $$;

-- 5. RENAME FOREIGN KEY COLUMNS ACROSS ENTITIES
DO $$ BEGIN
    -- classes table
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'tutor_id') THEN
        ALTER TABLE public.classes RENAME COLUMN tutor_id TO instructor_id;
    END IF;

    -- bookings table
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'tutor_id') THEN
        ALTER TABLE public.bookings RENAME COLUMN tutor_id TO instructor_id;
    END IF;

    -- reviews table
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'tutor_id') THEN
        ALTER TABLE public.reviews RENAME COLUMN tutor_id TO instructor_id;
    END IF;

    -- transactions table
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'tutor_id') THEN
        ALTER TABLE public.transactions RENAME COLUMN tutor_id TO instructor_id;
    END IF;

    -- instructor_applications table
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'instructor_applications' AND column_name = 'tutor_id') THEN
        ALTER TABLE public.instructor_applications RENAME COLUMN tutor_id TO instructor_id;
    END IF;

    -- instructor_availability table
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'instructor_availability' AND column_name = 'tutor_id') THEN
        ALTER TABLE public.instructor_availability RENAME COLUMN tutor_id TO instructor_id;
    END IF;
END $$;
