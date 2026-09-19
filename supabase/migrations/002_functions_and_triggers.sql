-- ============================================================
-- LEVCHARY LMS - DATABASE SCHEMA MIGRATION 002
-- STORED FUNCTIONS, CONCURRENCY LOCKS & INTEGRITY TRIGGERS
-- ============================================================

-- 1. UPDATED_AT AUTOMATIC TRIGGER
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. IMMUTABLE FINANCIAL SNAPSHOT TRIGGER
-- Absolutely blocks UPDATE or DELETE on historical locked financial records
CREATE OR REPLACE FUNCTION enforce_financial_snapshot_immutability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'CRITICAL: Historical booking financial snapshots are strictly immutable and cannot be modified (Booking ID: %)', OLD.booking_id;
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'CRITICAL: Historical booking financial snapshots are strictly immutable and cannot be deleted (Booking ID: %)', OLD.booking_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_booking_financial_snapshot_immutable
BEFORE UPDATE OR DELETE ON booking_financial_snapshots
FOR EACH ROW EXECUTE FUNCTION enforce_financial_snapshot_immutability();

-- 3. APPEND-ONLY AUDIT LOG TRIGGER
CREATE OR REPLACE FUNCTION enforce_audit_log_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'CRITICAL: System audit logs are append-only. Modification or deletion is strictly prohibited (Log ID: %)', OLD.id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_audit_log_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION enforce_audit_log_append_only();

-- 4. TUTOR RATING CALCULATION TRIGGER
CREATE OR REPLACE FUNCTION recalculate_tutor_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_tutor_id UUID;
    v_avg NUMERIC(3, 2);
    v_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_tutor_id := OLD.tutor_id;
    ELSE
        v_tutor_id := NEW.tutor_id;
    END IF;

    SELECT
        COALESCE(ROUND(AVG(rating)::numeric, 2), 5.00),
        COUNT(*)
    INTO v_avg, v_count
    FROM reviews
    WHERE tutor_id = v_tutor_id AND is_published = TRUE;

    UPDATE tutor_profiles
    SET rating_avg = v_avg,
        reviews_count = v_count,
        updated_at = NOW()
    WHERE user_id = v_tutor_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_recalculate_tutor_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION recalculate_tutor_rating();

-- 5. ATOMIC 1-ON-1 SLOT RESERVATION FUNCTION
-- Enforces:
-- a) Tutor is approved
-- b) No overlapping active bookings for the tutor (atomic check with row lock)
-- c) Generates booking with state PENDING_PAYMENT
CREATE OR REPLACE FUNCTION reserve_one_on_one_slot(
    p_booking_number TEXT,
    p_student_id UUID,
    p_tutor_id UUID,
    p_class_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_timezone TEXT,
    p_format class_format,
    p_location_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_is_approved BOOLEAN;
    v_conflict_count INTEGER;
    v_booking_id UUID;
BEGIN
    -- Check tutor approval status
    SELECT is_approved INTO v_is_approved
    FROM tutor_profiles
    WHERE user_id = p_tutor_id;

    IF v_is_approved IS NOT TRUE THEN
        RAISE EXCEPTION 'Cannot book slot: Tutor is not verified or approved by administration.';
    END IF;

    -- Check for overlapping active bookings with explicit exclusive lock
    PERFORM 1 FROM tutor_profiles WHERE user_id = p_tutor_id FOR UPDATE;

    SELECT COUNT(*) INTO v_conflict_count
    FROM bookings
    WHERE tutor_id = p_tutor_id
      AND status IN ('CONFIRMED', 'PAYMENT_PROCESSING', 'PENDING_PAYMENT')
      AND (
          (p_start_time >= start_time AND p_start_time < end_time) OR
          (p_end_time > start_time AND p_end_time <= end_time) OR
          (p_start_time <= start_time AND p_end_time >= end_time)
      );

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Double booking prevented: Tutor already has an active class or reservation during this time window.';
    END IF;

    -- Insert reservation
    INSERT INTO bookings (
        booking_number,
        student_id,
        tutor_id,
        class_id,
        status,
        start_time,
        end_time,
        timezone,
        format,
        location_id,
        notes
    ) VALUES (
        p_booking_number,
        p_student_id,
        p_tutor_id,
        p_class_id,
        'PENDING_PAYMENT',
        p_start_time,
        p_end_time,
        p_timezone,
        p_format,
        p_location_id,
        p_notes
    ) RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- 6. ATOMIC GROUP CLASS ENROLLMENT & CAPACITY ENFORCEMENT
-- Enforces:
-- a) Locks class row with FOR UPDATE
-- b) Checks current enrolled_count < capacity
-- c) Increments enrolled_count safely
-- d) Sets class status to 'FULL' if enrolled_count reaches capacity
CREATE OR REPLACE FUNCTION enroll_group_class_atomic(
    p_booking_number TEXT,
    p_class_id UUID,
    p_student_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_timezone TEXT,
    p_format class_format,
    p_location_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_tutor_id UUID;
    v_capacity INTEGER;
    v_enrolled INTEGER;
    v_status class_status;
    v_booking_id UUID;
    v_already_enrolled INTEGER;
BEGIN
    -- Acquire exclusive row lock on the class
    SELECT tutor_id, capacity, enrolled_count, status
    INTO v_tutor_id, v_capacity, v_enrolled, v_status
    FROM classes
    WHERE id = p_class_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Class not found (ID: %)', p_class_id;
    END IF;

    IF v_status NOT IN ('PUBLISHED', 'OPEN') THEN
        RAISE EXCEPTION 'Class is not available for new enrollments (Status: %)', v_status;
    END IF;

    -- Check if student already enrolled
    SELECT COUNT(*) INTO v_already_enrolled
    FROM class_enrollments
    WHERE class_id = p_class_id AND student_id = p_student_id AND status = 'ACTIVE';

    IF v_already_enrolled > 0 THEN
        RAISE EXCEPTION 'Student is already enrolled in this class.';
    END IF;

    -- Check capacity
    IF v_enrolled >= v_capacity THEN
        RAISE EXCEPTION 'Class capacity reached (% / % seats). Enrollment closed.', v_enrolled, v_capacity;
    END IF;

    -- Increment enrollment count
    v_enrolled := v_enrolled + 1;

    -- Update class record
    UPDATE classes
    SET enrolled_count = v_enrolled,
        status = CASE WHEN v_enrolled >= v_capacity THEN 'FULL'::class_status ELSE status END,
        updated_at = NOW()
    WHERE id = p_class_id;

    -- Create booking record
    INSERT INTO bookings (
        booking_number,
        student_id,
        tutor_id,
        class_id,
        status,
        start_time,
        end_time,
        timezone,
        format,
        location_id
    ) VALUES (
        p_booking_number,
        p_student_id,
        v_tutor_id,
        p_class_id,
        'PENDING_PAYMENT',
        p_start_time,
        p_end_time,
        p_timezone,
        p_format,
        p_location_id
    ) RETURNING id INTO v_booking_id;

    -- Create enrollment record
    INSERT INTO class_enrollments (
        class_id,
        student_id,
        booking_id,
        status
    ) VALUES (
        p_class_id,
        p_student_id,
        v_booking_id,
        'ACTIVE'
    );

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;
