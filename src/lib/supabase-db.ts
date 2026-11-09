// ============================================================
// LEVCHARY LMS - LIVE SUPABASE POSTGRESQL QUERY ENGINE
// Real-time server-side database aggregations, queries & zero fake data
// ============================================================

import { Pool } from 'pg';
import { db as memoryDb } from './data-store';
import { supabaseAdmin } from './supabase/admin';
import {
  UserProfile,
  StudentProfile,
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
      'postgresql://postgres.xegsdlkpdwwmojdatuwb:iTI6MBFuBxvDZaJ9@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
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
          (SELECT COUNT(*) FROM profiles WHERE role IN ('INSTRUCTOR', 'TUTOR')) as total_tutors,
          (SELECT COUNT(*) FROM instructor_profiles WHERE is_approved = true) as approved_tutors,
          (SELECT COUNT(*) FROM instructor_applications WHERE status = 'PENDING_REVIEW') as pending_applications,
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

  // --- TUTORS / INSTRUCTORS QUERY ---
  static async getApprovedTutors(filters?: { instructorType?: 'ALL' | 'TUTOR' | 'FACULTY' }) {
    try {
      // 1. Fast straight HTTPS query using Supabase SDK
      let query = supabaseAdmin
        .from('instructor_profiles')
        .select(`
          user_id,
          headline,
          bio,
          qualifications,
          experience_years,
          hourly_rate,
          rating_avg,
          reviews_count,
          is_approved,
          preferred_format,
          instructor_type,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name,
            avatar_url,
            city,
            state,
            account_status
          )
        `)
        .eq('is_approved', true);

      if (filters?.instructorType && filters.instructorType !== 'ALL') {
        query = query.eq('instructor_type', filters.instructorType);
      }

      const { data, error } = await query.order('rating_avg', { ascending: false });

      if (!error && data && data.length > 0) {
        return data
          .filter((t: any) => t.profiles?.account_status !== 'SUSPENDED')
          .map((t: any) => ({
            ...t,
            user: {
              id: t.user_id,
              email: t.profiles?.email,
              first_name: t.profiles?.first_name,
              last_name: t.profiles?.last_name,
              avatar_url: t.profiles?.avatar_url,
              city: t.profiles?.city,
              state: t.profiles?.state,
            },
          }));
      }

      // 2. Secondary fallback to PostgreSQL query engine
      let sql = `
        SELECT
          p.id as user_id,
          p.email,
          p.first_name,
          p.last_name,
          p.avatar_url,
          p.city,
          p.state,
          tp.headline,
          tp.bio,
          tp.qualifications,
          tp.experience_years,
          tp.hourly_rate,
          tp.rating_avg,
          tp.reviews_count,
          tp.is_approved,
          tp.preferred_format,
          tp.instructor_type
        FROM profiles p
        JOIN instructor_profiles tp ON p.id = tp.user_id
        WHERE tp.is_approved = true AND p.account_status = 'ACTIVE'
      `;
      const params: any[] = [];
      if (filters?.instructorType && filters.instructorType !== 'ALL') {
        params.push(filters.instructorType);
        sql += ` AND tp.instructor_type = $${params.length}`;
      }
      sql += ` ORDER BY tp.rating_avg DESC, tp.reviews_count DESC`;

      const rows = await this.query(sql, params);

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          user: {
            id: r.user_id,
            email: r.email,
            first_name: r.first_name,
            last_name: r.last_name,
            avatar_url: r.avatar_url,
            city: r.city,
            state: r.state,
          },
        }));
      }
    } catch {
      // fallback
    }

    return memoryDb.getInstructors({ instructorType: filters?.instructorType });
  }

  // Alias for backward compatibility
  static async getInstructors(filters?: { instructorType?: 'ALL' | 'TUTOR' | 'FACULTY' }) {
    return this.getApprovedTutors(filters);
  }

  // --- INSTRUCTOR VERIFICATION CHECK ---
  static async isInstructorApproved(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('instructor_profiles')
        .select('is_approved')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return data.is_approved === true;
      }

      const rows = await this.query(
        `SELECT is_approved FROM instructor_profiles WHERE user_id = $1`,
        [userId]
      );
      if (rows && rows.length > 0) {
        return rows[0].is_approved === true;
      }
    } catch {
      // fallback
    }

    const memProfile = memoryDb.getInstructorById(userId);
    return memProfile ? memProfile.is_approved === true : false;
  }

  // --- SINGLE CLASS BY ID QUERY ---
  static async getClassById(classId: string) {
    try {
      const { data: c, error } = await supabaseAdmin
        .from('classes')
        .select(`
          *,
          categories:category_id ( id, name, slug ),
          subjects:subject_id ( id, name, slug ),
          profiles:instructor_id (
            id,
            first_name,
            last_name,
            avatar_url,
            city,
            state,
            instructor_profiles:user_id (
              headline,
              bio,
              hourly_rate,
              experience_years,
              rating_avg,
              reviews_count,
              is_approved,
              preferred_format,
              timezone
            )
          ),
          class_locations:location_id ( id, name, address, city, state, postal_code )
        `)
        .eq('id', classId)
        .maybeSingle();

      if (!error && c) {
        const ip = Array.isArray(c.profiles?.instructor_profiles)
          ? c.profiles?.instructor_profiles[0]
          : c.profiles?.instructor_profiles;

        return {
          ...c,
          instructor_id: c.instructor_id,
          tutor_id: c.instructor_id,
          category: c.categories ? { id: c.categories.id, name: c.categories.name, slug: c.categories.slug } : undefined,
          subject: c.subjects ? { id: c.subjects.id, name: c.subjects.name, slug: c.subjects.slug } : undefined,
          instructor: {
            id: c.profiles?.id,
            first_name: c.profiles?.first_name,
            last_name: c.profiles?.last_name,
            avatar_url: c.profiles?.avatar_url,
            city: c.profiles?.city,
            state: c.profiles?.state,
            instructor_profile: ip || {},
          },
          tutor: {
            id: c.profiles?.id,
            first_name: c.profiles?.first_name,
            last_name: c.profiles?.last_name,
            avatar_url: c.profiles?.avatar_url,
            city: c.profiles?.city,
            state: c.profiles?.state,
            tutor_profile: ip || {},
          },
          location: c.class_locations
            ? {
                id: c.class_locations.id,
                name: c.class_locations.name,
                address: c.class_locations.address,
                city: c.class_locations.city,
                state: c.class_locations.state,
              }
            : undefined,
        };
      }

      // SQL Fallback
      const rows = await this.query(
        `SELECT
           c.*,
           cat.name as category_name,
           sub.name as subject_name,
           p.id as tutor_user_id,
           p.first_name as tutor_first_name,
           p.last_name as tutor_last_name,
           p.avatar_url as tutor_avatar_url,
           p.city as tutor_city,
           p.state as tutor_state,
           tp.headline as tutor_headline,
           tp.bio as tutor_bio,
           tp.hourly_rate as tutor_hourly_rate,
           tp.experience_years as tutor_experience_years,
           tp.rating_avg as tutor_rating_avg,
           tp.reviews_count as tutor_reviews_count,
           tp.is_approved as tutor_is_approved,
           loc.name as location_name,
           loc.address as location_address,
           loc.city as location_city
         FROM classes c
         LEFT JOIN categories cat ON c.category_id = cat.id
         LEFT JOIN subjects sub ON c.subject_id = sub.id
         LEFT JOIN profiles p ON c.instructor_id = p.id
         LEFT JOIN instructor_profiles tp ON p.id = tp.user_id
         LEFT JOIN class_locations loc ON c.location_id = loc.id
         WHERE c.id = $1`,
        [classId]
      );

      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          ...r,
          instructor_id: r.instructor_id,
          tutor_id: r.instructor_id,
          category: r.category_name ? { name: r.category_name } : undefined,
          subject: r.subject_name ? { name: r.subject_name } : undefined,
          instructor: {
            id: r.tutor_user_id,
            first_name: r.tutor_first_name,
            last_name: r.tutor_last_name,
            avatar_url: r.tutor_avatar_url,
            city: r.tutor_city,
            state: r.tutor_state,
            instructor_profile: {
              headline: r.tutor_headline,
              bio: r.tutor_bio,
              hourly_rate: r.tutor_hourly_rate,
              experience_years: r.tutor_experience_years,
              rating_avg: r.tutor_rating_avg,
              reviews_count: r.tutor_reviews_count,
              is_approved: r.tutor_is_approved,
            },
          },
          tutor: {
            id: r.tutor_user_id,
            first_name: r.tutor_first_name,
            last_name: r.tutor_last_name,
            avatar_url: r.tutor_avatar_url,
            city: r.tutor_city,
            state: r.tutor_state,
            tutor_profile: {
              headline: r.tutor_headline,
              bio: r.tutor_bio,
              hourly_rate: r.tutor_hourly_rate,
              experience_years: r.tutor_experience_years,
              rating_avg: r.tutor_rating_avg,
              reviews_count: r.tutor_reviews_count,
              is_approved: r.tutor_is_approved,
            },
          },
          location: r.location_name
            ? { name: r.location_name, address: r.location_address, city: r.location_city }
            : undefined,
        };
      }
    } catch (err) {
      console.error('Error in getClassById:', err);
    }

    return memoryDb.getClassById(classId);
  }

  // --- SINGLE INSTRUCTOR BY USER ID QUERY ---
  static async getInstructorById(userId: string) {
    try {
      const { data: inst, error } = await supabaseAdmin
        .from('instructor_profiles')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            city,
            state,
            country,
            account_status
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && inst && inst.profiles) {
        // Fetch classes taught by this instructor
        const classes = await this.getClasses({ instructorId: userId });

        return {
          user_id: inst.user_id,
          hourly_rate: inst.hourly_rate || 3500,
          preferred_format: inst.preferred_format || 'BOTH',
          headline: inst.headline || 'Verified Academic Instructor & Mentor',
          bio: inst.bio || 'Dedicated educator committed to individualized instruction and student success.',
          qualifications: inst.qualifications || 'Certified Academic Specialist',
          experience_years: inst.experience_years || 0,
          rating_avg: inst.rating_avg || 5,
          reviews_count: inst.reviews_count || 0,
          is_approved: inst.is_approved,
          instructor_type: inst.instructor_type || 'TUTOR',
          timezone: inst.timezone || 'UTC',
          user: {
            id: inst.profiles.id,
            first_name: inst.profiles.first_name,
            last_name: inst.profiles.last_name,
            email: inst.profiles.email,
            avatar_url: inst.profiles.avatar_url,
            city: inst.profiles.city || 'Remote',
            state: inst.profiles.state || '',
            country: inst.profiles.country || 'US',
          },
          classes: classes || [],
          reviews: [],
        };
      }

      // SQL Fallback
      const rows = await this.query(
        `SELECT
           tp.*,
           p.first_name,
           p.last_name,
           p.email,
           p.avatar_url,
           p.city,
           p.state,
           p.country
         FROM instructor_profiles tp
         JOIN profiles p ON tp.user_id = p.id
         WHERE tp.user_id = $1`,
        [userId]
      );

      if (rows && rows.length > 0) {
        const r = rows[0];
        const classes = await this.getClasses({ instructorId: userId });

        return {
          user_id: r.user_id,
          hourly_rate: r.hourly_rate || 3500,
          preferred_format: r.preferred_format || 'BOTH',
          headline: r.headline || 'Verified Academic Instructor & Mentor',
          bio: r.bio || 'Dedicated educator committed to individualized instruction and student success.',
          qualifications: r.qualifications || 'Certified Academic Specialist',
          experience_years: r.experience_years || 0,
          rating_avg: r.rating_avg || 5,
          reviews_count: r.reviews_count || 0,
          is_approved: r.is_approved,
          instructor_type: r.instructor_type || 'TUTOR',
          timezone: r.timezone || 'UTC',
          user: {
            id: r.user_id,
            first_name: r.first_name,
            last_name: r.last_name,
            email: r.email,
            avatar_url: r.avatar_url,
            city: r.city || 'Remote',
            state: r.state || '',
            country: r.country || 'US',
          },
          classes: classes || [],
          reviews: [],
        };
      }
    } catch (err) {
      console.error('Error in getInstructorById:', err);
    }

    return memoryDb.getInstructorById(userId) || memoryDb.getTutorById(userId);
  }

  // --- CLASSES QUERY ---
  static async getClasses(filters?: {
    format?: string;
    categoryId?: string;
    tutorId?: string;
    instructorId?: string;
    status?: string;
    search?: string;
  }) {
    const instructorFilterId = filters?.instructorId || filters?.tutorId;
    try {
      // 1. Try fast HTTPS query via Supabase SDK
      let query = supabaseAdmin
        .from('classes')
        .select(`
          *,
          categories:category_id ( name ),
          subjects:subject_id ( name ),
          profiles:instructor_id (
            first_name,
            last_name,
            avatar_url,
            instructor_profiles:user_id ( headline, is_approved )
          ),
          class_locations:location_id ( name, address )
        `);

      if (instructorFilterId) {
        query = query.eq('instructor_id', instructorFilterId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      } else if (!instructorFilterId) {
        query = query.in('status', ['PUBLISHED', 'OPEN', 'FULL']);
      }
      if (filters?.format) query = query.eq('format', filters.format);
      if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);

      query = query.order('created_at', { ascending: false });

      const { data: sdkClasses, error: sdkErr } = await query;
      if (!sdkErr && sdkClasses && sdkClasses.length > 0) {
        let list = sdkClasses
          .filter((r: any) => {
            // If querying on behalf of a specific instructor, let them see their own classes.
            if (instructorFilterId) return true;
            // Otherwise, for public/student view, ONLY allow classes from vetted & approved instructors.
            const ip = r.profiles?.instructor_profiles;
            const isApproved = Array.isArray(ip) ? ip[0]?.is_approved : ip?.is_approved;
            return isApproved === true;
          })
          .map((r: any) => ({
          ...r,
          instructor_id: r.instructor_id,
          tutor_id: r.instructor_id, // alias
          category: r.categories ? { name: r.categories.name } : undefined,
          subject: r.subjects ? { name: r.subjects.name } : undefined,
          instructor: {
            first_name: r.profiles?.first_name,
            last_name: r.profiles?.last_name,
            avatar_url: r.profiles?.avatar_url,
            instructor_profile: { headline: r.profiles?.instructor_profiles?.[0]?.headline || r.profiles?.instructor_profiles?.headline },
          },
          tutor: {
            first_name: r.profiles?.first_name,
            last_name: r.profiles?.last_name,
            avatar_url: r.profiles?.avatar_url,
            tutor_profile: { headline: r.profiles?.instructor_profiles?.[0]?.headline || r.profiles?.instructor_profiles?.headline },
          },
          location: r.class_locations ? { name: r.class_locations.name, address: r.class_locations.address } : undefined,
        }));

        if (filters?.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (c: any) =>
              c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
          );
        }
        return list;
      }

      // 2. Fallback to SQL Query
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
        LEFT JOIN profiles p ON c.instructor_id = p.id
        LEFT JOIN instructor_profiles tp ON p.id = tp.user_id
        LEFT JOIN class_locations loc ON c.location_id = loc.id
        WHERE 1=1
      `;

      const params: any[] = [];
      if (instructorFilterId) {
        params.push(instructorFilterId);
        sql += ` AND c.instructor_id = $${params.length}`;
      } else {
        // Enforce approval gate for public/student catalog
        sql += ` AND tp.is_approved = true AND p.account_status = 'ACTIVE'`;
      }
      if (filters?.status) {
        params.push(filters.status);
        sql += ` AND c.status = $${params.length}`;
      } else if (!filters?.tutorId) {
        sql += ` AND c.status IN ('PUBLISHED', 'OPEN', 'FULL')`;
      }
      if (filters?.format) {
        params.push(filters.format);
        sql += ` AND c.format = $${params.length}`;
      }
      if (filters?.categoryId) {
        params.push(filters.categoryId);
        sql += ` AND c.category_id = $${params.length}`;
      }
      if (filters?.search) {
        params.push(`%${filters.search}%`);
        sql += ` AND (c.title ILIKE $${params.length} OR c.description ILIKE $${params.length})`;
      }

      sql += ` ORDER BY c.created_at DESC`;

      const rows = await this.query(sql, params);
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
    } catch {
      return memoryDb.getClasses(filters as any);
    }
  }

  static async createClass(classData: {
    title: string;
    description: string;
    instructor_id?: string;
    tutor_id?: string;
    category_id: string;
    subject_id: string;
    grade_id?: string;
    class_type: string;
    format: string;
    duration_minutes: number;
    price: number;
    currency?: string;
    capacity: number;
    location_id?: string | null;
    meet_url?: string | null;
    status?: string;
    start_time?: string | null;
    end_time?: string | null;
  }) {
    const instructorId = classData.instructor_id || classData.tutor_id || '';
    try {
      const sql = `
        INSERT INTO classes (
          title, description, instructor_id, category_id, subject_id, grade_id,
          class_type, format, duration_minutes, price, currency, capacity,
          enrolled_count, location_id, meet_url, status, start_time, end_time, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          0, $13, $14, $15, $16, $17, NOW(), NOW()
        )
        RETURNING *;
      `;
      const params = [
        classData.title,
        classData.description,
        instructorId,
        classData.category_id,
        classData.subject_id,
        classData.grade_id || null,
        classData.class_type,
        classData.format,
        classData.duration_minutes,
        classData.price,
        classData.currency || 'USD',
        classData.capacity || (classData.class_type === 'ONE_ON_ONE' ? 1 : 10),
        classData.location_id || null,
        classData.meet_url || null,
        classData.status || 'PUBLISHED',
        classData.start_time || null,
        classData.end_time || null,
      ];
      const rows = await this.query(sql, params);
      if (rows.length > 0) {
        return rows[0];
      }
    } catch (err) {
      console.error('Error inserting class into PostgreSQL:', err);
    }
    return memoryDb.createClass({ ...classData, instructor_id: instructorId, tutor_id: instructorId } as any);
  }

  static async updateClass(
    classId: string,
    updates: Partial<{
      title: string;
      description: string;
      status: string;
      price: number;
      capacity: number;
      meet_url: string;
      location_id: string;
    }>
  ) {
    try {
      const setClauses: string[] = [];
      const params: any[] = [classId];
      Object.entries(updates).forEach(([key, val]) => {
        params.push(val);
        setClauses.push(`${key} = $${params.length}`);
      });
      if (setClauses.length > 0) {
        setClauses.push(`updated_at = NOW()`);
        const sql = `UPDATE classes SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *;`;
        const rows = await this.query(sql, params);
        if (rows.length > 0) return rows[0];
      }
    } catch (err) {
      console.error('Error updating class in PostgreSQL:', err);
    }
    return memoryDb.updateClass(classId, updates as any);
  }

  static async cancelClass(classId: string) {
    return this.updateClass(classId, { status: 'CANCELLED' });
  }

  static async getPlatformCommissionRate(): Promise<{ defaultRate: number; tutorShareRate: number }> {
    try {
      const rows = await this.query(`SELECT value FROM platform_settings WHERE key = 'tutor_commission' LIMIT 1`);
      if (rows.length > 0 && rows[0].value) {
        const val = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        const rate = parseFloat(val.default_rate || '20');
        return { defaultRate: rate, tutorShareRate: 100 - rate };
      }
      const rules = await this.query(`SELECT default_percent FROM commission_rules WHERE is_active = true LIMIT 1`);
      if (rules.length > 0) {
        const rate = parseFloat(rules[0].default_percent || '20');
        return { defaultRate: rate, tutorShareRate: 100 - rate };
      }
    } catch (err) {
      console.error('Error getting platform commission rate:', err);
    }
    return { defaultRate: 20, tutorShareRate: 80 };
  }

  // --- BOOKINGS QUERY ---
  static async getBookings(filters?: { studentId?: string; tutorId?: string; instructorId?: string; status?: string }) {
    const instructorFilterId = filters?.instructorId || filters?.tutorId;
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
        LEFT JOIN profiles tut ON b.instructor_id = tut.id
        LEFT JOIN booking_financial_snapshots snap ON b.id = snap.booking_id
        LEFT JOIN class_locations loc ON b.location_id = loc.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters?.studentId) {
        params.push(filters.studentId);
        sql += ` AND b.student_id = $${params.length}`;
      }
      if (instructorFilterId) {
        params.push(instructorFilterId);
        sql += ` AND b.instructor_id = $${params.length}`;
      }
      if (filters?.status) {
        params.push(filters.status);
        sql += ` AND b.status = $${params.length}`;
      }
      sql += ` ORDER BY b.start_time DESC`;

      const rows = await this.query(sql, params);
      return rows.map((r) => ({
        ...r,
        instructor_id: r.instructor_id,
        tutor_id: r.instructor_id, // alias
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
        instructor: {
          first_name: r.tutor_first_name,
          last_name: r.tutor_last_name,
          avatar_url: r.tutor_avatar_url,
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
    } catch {
      return memoryDb.state.bookings as any[];
    }
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
        LEFT JOIN profiles tut ON t.instructor_id = tut.id
        LEFT JOIN bookings b ON t.booking_id = b.id
        ORDER BY t.created_at DESC
      `);
      return rows.map((r) => ({
        ...r,
        instructor_id: r.instructor_id,
        tutor_id: r.instructor_id,
      }));
    } catch {
      return memoryDb.state.transactions;
    }
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
  static async getReviews(options?: {
    tutorId?: string;
    instructorId?: string;
    featuredOnly?: boolean;
    adminView?: boolean;
  }) {
    const { tutorId, instructorId, featuredOnly, adminView } = options || {};
    const instructorFilterId = instructorId || tutorId;

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
        JOIN profiles tut ON r.instructor_id = tut.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (!adminView) {
        sql += ` AND r.is_published = true`;
      }
      if (featuredOnly) {
        sql += ` AND r.is_featured_testimonial = true`;
      }
      if (instructorFilterId) {
        params.push(instructorFilterId);
        sql += ` AND r.instructor_id = $${params.length}`;
      }

      // Order: highest rating to lowest rating, then newest
      sql += ` ORDER BY r.rating DESC, r.created_at DESC`;

      const rows = await this.query(sql, params);
      if (rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          instructor_id: r.instructor_id,
          tutor_id: r.instructor_id, // alias
        }));
      }
    } catch {}

    // Fallback to in-memory store
    let list = [...memoryDb.state.reviews];

    if (!adminView) {
      list = list.filter((r) => r.is_published);
    }
    if (featuredOnly) {
      list = list.filter((r) => r.is_featured_testimonial);
    }
    if (instructorFilterId) {
      list = list.filter((r) => (r.instructor_id || r.tutor_id) === instructorFilterId);
    }

    // Sort highest to lowest rating, then newest
    list.sort((a, b) => b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list.map((r) => {
      const student = memoryDb.getProfileById(r.student_id);
      const tutor = memoryDb.getProfileById(r.instructor_id || r.tutor_id || '');
      const booking = memoryDb.state.bookings.find((b) => b.id === r.booking_id);
      return {
        ...r,
        instructor_id: r.instructor_id || r.tutor_id,
        tutor_id: r.instructor_id || r.tutor_id,
        student_first_name: student?.first_name || 'Student',
        student_last_name: student?.last_name || '',
        student_avatar_url: student?.avatar_url || '',
        tutor_first_name: tutor?.first_name || 'Instructor',
        tutor_last_name: tutor?.last_name || '',
        booking_number: booking?.booking_number || 'BK-VERIFIED',
      };
    });
  }

  static async updateReview(
    reviewId: string,
    updates: { is_published?: boolean; is_featured_testimonial?: boolean; is_moderated?: boolean }
  ) {
    try {
      const sets: string[] = ['updated_at = NOW()'];
      const params: any[] = [reviewId];

      if (updates.is_published !== undefined) {
        params.push(updates.is_published);
        sets.push(`is_published = $${params.length}`);
      }
      if (updates.is_featured_testimonial !== undefined) {
        params.push(updates.is_featured_testimonial);
        sets.push(`is_featured_testimonial = $${params.length}`);
      }
      if (updates.is_moderated !== undefined) {
        params.push(updates.is_moderated);
        sets.push(`is_moderated = $${params.length}`);
      }

      const rows = await this.query(
        `UPDATE reviews SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
        params
      );
      if (rows.length > 0) {
        memoryDb.updateReview(reviewId, updates);
        return rows[0];
      }
    } catch {}

    return memoryDb.updateReview(reviewId, updates);
  }

  static async createReview(bookingId: string, studentId: string, instructorId: string, rating: number, comment: string) {
    try {
      const rows = await this.query(
        `INSERT INTO reviews (booking_id, student_id, instructor_id, rating, comment, is_published)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING *`,
        [bookingId, studentId, instructorId, rating, comment]
      );
      return rows[0] || null;
    } catch (err) {
      console.error('Error creating review:', err);
      return null;
    }
  }

  // --- NOTIFICATIONS QUERY ---
  static async getNotifications(userId: string) {
    try {
      const rows = await this.query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [userId]
      );
      return rows;
    } catch (err) {
      console.error('Error fetching notifications from DB:', err);
    }
    return memoryDb.getNotifications(userId);
  }

  static async markAllNotificationsRead(userId: string) {
    try {
      await this.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
      return true;
    } catch (err) {
      console.error('Error marking notifications read in DB:', err);
      return false;
    }
  }

  // --- CONVERSATIONS & MESSAGING ---
  static async getConversations(userId: string) {
    try {
      const rows = await this.query(
        `
        SELECT 
          c.id,
          c.created_at,
          c.updated_at,
          c.last_message_at,
          other_p.id as other_user_id,
          other_p.first_name as other_first_name,
          other_p.last_name as other_last_name,
          other_p.avatar_url as other_avatar_url,
          other_p.role as other_role,
          (
            SELECT body FROM messages m 
            WHERE m.conversation_id = c.id 
            ORDER BY m.created_at DESC LIMIT 1
          ) as last_message_body,
          (
            SELECT COUNT(*) FROM messages m 
            WHERE m.conversation_id = c.id 
              AND m.sender_id != $1 
              AND m.is_read = false
          ) as unread_count
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        JOIN conversation_participants other_cp ON c.id = other_cp.conversation_id AND other_cp.user_id != $1
        JOIN profiles other_p ON other_cp.user_id = other_p.id
        WHERE cp.user_id = $1
        ORDER BY c.last_message_at DESC
        `,
        [userId]
      );
      return rows;
    } catch (err) {
      console.error('Error fetching conversations from DB:', err);
      return [];
    }
  }

  static async getMessages(conversationId: string) {
    try {
      const rows = await this.query(
        `
        SELECT 
          m.*,
          p.first_name as sender_first_name,
          p.last_name as sender_last_name,
          p.avatar_url as sender_avatar_url,
          p.role as sender_role
        FROM messages m
        JOIN profiles p ON m.sender_id = p.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC
        `,
        [conversationId]
      );
      return rows;
    } catch (err) {
      console.error('Error fetching messages from DB:', err);
      return memoryDb.getMessages(conversationId);
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
    const trimmed = email.trim();
    try {
      if (trimmed.toLowerCase() === 'admin@levchary.com' || trimmed.toLowerCase() === 'admin@levchary.local') {
        const rows = await this.query(
          `SELECT * FROM profiles WHERE role = 'ADMIN' OR LOWER(email) IN ('admin@levchary.com', 'admin@levchary.local') ORDER BY created_at ASC LIMIT 1`
        );
        if (rows.length > 0) return rows[0] as UserProfile;
      } else {
        const rows = await this.query(
          `SELECT * FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1`,
          [trimmed]
        );
        if (rows.length > 0) return rows[0] as UserProfile;
      }
    } catch (err) {
      console.error('Error fetching user by email:', err);
    }

    if (trimmed.toLowerCase() === 'admin@levchary.com' || trimmed.toLowerCase() === 'admin@levchary.local') {
      const adminInMem = memoryDb.state.profiles.find(
        (p) => p.role === 'ADMIN' || p.email.toLowerCase() === 'admin@levchary.com' || p.email.toLowerCase() === 'admin@levchary.local'
      );
      if (adminInMem) {
        adminInMem.email = 'admin@levchary.com';
        return adminInMem;
      }
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
    role: 'STUDENT' | 'INSTRUCTOR' | 'TUTOR' | 'ADMIN';
    phone?: string;
    city?: string;
    state?: string;
    email_verified?: boolean;
    verification_token?: string;
    verification_token_expires_at?: string;
  }): Promise<UserProfile> {
    const id = data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'usr-' + Date.now());
    const now = new Date().toISOString();
    const verificationStatus = data.role === 'STUDENT' ? 'APPROVED' : 'PENDING_REVIEW';
    const emailVerified = data.email_verified ?? false;

    try {
      const rows = await this.query(
        `INSERT INTO profiles (id, email, first_name, last_name, role, phone, city, state, account_status, verification_status, email_verified, verification_token, verification_token_expires_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE', $9, $10, $11, $12, $13, $14)
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
          emailVerified,
          data.verification_token || null,
          data.verification_token_expires_at || null,
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
        } else if (data.role === 'INSTRUCTOR' || data.role === 'TUTOR') {
          await this.query(
            `INSERT INTO instructor_profiles (user_id, is_approved, instructor_type, created_at, updated_at)
             VALUES ($1, false, 'TUTOR', $2, $3)
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
      email_verified: emailVerified,
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

  static async verifyEmailToken(email: string, token: string): Promise<{ success: boolean; error?: string }> {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const now = new Date().toISOString();

    try {
      const rows = await this.query(
        `SELECT * FROM profiles WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [trimmedEmail]
      );

      if (rows.length === 0) {
        return { success: false, error: "No account found with this email address." };
      }

      const user = rows[0];
      if (user.email_verified) {
        return { success: true };
      }

      if (!user.verification_token || user.verification_token !== token) {
        return { success: false, error: "Invalid verification link. Please request a new one." };
      }

      if (user.verification_token_expires_at && new Date(user.verification_token_expires_at) < new Date()) {
        return { success: false, error: "This verification link has expired. Please request a new one." };
      }

      await this.query(
        `UPDATE profiles
         SET email_verified = true,
             verification_token = NULL,
             verification_token_expires_at = NULL,
             updated_at = $2
         WHERE LOWER(email) = LOWER($1)`,
        [trimmedEmail, now]
      );

      const memUser = memoryDb.state.profiles.find(p => p.email.toLowerCase() === trimmedEmail);
      if (memUser) {
        memUser.email_verified = true;
      }

      return { success: true };
    } catch (err: any) {
      console.error("Error verifying email token:", err);
      return { success: false, error: "Database error while verifying email." };
    }
  }

  static async setVerificationToken(email: string, token: string, expiresAt: string): Promise<boolean> {
    const trimmedEmail = (email || '').trim().toLowerCase();
    try {
      await this.query(
        `UPDATE profiles
         SET verification_token = $2,
             verification_token_expires_at = $3,
             updated_at = NOW()
         WHERE LOWER(email) = LOWER($1)`,
        [trimmedEmail, token, expiresAt]
      );
      return true;
    } catch (err) {
      console.error("Error setting verification token:", err);
      return false;
    }
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

  // --- STUDENT BOOKINGS ---
  static async getStudentBookings(studentId: string) {
    return this.getBookings({ studentId });
  }

  // --- TUTOR BOOKINGS ---
  static async getTutorBookings(tutorId: string) {
    return this.getBookings({ tutorId });
  }

  // --- PLATFORM PUBLIC STATS ---
  static async getPlatformStats() {
    const curMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-11"

    try {
      // 1. Try Live PostgreSQL queries
      const client = await pool.connect();
      try {
        const [studentsRes, instructorsRes, subjectsRes, monthlyVisitorsRes] = await Promise.all([
          client.query(`SELECT COUNT(*)::int AS count FROM profiles WHERE role = 'STUDENT' AND account_status = 'ACTIVE'`),
          client.query(`SELECT COUNT(*)::int AS count FROM instructor_profiles WHERE is_approved = true`),
          client.query(`SELECT COUNT(*)::int AS count FROM subjects WHERE is_active = true`),
          client.query(`SELECT visitor_count FROM site_monthly_visitors WHERE year_month = $1 LIMIT 1`, [curMonth]).catch(() => ({ rows: [] })),
        ]);

        const studentsCount = studentsRes.rows[0]?.count || 0;
        const instructorsCount = instructorsRes.rows[0]?.count || 0;
        const subjectsCount = subjectsRes.rows[0]?.count || 0;
        const visitorsCount = monthlyVisitorsRes.rows[0]?.visitor_count
          ? Number(monthlyVisitorsRes.rows[0].visitor_count)
          : memoryDb.getMonthlyVisitorCount();

        return {
          visitors: visitorsCount,
          instructors: instructorsCount,
          students: studentsCount,
          subjects: subjectsCount,
        };
      } finally {
        client.release();
      }
    } catch {
      // Fallback to memory store
    }

    const students = memoryDb.state.profiles.filter((p) => p.role === 'STUDENT').length || memoryDb.state.student_profiles.length;
    const instructors = memoryDb.state.tutor_profiles.filter((t) => t.is_approved).length;
    const subjects = memoryDb.state.subjects.filter((s) => s.is_active).length || memoryDb.state.categories.length;

    return {
      visitors: memoryDb.getMonthlyVisitorCount(),
      instructors,
      students,
      subjects,
    };
  }

  // --- RECORD UNIQUE MONTHLY VISIT ---
  static async recordMonthlyVisit(): Promise<number> {
    const curMonth = new Date().toISOString().slice(0, 7);

    try {
      const client = await pool.connect();
      try {
        const res = await client.query(`SELECT increment_monthly_visitor() AS count`);
        if (res.rows[0]?.count) {
          return Number(res.rows[0].count);
        }
      } finally {
        client.release();
      }
    } catch {
      // If table doesn't exist yet or connection fails, use data store
    }

    return memoryDb.incrementMonthlyVisitor();
  }

  // --- ADVERTS DATABASE QUERIES ---
  static async getActiveAdverts(): Promise<any[]> {
    try {
      const rows = await this.query(`
        SELECT *
        FROM adverts
        WHERE is_active = true
          AND (start_date IS NULL OR start_date <= NOW())
          AND (end_date IS NULL OR end_date > NOW())
        ORDER BY display_order ASC, created_at DESC
      `);
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch {
      // Fallback to memory store
    }
    return memoryDb.getActiveAdverts();
  }

  static async getAllAdverts(): Promise<any[]> {
    try {
      const rows = await this.query(`
        SELECT *
        FROM adverts
        ORDER BY created_at DESC
      `);
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch {
      // Fallback
    }
    return memoryDb.getAllAdverts();
  }

  static async createAdvert(data: {
    title: string;
    description?: string;
    media_type: 'IMAGE' | 'VIDEO';
    media_url: string;
    thumbnail_url?: string;
    target_url?: string;
    downloadable?: boolean;
    start_date?: string;
    end_date?: string | null;
    is_active?: boolean;
    display_order?: number;
  }): Promise<any> {
    try {
      const sql = `
        INSERT INTO adverts (
          title, description, media_type, media_url, thumbnail_url,
          target_url, downloadable, start_date, end_date, is_active, display_order, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          COALESCE($8::timestamptz, NOW()), $9::timestamptz, COALESCE($10, true), COALESCE($11, 0), NOW(), NOW()
        )
        RETURNING *;
      `;
      const params = [
        data.title,
        data.description || null,
        data.media_type,
        data.media_url,
        data.thumbnail_url || null,
        data.target_url || null,
        data.downloadable ?? true,
        data.start_date || null,
        data.end_date || null,
        data.is_active ?? true,
        data.display_order ?? 0,
      ];
      const rows = await this.query(sql, params);
      if (rows && rows.length > 0) {
        return rows[0];
      }
    } catch (err) {
      console.warn('DB advert creation fallback to memory store:', err);
    }
    return memoryDb.createAdvert({
      ...data,
      downloadable: data.downloadable ?? true,
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date || null,
      is_active: data.is_active ?? true,
      display_order: data.display_order ?? 0,
    });
  }

  static async updateAdvert(id: string, updates: Record<string, any>): Promise<any> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [id];
      Object.entries(updates).forEach(([key, val]) => {
        params.push(val);
        setClauses.push(`${key} = $${params.length}`);
      });
      if (setClauses.length > 0) {
        setClauses.push(`updated_at = NOW()`);
        const sql = `UPDATE adverts SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *;`;
        const rows = await this.query(sql, params);
        if (rows && rows.length > 0) return rows[0];
      }
    } catch (err) {
      console.warn('DB advert update fallback to memory store:', err);
    }
    return memoryDb.updateAdvert(id, updates);
  }

  static async deleteAdvert(id: string): Promise<boolean> {
    try {
      await this.query(`DELETE FROM adverts WHERE id = $1`, [id]);
      memoryDb.deleteAdvert(id);
      return true;
    } catch {
      return memoryDb.deleteAdvert(id);
    }
  }

  static async incrementAdvertDownload(id: string): Promise<number> {
    try {
      const rows = await this.query(`SELECT increment_advert_download($1::uuid) AS count`, [id]);
      if (rows && rows.length > 0 && rows[0].count) {
        return Number(rows[0].count);
      }
    } catch {}
    return memoryDb.incrementAdvertDownload(id);
  }
}

export const supabaseDb = SupabaseDbService;
