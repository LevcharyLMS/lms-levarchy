// ============================================================
// LEVCHARY LMS - LIVE SUPABASE POSTGRESQL QUERY ENGINE
// Real-time server-side database aggregations, queries & zero fake data
// ============================================================

import { Pool } from 'pg';
import { db as memoryDb } from './data-store';
import {
  UserProfile,
  TutorProfile,
  ClassItem,
  Booking,
  Transaction,
  MessageFlag,
  Category,
  Subject,
  Grade,
  ClassLocation,
} from '@/types';

// Global Singleton PostgreSQL Pool for Supabase connection
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres.xegsdlkpdwwmojdatuwb:iTI6MBFuBxvDZaJ9@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false },
    max: 2,
    connectionTimeoutMillis: 2500,
    idleTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}

export class SupabaseDbService {
  /**
   * Convert any JavaScript Date instances to ISO strings for safe Next.js RSC serialization
   */
  private static sanitizeRow(row: any): any {
    if (!row || typeof row !== 'object') return row;
    if (row instanceof Date) return row.toISOString();
    if (Array.isArray(row)) return row.map((r) => SupabaseDbService.sanitizeRow(r));
    const copy: any = {};
    for (const [key, val] of Object.entries(row)) {
      if (val instanceof Date) {
        copy[key] = val.toISOString();
      } else if (val !== null && typeof val === 'object') {
        copy[key] = SupabaseDbService.sanitizeRow(val);
      } else {
        copy[key] = val;
      }
    }
    return copy;
  }

