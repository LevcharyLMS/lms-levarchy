const { Client } = require('pg');

const connectionString = 'postgresql://postgres.xegsdlkpdwwmojdatuwb:iTI6MBFuBxvDZaJ9@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

async function seedRichData() {
  console.log('🌱 Populating rich production dataset in Supabase...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // 1. Tutors Profiles
    const tutors = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        email: 'marcus.chen@tutor.levchary.local',
        firstName: 'Dr. Marcus',
        lastName: 'Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        headline: 'Ph.D. in Applied Mathematics | MIT Graduate | 12+ Years Teaching',
        bio: 'Former university lecturer specializing in differential equations, linear algebra, and competitive mathematical Olympiad preparation.',
        qualifications: 'Ph.D. Applied Mathematics (MIT), B.S. Theoretical Physics (Caltech)',
        experienceYears: 12,
        hourlyRate: 8500,
        rating: 4.95,
        reviewsCount: 48,
        preferredFormat: 'BOTH'
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        email: 'elena.rostova@tutor.levchary.local',
        firstName: 'Elena',
        lastName: 'Rostova',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        headline: 'Oxford M.Sc. in Organic Chemistry & Biochemistry',
        bio: 'Passionate about simplifying molecular orbital theory, reaction mechanisms, and pre-med organic chemistry coursework.',
        qualifications: 'M.Sc. Organic Chemistry (Oxford), B.S. Chemistry (McGill)',
        experienceYears: 8,
        hourlyRate: 7500,
        rating: 4.90,
        reviewsCount: 36,
        preferredFormat: 'BOTH'
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        email: 'david.kim@tutor.levchary.local',
        firstName: 'David',
        lastName: 'Kim',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        headline: 'Staff Software Engineer & Computer Science Instructor',
        bio: 'Specializing in Python 3, algorithms, system design, and full-stack development with hands-on coding and real projects.',
        qualifications: 'B.S. Computer Science (Stanford University)',
        experienceYears: 9,
        hourlyRate: 9500,
        rating: 4.98,
        reviewsCount: 52,
        preferredFormat: 'VIRTUAL'
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        email: 'sarah.patel@tutor.levchary.local',
        firstName: 'Sarah',
        lastName: 'Patel',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        headline: 'Harvard M.Ed. | AP Physics & Standardized Test Prep Specialist',
        bio: 'Over 10 years guiding high school students through AP Physics 1/C, SAT Math, and STEM competition challenges.',
        qualifications: 'M.Ed. (Harvard), B.S. Applied Physics (Columbia)',
        experienceYears: 10,
        hourlyRate: 8000,
        rating: 4.92,
        reviewsCount: 41,
        preferredFormat: 'BOTH'
      }
    ];

    for (const t of tutors) {
      // Profile
      await client.query(`
        INSERT INTO profiles (id, email, role, first_name, last_name, avatar_url, account_status, verification_status, email_verified)
        VALUES ($1, $2, 'TUTOR', $3, $4, $5, 'ACTIVE', 'APPROVED', TRUE)
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          account_status = 'ACTIVE',
          verification_status = 'APPROVED';
      `, [t.id, t.email, t.firstName, t.lastName, t.avatarUrl]);

      // Tutor profile
      await client.query(`
        INSERT INTO tutor_profiles (user_id, headline, bio, qualifications, experience_years, hourly_rate, rating_avg, reviews_count, is_approved, preferred_format)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9)
        ON CONFLICT (user_id) DO UPDATE SET
          headline = EXCLUDED.headline,
          bio = EXCLUDED.bio,
          hourly_rate = EXCLUDED.hourly_rate,
          is_approved = TRUE;
      `, [t.id, t.headline, t.bio, t.qualifications, t.experienceYears, t.hourlyRate, t.rating, t.reviewsCount, t.preferredFormat]);

      // Tutor availability (Mon-Fri 09:00 - 17:00)
      for (let day = 1; day <= 5; day++) {
        await client.query(`
          INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_active)
          VALUES ($1, $2, '09:00:00', '17:00:00', TRUE)
          ON CONFLICT DO NOTHING;
        `, [t.id, day]);
      }
    }
    console.log(`✅ Seeded ${tutors.length} verified tutors and weekly availability`);

    // 2. Student Profiles
    const students = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        email: 'student@levchary.local',
        firstName: 'Lucas',
        lastName: 'Miller',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        gradeLevel: 'Grade 12 (High School Senior)',
        goals: 'Score 5 on AP Calculus BC and prepare for university computer science'
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        email: 'sophia.taylor@student.levchary.local',
        firstName: 'Sophia',
        lastName: 'Taylor',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        gradeLevel: 'College Sophomore',
        goals: 'Master Organic Chemistry synthesis pathways for MCAT exam'
      }
    ];

    for (const s of students) {
      await client.query(`
        INSERT INTO profiles (id, email, role, first_name, last_name, avatar_url, account_status, verification_status, email_verified)
        VALUES ($1, $2, 'STUDENT', $3, $4, $5, 'ACTIVE', 'APPROVED', TRUE)
        ON CONFLICT (id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          account_status = 'ACTIVE';
      `, [s.id, s.email, s.firstName, s.lastName, s.avatarUrl]);

      await client.query(`
        INSERT INTO student_profiles (user_id, grade_level, learning_goals)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET
          grade_level = EXCLUDED.grade_level,
          learning_goals = EXCLUDED.learning_goals;
      `, [s.id, s.gradeLevel, s.goals]);
    }
    console.log(`✅ Seeded ${students.length} student profiles`);

    // 3. Classes Across 4 Class Types (1-on-1 Virtual, 1-on-1 Physical, Group Virtual, Group Physical)
    const classes = [
      {
        id: '30000000-0000-0000-0000-000000000001',
        title: 'AP Calculus BC Masterclass: Differential & Integral Foundations',
        description: 'Intensive 1-on-1 personalized tutorial covering limits, advanced derivatives, integration techniques, Taylor series, and targeted exam problem sets.',
        tutorId: '10000000-0000-0000-0000-000000000001', // Dr. Marcus Chen
        categoryId: '11111111-1111-1111-1111-111111111001', // Mathematics
        subjectId: '22222222-2222-2222-2222-222222222001',  // AP Calculus BC
        gradeId: '33333333-3333-3333-3333-333333333003',    // High School 11-12
        classType: 'ONE_ON_ONE',
        format: 'VIRTUAL',
        durationMinutes: 60,
        price: 8500, // $85.00
        capacity: 1,
        enrolledCount: 0,
        meetUrl: 'https://meet.google.com/lev-calc-bc-01',
        status: 'PUBLISHED'
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        title: 'Organic Chemistry Synthesis & Reaction Mechanisms Lab Review',
        description: 'Hands-on 1-on-1 physical classroom session focusing on nucleophilic substitution, elimination pathways, and organic molecular modeling kits.',
        tutorId: '10000000-0000-0000-0000-000000000002', // Elena Rostova
        categoryId: '11111111-1111-1111-1111-111111111002', // Science
        subjectId: '22222222-2222-2222-2222-222222222004',  // Organic Chemistry
        gradeId: '33333333-3333-3333-3333-333333333004',    // College
        classType: 'ONE_ON_ONE',
        format: 'PHYSICAL',
        durationMinutes: 90,
        price: 9500, // $95.00
        capacity: 1,
        enrolledCount: 0,
        locationId: '44444444-4444-4444-4444-444444444001', // Boston Main St
        status: 'PUBLISHED'
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        title: 'Full-Stack Python & Data Structures Interactive Cohort',
        description: 'Small group live virtual workshop covering algorithmic complexity, binary search trees, graph traversals, and dynamic programming with live code pairing.',
        tutorId: '10000000-0000-0000-0000-000000000003', // David Kim
        categoryId: '11111111-1111-1111-1111-111111111003', // Computer Science
        subjectId: '22222222-2222-2222-2222-222222222005',  // Python & Data Structures
        gradeId: '33333333-3333-3333-3333-333333333003',    // High School 11-12
        classType: 'GROUP',
        format: 'VIRTUAL',
        durationMinutes: 90,
        price: 4500, // $45.00
        capacity: 8,
        enrolledCount: 3,
        meetUrl: 'https://meet.google.com/lev-py-cohort-03',
        status: 'OPEN'
      },
      {
        id: '30000000-0000-0000-0000-000000000004',
        title: 'Digital SAT Math Intensive: Speed & Accuracy Strategies',
        description: 'Group physical classroom workshop at the Cambridge Study Center covering adaptive test strategies, Desmos calculator shortcuts, and high-yield geometry/algebra.',
        tutorId: '10000000-0000-0000-0000-000000000004', // Sarah Patel
        categoryId: '11111111-1111-1111-1111-111111111005', // Test Prep
        subjectId: '22222222-2222-2222-2222-222222222008',  // SAT Math
        gradeId: '33333333-3333-3333-3333-333333333003',    // High School 11-12
        classType: 'GROUP',
        format: 'PHYSICAL',
        durationMinutes: 120,
        price: 5500, // $55.00
        capacity: 12,
        enrolledCount: 5,
        locationId: '44444444-4444-4444-4444-444444444002', // Cambridge Room 2B
        status: 'OPEN'
      }
    ];

    for (const c of classes) {
      await client.query(`
        INSERT INTO classes (
          id, title, description, tutor_id, category_id, subject_id, grade_id,
          class_type, format, duration_minutes, price, capacity, enrolled_count,
          location_id, meet_url, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          price = EXCLUDED.price,
          status = EXCLUDED.status;
      `, [
        c.id, c.title, c.description, c.tutorId, c.categoryId, c.subjectId, c.gradeId,
        c.classType, c.format, c.durationMinutes, c.price, c.capacity, c.enrolledCount,
        c.locationId || null, c.meetUrl || null, c.status
      ]);
    }
    console.log(`✅ Seeded ${classes.length} classes covering all 4 class types (1-on-1 Virtual, 1-on-1 Physical, Group Virtual, Group Physical)`);

    // 4. Sample Confirmed Booking with Immutable Financial Snapshot
    const bookingId = '40000000-0000-0000-0000-000000000001';
    const snapshotId = '50000000-0000-0000-0000-000000000001';

    await client.query(`
      INSERT INTO bookings (
        id, booking_number, student_id, tutor_id, class_id, status,
        start_time, end_time, timezone, format, meet_url
      ) VALUES (
        $1, 'LEV-202609-MIT01',
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'CONFIRMED',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '2 days 1 hour',
        'America/New_York',
        'VIRTUAL',
        'https://meet.google.com/lev-calc-bc-01'
      ) ON CONFLICT (id) DO NOTHING;
    `, [bookingId]);

    // Financial snapshot (Locked: $85.00 gross, 20% platform = $17.00, tutor earnings = $68.00)
    await client.query(`
      INSERT INTO booking_financial_snapshots (
        id, booking_id, gross_amount, platform_fee_percent, platform_fee_amount,
        tutor_earnings, stripe_fee_estimate, currency
      ) VALUES (
        $1, $2, 8500, 20.00, 1700, 6800, 277, 'USD'
      ) ON CONFLICT (id) DO NOTHING;
    `, [snapshotId, bookingId]);

    // Transaction ledger record
    await client.query(`
      INSERT INTO transactions (
        booking_id, student_id, tutor_id, type, gross_amount,
        fee_amount, net_amount, currency, status, stripe_charge_id
      ) VALUES (
        $1, '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
        'PAYMENT', 8500, 1700, 6800, 'USD', 'COMPLETED', 'ch_live_demo_01'
      ) ON CONFLICT DO NOTHING;
    `, [bookingId]);
    console.log('✅ Seeded confirmed booking with locked financial snapshot & transaction ledger');

    // 5. Sample Flagged Message for Moderation Queue
    const convId = '70000000-0000-0000-0000-000000000001';
    const msgId = '80000000-0000-0000-0000-000000000001';
    const flagId = '90000000-0000-0000-0000-000000000001';

    await client.query(`
      INSERT INTO conversations (id) VALUES ($1) ON CONFLICT (id) DO NOTHING;
    `, [convId]);

    await client.query(`
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES
        ($1, '20000000-0000-0000-0000-000000000001'),
        ($1, '10000000-0000-0000-0000-000000000001')
      ON CONFLICT DO NOTHING;
    `, [convId]);

    await client.query(`
      INSERT INTO messages (id, conversation_id, sender_id, body, has_flag)
      VALUES ($1, $2, '20000000-0000-0000-0000-000000000001', 'Can we bypass fees? Send to my PayPal account directly.', TRUE)
      ON CONFLICT (id) DO NOTHING;
    `, [msgId, convId]);

    await client.query(`
      INSERT INTO message_flags (id, message_id, flag_type, detected_text, severity, status)
      VALUES ($1, $2, 'OFF_PLATFORM_PAYMENT', 'PayPal', 'HIGH', 'PENDING_REVIEW')
      ON CONFLICT (id) DO NOTHING;
    `, [flagId, msgId]);
    console.log('✅ Seeded message safety moderation alert');

    // Print final table counts
    console.log('\n📊 Final Supabase Table Counts:');
    const tables = ['profiles', 'tutor_profiles', 'student_profiles', 'categories', 'subjects', 'grades', 'class_locations', 'classes', 'bookings', 'booking_financial_snapshots', 'transactions', 'message_flags', 'commission_rules', 'platform_settings'];
    for (const t of tables) {
      const res = await client.query(`SELECT count(*) FROM ${t};`);
      console.log(`  ✓ ${t}: ${res.rows[0].count} rows`);
    }

  } catch (err) {
    console.error('❌ Error during rich seeding:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedRichData();
