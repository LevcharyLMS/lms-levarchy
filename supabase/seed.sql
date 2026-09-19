-- ============================================================
-- LEVCHARY LMS - DATABASE SEED DATA
-- Comprehensive development & demonstration dataset
-- ============================================================

-- 1. CATEGORIES
INSERT INTO categories (id, name, slug, description, icon) VALUES
('11111111-1111-1111-1111-111111111001', 'Mathematics', 'mathematics', 'Algebra, Geometry, Calculus, Statistics and Applied Mathematics', 'Calculator'),
('11111111-1111-1111-1111-111111111002', 'Science', 'science', 'Physics, Chemistry, Biology, Environmental and Earth Sciences', 'Atom'),
('11111111-1111-1111-1111-111111111003', 'Computer Science & Tech', 'computer-science', 'Python, Web Development, Algorithms, AI and Cloud Computing', 'Code'),
('11111111-1111-1111-1111-111111111004', 'Languages & Literature', 'languages', 'English Literature, Spanish, French, Writing and ESL', 'BookOpen'),
('11111111-1111-1111-1111-111111111005', 'Test Preparation', 'test-prep', 'SAT, ACT, AP Exams, GRE, and College Entrance Prep', 'GraduationCap')
ON CONFLICT (id) DO NOTHING;

-- 2. SUBJECTS
INSERT INTO subjects (id, category_id, name, slug, description) VALUES
('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111001', 'AP Calculus BC', 'ap-calculus-bc', 'Advanced differential and integral calculus, Taylor series, and exam preparation'),
('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111001', 'Linear Algebra', 'linear-algebra', 'Vectors, matrices, linear transformations, eigenvalues and real-world applications'),
('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111002', 'Physics: Mechanics & Electromagnetism', 'physics-mechanics', 'Classical mechanics, kinematics, Newton laws, electromagnetism, circuit theory'),
('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111002', 'Organic Chemistry', 'organic-chemistry', 'Reaction mechanisms, functional groups, synthesis, spectroscopy'),
('22222222-2222-2222-2222-222222222005', '11111111-1111-1111-1111-111111111003', 'Python & Data Structures', 'python-data-structures', 'Modern Python 3, object-oriented programming, trees, graphs, dynamic programming'),
('22222222-2222-2222-2222-222222222006', '11111111-1111-1111-1111-111111111003', 'Web Development & React', 'web-development-react', 'HTML5, CSS, TypeScript, modern React, Next.js and API architecture'),
('22222222-2222-2222-2222-222222222007', '11111111-1111-1111-1111-111111111004', 'English Literature & Composition', 'english-literature', 'Critical literary analysis, essay writing, rhetoric, academic argument'),
('22222222-2222-2222-2222-222222222008', '11111111-1111-1111-1111-111111111005', 'SAT Math & Digital Strategy', 'sat-math', 'Comprehensive digital SAT Math preparation, timing strategies, high-yield practice')
ON CONFLICT (id) DO NOTHING;

-- 3. GRADES
INSERT INTO grades (id, name, level, description) VALUES
('33333333-3333-3333-3333-333333333001', 'Middle School (Grades 6-8)', 1, 'Foundational subjects and early high school preparation'),
('33333333-3333-3333-3333-333333333002', 'High School (Grades 9-10)', 2, 'Core subjects, honors courses, early exam strategies'),
('33333333-3333-3333-3333-333333333003', 'High School (Grades 11-12)', 3, 'AP, IB, standardized testing, and college prep'),
('33333333-3333-3333-3333-333333333004', 'Undergraduate / College', 4, 'University-level STEM, humanities, and research topics')
ON CONFLICT (id) DO NOTHING;

-- 4. PHYSICAL LOCATIONS (ADMIN-CONTROLLED)
INSERT INTO class_locations (id, name, address, city, state, postal_code, country, capacity, directions) VALUES
('44444444-4444-4444-4444-444444444001', 'Levchary Central Learning Hub - Suite 400', '100 Main Street', 'Boston', 'MA', '02110', 'US', 24, 'Adjacent to Downtown Crossing Station. Check in at security desk.'),
('44444444-4444-4444-4444-444444444002', 'Levchary Cambridge Study Center - Room 2B', '450 Massachusetts Ave', 'Cambridge', 'MA', '02139', 'US', 16, 'Two blocks from Central Square Red Line. Secure keycard access.'),
('44444444-4444-4444-4444-444444444003', 'Levchary Manhattan Learning Lab', '520 5th Avenue, Floor 8', 'New York', 'NY', '10036', 'US', 20, 'Near Grand Central. Professional quiet rooms and interactive boards.')
ON CONFLICT (id) DO NOTHING;

-- 5. ADMIN USER
INSERT INTO profiles (
    id, email, role, first_name, last_name, avatar_url, phone, account_status, verification_status, email_verified
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@levchary.local',
    'ADMIN',
    'Alexander',
    'Vance',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    '+1 (617) 555-0100',
    'ACTIVE',
    'APPROVED',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 6. COMMISSION RULE
INSERT INTO commission_rules (id, name, default_percent, is_active, created_by) VALUES
('55555555-5555-5555-5555-555555555001', 'Standard Platform Tier (20%)', 20.00, TRUE, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 7. PLATFORM SETTINGS
INSERT INTO platform_settings (key, value, description) VALUES
('platform_info', '{"name": "Levchary LMS", "support_email": "support@levchary.com", "currency": "USD"}'::jsonb, 'General platform metadata'),
('refund_policy', '{"cancellation_window_hours": 24, "full_refund_window_hours": 48, "partial_refund_percent": 50}'::jsonb, 'Marketplace refund rules and cancellation policy'),
('tutor_commission', '{"default_rate": 20.00, "min_fee_cents": 500}'::jsonb, 'Default company commission percentage')
ON CONFLICT (key) DO NOTHING;

-- 8. AUDIT LOG (SEED INITIALIZATION)
INSERT INTO audit_logs (id, actor_id, actor_role, action, entity_type, entity_id, metadata) VALUES
('66666666-6666-6666-6666-666666666001', '00000000-0000-0000-0000-000000000001', 'ADMIN', 'PLATFORM_INITIALIZED', 'SYSTEM', 'ROOT', '{"version": "1.0.0", "environment": "production-ready"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