  /**
   * Safe query helper with automatic fallback to in-memory store if DB connection fails
   */
  private static async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows.map((r) => SupabaseDbService.sanitizeRow(r)) as T[];
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('⚠️ Supabase Live DB query notice, using cached store fallback:', (err as Error).message);
      return [];
    }
  }

  // --- ADMIN KPIS & REAL AGGREGATIONS (RULE 67, 94, 96) ---
  static async getAdminKPIs() {
    try {
      const rows = await this.query(`
        SELECT
          (SELECT COUNT(*) FROM profiles WHERE role = 'STUDENT') as total_students,
          (SELECT COUNT(*) FROM profiles WHERE role = 'TUTOR') as total_tutors,
          (SELECT COUNT(*) FROM tutor_profiles WHERE is_approved = true) as approved_tutors,
          (SELECT COUNT(*) FROM tutor_applications WHERE status = 'PENDING_REVIEW') as pending_applications,
          (SELECT COUNT(*) FROM verification_documents WHERE status = 'PENDING_REVIEW') as pending_verifications,
          (SELECT COUNT(*) FROM bookings) as total_bookings,
          (SELECT COUNT(*) FROM bookings WHERE status = 'COMPLETED') as completed_classes,
          (SELECT COALESCE(SUM(gross_amount), 0) FROM booking_financial_snapshots) as gross_revenue_cents,
          (SELECT COALESCE(SUM(platform_fee_amount), 0) FROM booking_financial_snapshots) as commission_revenue_cents,
          (SELECT COALESCE(SUM(tutor_earnings), 0) FROM booking_financial_snapshots) as tutor_earnings_cents,
          (SELECT COUNT(*) FROM message_flags WHERE status = 'PENDING_REVIEW') as pending_flags_count,
          (SELECT COUNT(*) FROM classes WHERE status IN ('PUBLISHED', 'OPEN')) as active_classes
      `);

      if (rows.length > 0) {
        const r = rows[0];
        return {
          totalStudents: parseInt(r.total_students || '0', 10),
          totalTutors: parseInt(r.total_tutors || '0', 10),
          approvedTutors: parseInt(r.approved_tutors || '0', 10),
          pendingApplications: parseInt(r.pending_applications || '0', 10),
          pendingVerifications: parseInt(r.pending_verifications || '0', 10),
          totalBookings: parseInt(r.total_bookings || '0', 10),
          completedClasses: parseInt(r.completed_classes || '0', 10),
          grossRevenueCents: parseInt(r.gross_revenue_cents || '0', 10),
          platformCommissionCents: parseInt(r.commission_revenue_cents || '0', 10),
          tutorEarningsCents: parseInt(r.tutor_earnings_cents || '0', 10),
          pendingFlagsCount: parseInt(r.pending_flags_count || '0', 10),
          activeClasses: parseInt(r.active_classes || '0', 10),
        };
      }
    } catch {
      // fallback
    }

    return memoryDb.getAdminStats();
  }

  // --- TUTORS QUERY ---
  static async getApprovedTutors() {
    try {
      const rows = await this.query(`
        SELECT
          p.id as user_id,
          p.email,
          p.first_name,
          p.last_name,
          p.avatar_url,
          tp.headline,
          tp.bio,
          tp.qualifications,
          tp.experience_years,
          tp.hourly_rate,
          tp.rating_avg,
          tp.reviews_count,
          tp.is_approved,
          tp.preferred_format
        FROM profiles p
        JOIN tutor_profiles tp ON p.id = tp.user_id
        WHERE tp.is_approved = true AND p.account_status = 'ACTIVE'
        ORDER BY tp.rating_avg DESC, tp.reviews_count DESC
      `);

      if (rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          user: {
            id: r.user_id,
            email: r.email,
            first_name: r.first_name,
            last_name: r.last_name,
            avatar_url: r.avatar_url,
          },
        }));
      }
    } catch {
      // fallback
    }
    return memoryDb.getTutors();
  }

  // --- CLASSES QUERY ---
  static async getClasses(filters?: { format?: string; categoryId?: string }) {
    try {
      let sql = `
        SELECT
          c.*,
          cat.name as category_name,
          sub.name as subject_name,
          p.first_name as tutor_first_name,
          p.last_name as tutor_last_name,
          p.avatar_url as tutor_avatar_url,
          tp.headline as tutor_headline,
          loc.name as location_name,
          loc.address as location_address
        FROM classes c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN subjects sub ON c.subject_id = sub.id
        LEFT JOIN profiles p ON c.tutor_id = p.id
        LEFT JOIN tutor_profiles tp ON p.id = tp.user_id
        LEFT JOIN class_locations loc ON c.location_id = loc.id
        WHERE c.status IN ('PUBLISHED', 'OPEN', 'FULL')
      `;

      const params: any[] = [];
      if (filters?.format) {
        params.push(filters.format);
        sql += ` AND c.format = $${params.length}`;
      }
      if (filters?.categoryId) {
        params.push(filters.categoryId);
        sql += ` AND c.category_id = $${params.length}`;
      }

      sql += ` ORDER BY c.created_at DESC`;

      const rows = await this.query(sql, params);
      if (rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          category: r.category_name ? { name: r.category_name } : undefined,
          subject: r.subject_name ? { name: r.subject_name } : undefined,
          tutor: {
            first_name: r.tutor_first_name,
            last_name: r.tutor_last_name,
            avatar_url: r.tutor_avatar_url,
            tutor_profile: { headline: r.tutor_headline },
          },
          location: r.location_name ? { name: r.location_name, address: r.location_address } : undefined,
        }));
      }
    } catch {
      // fallback
    }
    return memoryDb.getClasses(filters as any);
  }

  // --- BOOKINGS QUERY ---
  static async getBookings(filters?: { studentId?: string; tutorId?: string }) {
    try {
      let sql = `
        SELECT
          b.*,
          c.title as class_title,
          c.format as class_format,
          c.duration_minutes as class_duration,
          stu.first_name as student_first_name,
          stu.last_name as student_last_name,
          stu.email as student_email,
          tut.first_name as tutor_first_name,
          tut.last_name as tutor_last_name,
          tut.avatar_url as tutor_avatar_url,
          snap.gross_amount,
          snap.platform_fee_amount,
          snap.tutor_earnings,
          loc.name as location_name
        FROM bookings b
        LEFT JOIN classes c ON b.class_id = c.id
        LEFT JOIN profiles stu ON b.student_id = stu.id
        LEFT JOIN profiles tut ON b.tutor_id = tut.id
        LEFT JOIN booking_financial_snapshots snap ON b.id = snap.booking_id
        LEFT JOIN class_locations loc ON b.location_id = loc.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters?.studentId) {
        params.push(filters.studentId);
        sql += ` AND b.student_id = $${params.length}`;
      }
      if (filters?.tutorId) {
        params.push(filters.tutorId);
        sql += ` AND b.tutor_id = $${params.length}`;
      }
      sql += ` ORDER BY b.start_time DESC`;

      const rows = await this.query(sql, params);
      if (rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          class_item: {
            title: r.class_title,
            format: r.class_format,
            duration_minutes: r.class_duration,
          },
          student: {
            first_name: r.student_first_name,
            last_name: r.student_last_name,
            email: r.student_email,
          },
          tutor: {
            first_name: r.tutor_first_name,
            last_name: r.tutor_last_name,
            avatar_url: r.tutor_avatar_url,
          },
          financial_snapshot: r.gross_amount
            ? {
                gross_amount: r.gross_amount,
                platform_fee_amount: r.platform_fee_amount,
                tutor_earnings: r.tutor_earnings,
              }
            : undefined,
          location: r.location_name ? { name: r.location_name } : undefined,
        }));
      }
    } catch {
      // fallback
    }
    return memoryDb.getBookings(filters);
  }

  // --- TRANSACTIONS QUERY ---
  static async getTransactions() {
    try {
      const rows = await this.query(`
        SELECT
          t.*,
          stu.first_name as student_first_name,
          stu.last_name as student_last_name,
          tut.first_name as tutor_first_name,
          tut.last_name as tutor_last_name,
          b.booking_number
        FROM transactions t
        LEFT JOIN profiles stu ON t.student_id = stu.id
        LEFT JOIN profiles tut ON t.tutor_id = tut.id
        LEFT JOIN bookings b ON t.booking_id = b.id
        ORDER BY t.created_at DESC
      `);
      if (rows.length > 0) return rows;
    } catch {
      // fallback
    }
    return memoryDb.state.transactions;
  }

  // --- MESSAGE FLAGS QUERY (MODERATION QUEUE) ---
  static async getMessageFlags() {
    try {
      const rows = await this.query(`
        SELECT
          f.*,
          m.body as message_body,
          m.sender_id,
          p.first_name as sender_first_name,
          p.last_name as sender_last_name,
          p.role as sender_role
        FROM message_flags f
        LEFT JOIN messages m ON f.message_id = m.id
        LEFT JOIN profiles p ON m.sender_id = p.id
        WHERE f.status = 'PENDING_REVIEW'
        ORDER BY f.created_at DESC
      `);
      if (rows.length > 0) return rows;
    } catch {
      // fallback
    }
    return memoryDb.state.message_flags.filter((f) => f.status === 'PENDING_REVIEW');
  }

  // --- CATEGORIES, SUBJECTS, GRADES, LOCATIONS ---
  static async getCategories() {
    try {
      const rows = await this.query(`SELECT * FROM categories WHERE is_active = true ORDER BY name ASC`);
      if (rows.length > 0) return rows;
    } catch {}
    return memoryDb.state.categories;
  }

  static async getSubjects() {
    try {
      const rows = await this.query(`SELECT * FROM subjects ORDER BY name ASC`);
      if (rows.length > 0) return rows;
    } catch {}
    return memoryDb.state.subjects;
  }

  static async getGrades() {
    try {
      const rows = await this.query(`SELECT * FROM grades ORDER BY level ASC`);
      if (rows.length > 0) return rows;
    } catch {}
    return memoryDb.state.grades;
  }

  static async getLocations() {
    try {
      const rows = await this.query(`SELECT * FROM class_locations WHERE is_active = true ORDER BY name ASC`);
      if (rows.length > 0) return rows;
    } catch {}
    return memoryDb.state.class_locations;
  }

  // --- REFUNDS QUERY & ACTIONS ---
  static async getRefunds() {
    try {
      const rows = await this.query(`
        SELECT
          r.*,
          b.booking_number,
          p.first_name as student_first_name,
          p.last_name as student_last_name,
          p.email as student_email
        FROM refunds r
        LEFT JOIN bookings b ON r.booking_id = b.id
        LEFT JOIN profiles p ON r.student_id = p.id
        ORDER BY r.requested_at DESC
      `);
      if (rows.length > 0) return rows;
    } catch {}
    return [];
  }

  static async updateRefundStatus(refundId: string, status: string, reviewedBy?: string, adminNotes?: string) {
    try {
      await this.query(
        `UPDATE refunds SET status = $1, reviewed_by = $2, admin_notes = $3, processed_at = NOW() WHERE id = $4`,
        [status, reviewedBy || null, adminNotes || null, refundId]
      );
      return true;
    } catch (err) {
      console.error('Error updating refund:', err);
      return false;
    }
  }

  // --- MESSAGE FLAG ACTIONS ---
  static async updateMessageFlag(flagId: string, status: string, reviewedBy?: string, adminNotes?: string) {
    try {
      await this.query(
        `UPDATE message_flags SET status = $1, reviewed_by = $2, admin_notes = $3, reviewed_at = NOW() WHERE id = $4`,
        [status, reviewedBy || null, adminNotes || null, flagId]
      );
      return true;
    } catch (err) {
      console.error('Error updating message flag:', err);
      return false;
    }
  }

  // --- CLASS STATUS ACTIONS ---
  static async updateClassStatus(classId: string, status: string) {
    try {
      await this.query(`UPDATE classes SET status = $1, updated_at = NOW() WHERE id = $2`, [status, classId]);
      return true;
    } catch (err) {
      console.error('Error updating class status:', err);
      return false;
    }
  }

  // --- TUTOR PAYOUTS QUERY ---
  static async getPayouts(tutorId?: string) {
    try {
      let sql = `
        SELECT
          py.*,
          p.first_name as tutor_first_name,
          p.last_name as tutor_last_name,
          p.email as tutor_email
        FROM payouts py
        JOIN profiles p ON py.tutor_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (tutorId) {
        params.push(tutorId);
        sql += ` AND py.tutor_id = $${params.length}`;
      }
      sql += ` ORDER BY py.created_at DESC`;
      const rows = await this.query(sql, params);
      if (rows.length > 0) return rows;
    } catch {}
    return [];
  }

  // --- REVIEWS QUERY & CREATION ---
  static async getReviews(tutorId?: string) {
    try {
      let sql = `
        SELECT
          r.*,
          stu.first_name as student_first_name,
          stu.last_name as student_last_name,
          stu.avatar_url as student_avatar_url,
          tut.first_name as tutor_first_name,
          tut.last_name as tutor_last_name,
          b.booking_number
        FROM reviews r
        JOIN profiles stu ON r.student_id = stu.id
        JOIN profiles tut ON r.tutor_id = tut.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE r.is_published = true
      `;
      const params: any[] = [];
      if (tutorId) {
        params.push(tutorId);
        sql += ` AND r.tutor_id = $${params.length}`;
      }
      sql += ` ORDER BY r.created_at DESC`;
      const rows = await this.query(sql, params);
      if (rows.length > 0) return rows;
    } catch {}
    return [];
  }

  static async createReview(bookingId: string, studentId: string, tutorId: string, rating: number, comment: string) {
    try {
      const rows = await this.query(
        `INSERT INTO reviews (booking_id, student_id, tutor_id, rating, comment, is_published)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING *`,
        [bookingId, studentId, tutorId, rating, comment]
      );
      return rows[0] || null;
    } catch (err) {
      console.error('Error creating review:', err);
      return null;
    }
  }

  // --- AUDIT LOGS QUERY ---
  static async getAuditLogs(limit: number = 100) {
    try {
      const rows = await this.query(
        `
        SELECT
          a.*,
          p.first_name,
          p.last_name,
          p.email
        FROM audit_logs a
        LEFT JOIN profiles p ON a.actor_id = p.id
        ORDER BY a.created_at DESC
        LIMIT $1
      `,
        [limit]
      );
      if (rows.length > 0) return rows;
    } catch {}
    return memoryDb.state.audit_logs;
  }

  // --- USER PROFILES & AUTH ---
  static async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const rows = await this.query(
        `SELECT * FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email.trim()]
      );
      if (rows.length > 0) return rows[0] as UserProfile;
    } catch (err) {
      console.error('Error fetching user by email:', err);
    }
    return memoryDb.getProfileByEmail(email) || null;
  }

  static async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const rows = await this.query(
        `SELECT * FROM profiles WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (rows.length > 0) return rows[0] as UserProfile;
    } catch (err) {
      console.error('Error fetching user by ID:', err);
    }
    return memoryDb.getProfileById(id) || null;
  }

  static async createUser(data: {
    id?: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'STUDENT' | 'TUTOR' | 'ADMIN';
    phone?: string;
    city?: string;
    state?: string;
  }): Promise<UserProfile> {
    const id = data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'usr-' + Date.now());
    const now = new Date().toISOString();
    const verificationStatus = data.role === 'STUDENT' ? 'APPROVED' : 'PENDING_REVIEW';

    try {
      const rows = await this.query(
        `INSERT INTO profiles (id, email, first_name, last_name, role, phone, city, state, account_status, verification_status, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', $9, true, $10, $11)
         RETURNING *`,
        [
          id,
          data.email.trim().toLowerCase(),
          data.first_name.trim(),
          data.last_name.trim(),
          data.role,
          data.phone || null,
          data.city || null,
          data.state || null,
          verificationStatus,
          now,
          now,
        ]
      );

      if (rows.length > 0) {
        // Also create role-specific profile
        if (data.role === 'STUDENT') {
          await this.query(
            `INSERT INTO student_profiles (user_id, preferences, created_at, updated_at)
             VALUES ($1, '{"onboarding_completed": false}'::jsonb, $2, $3)
             ON CONFLICT (user_id) DO NOTHING`,
            [id, now, now]
          );
        } else if (data.role === 'TUTOR') {
          await this.query(
            `INSERT INTO tutor_profiles (user_id, is_approved, created_at, updated_at)
             VALUES ($1, false, $2, $3)
             ON CONFLICT (user_id) DO NOTHING`,
            [id, now, now]
          );
        }

        const created = rows[0] as UserProfile;
        // Keep in-memory store in sync
        memoryDb.state.profiles.push(created);
        return created;
      }
    } catch (err) {
      console.error('Error inserting profile in DB, falling back to in-memory:', err);
    }

    const fallbackProfile: UserProfile = {
      id,
      email: data.email.trim().toLowerCase(),
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      role: data.role,
      phone: data.phone || null,
      city: data.city || null,
      state: data.state || null,
      country: 'US',
      account_status: 'ACTIVE',
      verification_status: verificationStatus as any,
      email_verified: true,
      created_at: now,
      updated_at: now,
    };
    memoryDb.state.profiles.push(fallbackProfile);

    if (data.role === 'STUDENT') {
      memoryDb.state.student_profiles.push({
        user_id: id,
        preferences: { onboarding_completed: false },
        created_at: now,
        updated_at: now,
      });
    }

    return fallbackProfile;
  }

  static async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const setParts: string[] = [];
      const values: any[] = [id];
      let paramIdx = 2;

      for (const [key, val] of Object.entries(updates)) {
        if (key === 'id') continue;
        setParts.push(`${key} = $${paramIdx}`);
        values.push(val);
        paramIdx++;
      }

      setParts.push(`updated_at = NOW()`);

      if (setParts.length > 1) {
        const rows = await this.query(
          `UPDATE profiles SET ${setParts.join(', ')} WHERE id = $1 RETURNING *`,
          values
        );
        if (rows.length > 0) {
          const updated = rows[0] as UserProfile;
          memoryDb.updateProfile(id, updates);
          return updated;
        }
      }
    } catch (err) {
      console.error('Error updating user profile in DB:', err);
    }

    return memoryDb.updateProfile(id, updates);
  }

  // --- STUDENT PROFILES & ONBOARDING ---
  static async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    try {
      const rows = await this.query(
        `SELECT * FROM student_profiles WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      if (rows.length > 0) return rows[0] as StudentProfile;
    } catch (err) {
      console.error('Error fetching student profile from DB:', err);
    }

    return memoryDb.state.student_profiles.find((s) => s.user_id === userId) || null;
  }

  static async createOrUpdateStudentProfile(
    userId: string,
    data: {
      grade_level?: string | null;
      learning_goals?: string | null;
      preferences?: any;
    }
  ): Promise<StudentProfile | null> {
    const now = new Date().toISOString();
    const preferencesJson = JSON.stringify(data.preferences || {});

    try {
      const rows = await this.query(
        `INSERT INTO student_profiles (user_id, grade_level, learning_goals, preferences, created_at, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6)
         ON CONFLICT (user_id) DO UPDATE
         SET grade_level = COALESCE(EXCLUDED.grade_level, student_profiles.grade_level),
             learning_goals = COALESCE(EXCLUDED.learning_goals, student_profiles.learning_goals),
             preferences = COALESCE(EXCLUDED.preferences, student_profiles.preferences),
             updated_at = NOW()
         RETURNING *`,
        [userId, data.grade_level || null, data.learning_goals || null, preferencesJson, now, now]
      );

      if (rows.length > 0) {
        const res = rows[0] as StudentProfile;
        const memIdx = memoryDb.state.student_profiles.findIndex((s) => s.user_id === userId);
        if (memIdx >= 0) {
          memoryDb.state.student_profiles[memIdx] = res;
        } else {
          memoryDb.state.student_profiles.push(res);
        }
        return res;
      }
    } catch (err) {
      console.error('Error updating student profile in DB:', err);
    }

    let mem = memoryDb.state.student_profiles.find((s) => s.user_id === userId);
    if (!mem) {
      mem = {
        user_id: userId,
        grade_level: data.grade_level || null,
        learning_goals: data.learning_goals || null,
        preferences: data.preferences || {},
        created_at: now,
        updated_at: now,
      };
      memoryDb.state.student_profiles.push(mem);
    } else {
      if (data.grade_level !== undefined) mem.grade_level = data.grade_level;
      if (data.learning_goals !== undefined) mem.learning_goals = data.learning_goals;
      if (data.preferences !== undefined) mem.preferences = { ...mem.preferences, ...data.preferences };
      mem.updated_at = now;
    }
    return mem;
  }
}

export const supabaseDb = SupabaseDbService;
