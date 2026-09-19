-- ============================================================
-- LEVCHARY LMS - DATABASE SCHEMA MIGRATION 003
-- ROW LEVEL SECURITY (RLS) POLICIES & ACCESS CONTROL
-- ============================================================

-- Helper function to extract current authenticated user ID
CREATE OR REPLACE FUNCTION auth_uid()
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$ LANGUAGE sql STABLE;

-- Helper function to check if current user is ADMIN
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth_uid() AND role = 'ADMIN' AND account_status = 'ACTIVE'
    );
$$ LANGUAGE sql STABLE;

-- Enable RLS on all sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are readable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (account_status != 'SUSPENDED' OR is_admin());

CREATE POLICY "Users can update their own non-sensitive profile info"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth_uid())
WITH CHECK (
    id = auth_uid()
    AND role = (SELECT role FROM profiles WHERE id = auth_uid()) -- Cannot elevate role
    AND account_status = (SELECT account_status FROM profiles WHERE id = auth_uid()) -- Cannot unsuspend self
);

CREATE POLICY "Admins have full access to profiles"
ON profiles FOR ALL
TO authenticated
USING (is_admin());

-- 2. VERIFICATION DOCUMENTS (STRICTEST PRIVACY)
-- Tutors/students can only view their own uploaded documents. Admins can view all.
CREATE POLICY "Users can view their own verification documents"
ON verification_documents FOR SELECT
TO authenticated
USING (user_id = auth_uid() OR is_admin());

CREATE POLICY "Users can upload their own verification documents"
ON verification_documents FOR INSERT
TO authenticated
WITH CHECK (user_id = auth_uid());

CREATE POLICY "Admins can manage verification documents"
ON verification_documents FOR ALL
TO authenticated
USING (is_admin());

-- 3. CLASSES POLICIES
CREATE POLICY "Published classes are viewable by everyone"
ON classes FOR SELECT
TO public
USING (status IN ('PUBLISHED', 'OPEN', 'FULL', 'COMPLETED'));

CREATE POLICY "Tutors can view all their own classes"
ON classes FOR SELECT
TO authenticated
USING (tutor_id = auth_uid() OR is_admin());

CREATE POLICY "Admins can manage all classes"
ON classes FOR ALL
TO authenticated
USING (is_admin());

-- 4. BOOKINGS POLICIES
CREATE POLICY "Students can view their own bookings"
ON bookings FOR SELECT
TO authenticated
USING (student_id = auth_uid() OR tutor_id = auth_uid() OR is_admin());

CREATE POLICY "Students can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (student_id = auth_uid());

CREATE POLICY "Admins can manage bookings"
ON bookings FOR ALL
TO authenticated
USING (is_admin());

-- 5. FINANCIAL SNAPSHOTS POLICIES (READ ONLY FOR OWNER/TUTOR/ADMIN)
CREATE POLICY "Booking participants and Admins can view financial snapshots"
ON booking_financial_snapshots FOR SELECT
TO authenticated
USING (
    is_admin() OR
    EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.id = booking_id AND (b.student_id = auth_uid() OR b.tutor_id = auth_uid())
    )
);

-- 6. MESSAGING POLICIES
CREATE POLICY "Participants can view their conversations"
ON conversations FOR SELECT
TO authenticated
USING (
    is_admin() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = id AND cp.user_id = auth_uid()
    )
);

CREATE POLICY "Participants can view messages"
ON messages FOR SELECT
TO authenticated
USING (
    is_admin() OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_id AND cp.user_id = auth_uid()
    )
);

CREATE POLICY "Participants can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth_uid() AND
    EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversation_id AND cp.user_id = auth_uid()
    )
);

-- 7. MESSAGE FLAGS (ADMINS ONLY)
CREATE POLICY "Only admins can view and act on message moderation flags"
ON message_flags FOR ALL
TO authenticated
USING (is_admin());

-- 8. AUDIT LOGS (ADMINS ONLY)
CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin());

-- 9. NOTIFICATIONS
CREATE POLICY "Users can only view and update their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth_uid());

CREATE POLICY "Users can update their own notification read status"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth_uid())
WITH CHECK (user_id = auth_uid());

-- 10. REVIEWS
CREATE POLICY "Published reviews are viewable by everyone"
ON reviews FOR SELECT
TO public
USING (is_published = TRUE OR student_id = auth_uid() OR tutor_id = auth_uid() OR is_admin());

CREATE POLICY "Students can write review for completed bookings"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (
    student_id = auth_uid() AND
    EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.id = booking_id AND b.student_id = auth_uid() AND b.status = 'COMPLETED'
    )
);
