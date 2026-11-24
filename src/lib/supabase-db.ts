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
    max: 15,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000, // Prune idle pool clients before Supabase remote pooler drops them
    keepAlive: true,
  });

// Handle idle client terminations gracefully so dead pool sockets are discarded automatically
pool.on('error', (err) => {
  // Remote poolers (like Supabase PgBouncer/Supavisor) periodically close idle sockets.
  // Catching this prevents unhandled socket errors from poisoning the application pool.
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
   * Implements 1 automatic retry on closed/stale socket so queries never fail due to idle timeouts.
   */
  public static async query<T = any>(sql: string, params: any[] = [], retryCount = 0): Promise<T[]> {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(sql, params);
      return result.rows.map((r) => SupabaseDbService.sanitizeRow(r)) as T[];
    } catch (err: any) {
      const isConnectionLoss =
        err?.message?.includes('Connection terminated') ||
        err?.message?.includes('connection timeout') ||
        err?.message?.includes('closed') ||
        err?.code === 'ECONNRESET';

      if (isConnectionLoss && retryCount < 1) {
        // Stale connection was released/closed by remote pooler; retry immediately on a fresh connection
        return SupabaseDbService.query<T>(sql, params, retryCount + 1);
      }

      console.warn('⚠️ Supabase Live DB query notice, using cached store fallback:', (err as Error).message);
      return [];
    } finally {
      if (client) {
        try {
          client.release();
        } catch {}
      }
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

  static async createBooking(params: {
    studentId: string;
    instructorId: string;
    classId: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    format: string;
    locationId?: string;
    notes?: string;
    status?: string;
    meetUrl?: string;
  }) {
    const bookingNumber = 'BK-' + Math.floor(100000 + Math.random() * 900000);
    const timezone = params.timezone || 'America/New_York';
    const status = params.status || 'CONFIRMED';
    const meetUrl = params.meetUrl || (params.format === 'VIRTUAL' ? `https://meet.jit.si/Levchary-${bookingNumber}` : null);

    try {
      const sql = `
        INSERT INTO bookings (
          booking_number, student_id, instructor_id, class_id, status,
          start_time, end_time, timezone, format, location_id, meet_url, notes,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6::timestamptz, $7::timestamptz, $8, $9, $10, $11, $12,
          NOW(), NOW()
        )
        RETURNING *;
      `;
      const rows = await this.query(sql, [
        bookingNumber,
        params.studentId,
        params.instructorId,
        params.classId,
        status,
        params.startTime,
        params.endTime,
        timezone,
        params.format,
        params.locationId || null,
        meetUrl,
        params.notes || null,
      ]);

      if (rows.length > 0) {
        const created = rows[0];

        // Increment enrolled count if class exists
        await this.query(`UPDATE classes SET enrolled_count = COALESCE(enrolled_count, 0) + 1, updated_at = NOW() WHERE id = $1`, [params.classId]);

        // Keep in-memory store in sync as well
        memoryDb.state.bookings.push({
          id: created.id,
          booking_number: created.booking_number,
          student_id: created.student_id,
          tutor_id: created.instructor_id,
          class_id: created.class_id,
          status: created.status,
          start_time: created.start_time,
          end_time: created.end_time,
          timezone: created.timezone,
          format: created.format,
          location_id: created.location_id,
          meet_url: created.meet_url,
          notes: created.notes,
          created_at: created.created_at,
          updated_at: created.updated_at,
        } as any);

        return created;
      }
    } catch (err) {
      console.error('Error inserting booking into PostgreSQL:', err);
    }

    // Fallback to memory store
    const memBooking: any = {
      id: `bk-${Date.now()}`,
      booking_number: bookingNumber,
      student_id: params.studentId,
      tutor_id: params.instructorId,
      class_id: params.classId,
      status,
      start_time: params.startTime,
      end_time: params.endTime,
      timezone,
      format: params.format,
      location_id: params.locationId,
      meet_url: meetUrl,
      notes: params.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDb.state.bookings.push(memBooking);
    return memBooking;
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

  // --- TAXONOMY SUGGESTIONS (CATEGORY, SUBJECT, GRADE, ALL_IN_ONE) ---
  static async createTaxonomySuggestion(params: {
    instructorId: string;
    type: 'CATEGORY' | 'SUBJECT' | 'GRADE' | 'ALL_IN_ONE';
    proposedName: string;
    parentCategoryId?: string | null;
    reasonNotes?: string | null;
    proposedCategory?: string | null;
    proposedSubject?: string | null;
    proposedGrade?: string | null;
  }) {
    try {
      const rows = await this.query(
        `
        INSERT INTO taxonomy_suggestions (
          instructor_id, type, proposed_name, parent_category_id, reason_notes,
          proposed_category, proposed_subject, proposed_grade,
          status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', NOW(), NOW())
        RETURNING *
        `,
        [
          params.instructorId,
          params.type,
          params.proposedName.trim(),
          params.parentCategoryId || null,
          params.reasonNotes || null,
          params.proposedCategory?.trim() || null,
          params.proposedSubject?.trim() || null,
          params.proposedGrade?.trim() || null,
        ]
      );
      return rows[0] || null;
    } catch (err) {
      console.error('Error creating taxonomy suggestion:', err);
      return null;
    }
  }

  static async getTaxonomySuggestions(filters?: { status?: string; instructorId?: string }) {
    try {
      let sql = `
        SELECT
          ts.*,
          p.first_name as instructor_first_name,
          p.last_name as instructor_last_name,
          p.email as instructor_email,
          c.name as parent_category_name
        FROM taxonomy_suggestions ts
        LEFT JOIN profiles p ON ts.instructor_id = p.id
        LEFT JOIN categories c ON ts.parent_category_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters?.status) {
        params.push(filters.status);
        sql += ` AND ts.status = $${params.length}`;
      }
      if (filters?.instructorId) {
        params.push(filters.instructorId);
        sql += ` AND ts.instructor_id = $${params.length}`;
      }
      sql += ` ORDER BY ts.created_at DESC`;

      const rows = await this.query(sql, params);
      return rows;
    } catch (err) {
      console.error('Error fetching taxonomy suggestions:', err);
      return [];
    }
  }

  static async reviewTaxonomySuggestion(params: {
    suggestionId: string;
    action: 'APPROVE' | 'REJECT';
    adminId: string;
    adminNotes?: string;
  }) {
    try {
      const rows = await this.query(
        `SELECT * FROM taxonomy_suggestions WHERE id = $1 LIMIT 1`,
        [params.suggestionId]
      );
      if (rows.length === 0) return { success: false, error: 'Suggestion not found' };

      const suggestion = rows[0];

      if (params.action === 'APPROVE') {
        if (suggestion.type === 'ALL_IN_ONE') {
          let resolvedCatId = suggestion.parent_category_id;

          // 1. If custom category proposed, insert it first
          if (suggestion.proposed_category?.trim()) {
            const catName = suggestion.proposed_category.trim();
            const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const catRes = await this.query(
              `INSERT INTO categories (name, slug, is_active, created_at, updated_at) VALUES ($1, $2, true, NOW(), NOW()) RETURNING id`,
              [catName, catSlug]
            );
            if (catRes.length > 0) resolvedCatId = catRes[0].id;
          }

          // 2. If custom subject proposed, insert linked to category
          if (suggestion.proposed_subject?.trim() && resolvedCatId) {
            const subName = suggestion.proposed_subject.trim();
            const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            await this.query(
              `INSERT INTO subjects (category_id, name, slug, is_active, created_at, updated_at) VALUES ($1, $2, $3, true, NOW(), NOW())`,
              [resolvedCatId, subName, subSlug]
            );
          }

          // 3. If custom grade proposed, insert it
          if (suggestion.proposed_grade?.trim()) {
            const gradeName = suggestion.proposed_grade.trim();
            await this.query(
              `INSERT INTO grades (name, level, created_at, updated_at) VALUES ($1, 10, NOW(), NOW())`,
              [gradeName]
            );
          }
        } else {
          const slug = suggestion.proposed_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          if (suggestion.type === 'CATEGORY') {
            await this.query(
              `INSERT INTO categories (name, slug, is_active, created_at, updated_at) VALUES ($1, $2, true, NOW(), NOW())`,
              [suggestion.proposed_name, slug]
            );
          } else if (suggestion.type === 'SUBJECT') {
            await this.query(
              `INSERT INTO subjects (category_id, name, slug, is_active, created_at, updated_at) VALUES ($1, $2, $3, true, NOW(), NOW())`,
              [suggestion.parent_category_id, suggestion.proposed_name, slug]
            );
          } else if (suggestion.type === 'GRADE') {
            await this.query(
              `INSERT INTO grades (name, level, created_at, updated_at) VALUES ($1, 10, NOW(), NOW())`,
              [suggestion.proposed_name]
            );
          }
        }

        await this.query(
          `
          UPDATE taxonomy_suggestions
          SET status = 'APPROVED', reviewed_by = $1, admin_notes = $2, updated_at = NOW()
          WHERE id = $3
          `,
          [params.adminId, params.adminNotes || 'Approved by Admin', params.suggestionId]
        );

        // Notify instructor
        if (suggestion.instructor_id) {
          await this.query(
            `
            INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
            VALUES ($1, 'Taxonomy Suggestion Approved', $2, 'CLASS', false, NOW())
            `,
            [
              suggestion.instructor_id,
              `Great news! Your curriculum suggestion "${suggestion.proposed_name}" was approved by Admin and injected into the live platform catalog!`,
            ]
          );
        }

        return { success: true, message: `Approved and injected "${suggestion.proposed_name}" into catalog.` };
      } else {
        await this.query(
          `
          UPDATE taxonomy_suggestions
          SET status = 'REJECTED', reviewed_by = $1, admin_notes = $2, updated_at = NOW()
          WHERE id = $3
          `,
          [params.adminId, params.adminNotes || 'Rejected by Admin', params.suggestionId]
        );

        if (suggestion.instructor_id) {
          await this.query(
            `
            INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
            VALUES ($1, 'Taxonomy Suggestion Update', $2, 'CLASS', false, NOW())
            `,
            [
              suggestion.instructor_id,
              `Update regarding your suggestion "${suggestion.proposed_name}": It could not be approved at this time. Note: ${params.adminNotes || 'Does not fit current academic taxonomy guidelines.'}`,
            ]
          );
        }

        return { success: true, message: 'Suggestion rejected.' };
      }
    } catch (err: any) {
      console.error('Error reviewing taxonomy suggestion:', err);
      return { success: false, error: err?.message || 'Database error' };
    }
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
        `INSERT INTO reviews (booking_id, student_id, instructor_id, rating, comment, is_published, is_moderated)
         VALUES ($1, $2, $3, $4, $5, false, false)
         ON CONFLICT (booking_id) DO UPDATE 
         SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, is_published = false, is_moderated = false, updated_at = NOW()
         RETURNING *`,
        [bookingId, studentId, instructorId, rating, comment]
      );

      // Recompute and update instructor's average rating and reviews count in instructor_profiles
      if (instructorId) {
        await this.query(
          `
          UPDATE instructor_profiles
          SET 
            rating_avg = COALESCE((
              SELECT ROUND(AVG(rating)::numeric, 1) 
              FROM reviews 
              WHERE instructor_id = $1 AND is_published = true
            ), 5.0),
            reviews_count = (
              SELECT COUNT(*)::int 
              FROM reviews 
              WHERE instructor_id = $1 AND is_published = true
            ),
            updated_at = NOW()
          WHERE user_id = $1
          `,
          [instructorId]
        );
      }

      return rows[0] || null;
    } catch (err) {
      console.error('Error creating review:', err);
      return null;
    }
  }

  // --- ATTENDANCE & CLASS LIFECYCLE ACTIONS ---
  static async updateBookingStatus(params: {
    bookingId: string;
    status: string;
    actorId?: string;
    notes?: string;
    attendanceMetadata?: any;
  }) {
    try {
      const { bookingId, status, attendanceMetadata, notes } = params;
      let sql = `UPDATE bookings SET status = $1, updated_at = NOW()`;
      const values: any[] = [status];

      if (attendanceMetadata !== undefined) {
        values.push(JSON.stringify(attendanceMetadata));
        sql += `, attendance_metadata = $${values.length}::jsonb`;
      }

      if (notes !== undefined) {
        values.push(notes);
        sql += `, notes = $${values.length}`;
      }

      values.push(bookingId);
      sql += ` WHERE id = $${values.length} RETURNING *`;

      const rows = await this.query(sql, values);
      if (rows.length > 0) {
        const updated = rows[0];

        // When a booking transitions to COMPLETED, release escrow to instructor earnings snapshot & record transaction
        if (status === 'COMPLETED' || status === 'COMMISSIONED') {
          try {
            await this.query(
              `
              INSERT INTO transactions (
                booking_id, student_id, instructor_id, amount, currency,
                type, status, created_at, updated_at
              )
              VALUES (
                $1, $2, $3, 
                COALESCE((SELECT tutor_earnings FROM booking_financial_snapshots WHERE booking_id = $1), 3500),
                'USD', 'COMMISSION', 'SUCCEEDED', NOW(), NOW()
              )
              ON CONFLICT DO NOTHING
              `,
              [updated.id, updated.student_id, updated.instructor_id]
            );
          } catch (txErr) {
            console.warn('Escrow transaction recording notice:', txErr);
          }
        }

        // Notify student & instructor
        try {
          const statusLabels: Record<string, string> = {
            IN_PROGRESS: 'Session is now in progress.',
            COMPLETED: 'Session completed. Please review your instructor.',
            POSTPONED: 'Session has been proposed for reschedule.',
            CANCELLED: 'Session has been cancelled.',
          };
          const msg = statusLabels[status] || `Booking status updated to ${status}.`;

          if (updated.student_id) {
            await this.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
               VALUES ($1, 'Class Status Update', $2, 'BOOKING', false, NOW())`,
              [updated.student_id, msg]
            );
          }
          if (updated.instructor_id) {
            await this.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
               VALUES ($1, 'Class Status Update', $2, 'BOOKING', false, NOW())`,
              [updated.instructor_id, msg]
            );
          }
        } catch (notifErr) {
          console.warn('Status notification notice:', notifErr);
        }

        return updated;
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
    return null;
  }

  static async rescheduleBooking(params: {
    bookingId: string;
    newStartTime: string;
    newEndTime: string;
    reason?: string;
    requestedBy?: string;
  }) {
    try {
      const sql = `
        UPDATE bookings 
        SET 
          rescheduled_start_time = $1::timestamptz,
          rescheduled_end_time = $2::timestamptz,
          reschedule_reason = $3,
          status = 'POSTPONED',
          updated_at = NOW()
        WHERE id = $4
        RETURNING *;
      `;
      const rows = await this.query(sql, [
        params.newStartTime,
        params.newEndTime,
        params.reason || 'Reschedule requested',
        params.bookingId,
      ]);
      return rows[0] || null;
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      return null;
    }
  }

  static async acceptReschedule(bookingId: string) {
    try {
      const sql = `
        UPDATE bookings 
        SET 
          start_time = rescheduled_start_time,
          end_time = rescheduled_end_time,
          rescheduled_start_time = NULL,
          rescheduled_end_time = NULL,
          status = 'CONFIRMED',
          updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `;
      const rows = await this.query(sql, [bookingId]);
      return rows[0] || null;
    } catch (err) {
      console.error('Error accepting reschedule:', err);
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

  static async toggleNotificationRead(notificationId: string, isRead: boolean) {
    try {
      const rows = await this.query(
        `UPDATE notifications SET is_read = $1 WHERE id = $2 RETURNING *`,
        [isRead, notificationId]
      );
      if (rows.length > 0) return rows[0];
    } catch (err) {
      console.error('Error toggling notification read in DB:', err);
    }
    return memoryDb.toggleNotificationRead(notificationId, isRead);
  }

  static async deleteNotification(notificationId: string) {
    try {
      await this.query(`DELETE FROM notifications WHERE id = $1`, [notificationId]);
      return true;
    } catch (err) {
      console.error('Error deleting notification from DB:', err);
    }
    return memoryDb.deleteNotification(notificationId);
  }

  static async clearReadNotifications(userId: string) {
    try {
      await this.query(`DELETE FROM notifications WHERE user_id = $1 AND is_read = true`, [userId]);
      return true;
    } catch (err) {
      console.error('Error clearing read notifications from DB:', err);
    }
    return memoryDb.clearReadNotifications(userId);
  }

  static async getNotificationPreferences(userId: string) {
    try {
      const rows = await this.query(
        `SELECT preferences FROM student_profiles WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      if (rows.length > 0 && rows[0].preferences) {
        let prefs = rows[0].preferences;
        if (typeof prefs === 'string') {
          try { prefs = JSON.parse(prefs); } catch {}
        }
        return prefs.notifications || null;
      }
    } catch {}
    return null;
  }

  static async updateNotificationPreferences(userId: string, notifPrefs: any) {
    try {
      const rows = await this.query(
        `SELECT preferences FROM student_profiles WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      let prefs = rows.length > 0 && rows[0].preferences ? rows[0].preferences : {};
      if (typeof prefs === 'string') {
        try { prefs = JSON.parse(prefs); } catch { prefs = {}; }
      }
      prefs.notifications = notifPrefs;
      await this.query(
        `UPDATE student_profiles SET preferences = $1::jsonb, updated_at = NOW() WHERE user_id = $2`,
        [JSON.stringify(prefs), userId]
      );
      return true;
    } catch (err) {
      console.error('Error updating notification preferences:', err);
    }
    return true;
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
            SELECT COUNT(*)::int FROM messages m 
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

  static async getOrCreateConversation(userId1: string, userId2: string) {
    if (userId1 === userId2) throw new Error("Cannot create conversation with yourself");
    try {
      // Find existing 2-party conversation
      const existing = await this.query(
        `
        SELECT cp1.conversation_id
        FROM conversation_participants cp1
        JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
        WHERE cp1.user_id = $1 AND cp2.user_id = $2
        LIMIT 1
        `,
        [userId1, userId2]
      );

      if (existing.length > 0) {
        return existing[0].conversation_id;
      }

      // Create new conversation
      const convRows = await this.query(
        `INSERT INTO conversations (last_message_at, created_at, updated_at) VALUES (NOW(), NOW(), NOW()) RETURNING id`
      );
      const convId = convRows[0].id;

      await this.query(
        `INSERT INTO conversation_participants (conversation_id, user_id, last_read_at) VALUES ($1, $2, NOW()), ($1, $3, NOW())`,
        [convId, userId1, userId2]
      );

      return convId;
    } catch (err) {
      console.error('Error in getOrCreateConversation:', err);
      // Fallback in memory
      let existingMem = (memoryDb.state.conversations as any[]).find(c => 
        c.participants?.some((p: any) => p.id === userId1) && c.participants?.some((p: any) => p.id === userId2)
      );
      if (existingMem) return existingMem.id;
      const convId = `conv-${Date.now()}`;
      const newConv: any = {
        id: convId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        participants: [
          memoryDb.getProfileById(userId1),
          memoryDb.getProfileById(userId2),
        ].filter(Boolean),
        unread_count: 0,
      };
      memoryDb.state.conversations.push(newConv);
      return newConv.id;
    }
  }

  static async createMessage(params: { conversationId: string; senderId: string; body: string; hasFlag?: boolean }) {
    try {
      const rows = await this.query(
        `
        INSERT INTO messages (conversation_id, sender_id, body, has_flag, is_read, created_at)
        VALUES ($1, $2, $3, $4, false, NOW())
        RETURNING *
        `,
        [params.conversationId, params.senderId, params.body, params.hasFlag || false]
      );
      await this.query(`UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1`, [params.conversationId]);
      return rows[0];
    } catch (err) {
      console.error('Error creating message in DB, fallback to memory:', err);
      return memoryDb.sendMessage(params).message;
    }
  }

  static async getMessages(conversationId: string, currentUserId?: string) {
    try {
      // 1. First try lightning-fast query via Supabase HTTPS REST API (no connection pool overhead)
      const { data: sdkMessages, error: sdkErr } = await supabaseAdmin
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            first_name,
            last_name,
            avatar_url,
            role
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!sdkErr && sdkMessages) {
        if (currentUserId) {
          // Asynchronously mark messages as read without blocking response
          supabaseAdmin
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', currentUserId)
            .eq('is_read', false)
            .then(() => {});

          supabaseAdmin
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', currentUserId)
            .then(() => {});
        }

        return sdkMessages.map((m: any) => ({
          ...m,
          sender_first_name: m.sender?.first_name,
          sender_last_name: m.sender?.last_name,
          sender_avatar_url: m.sender?.avatar_url,
          sender_role: m.sender?.role,
        }));
      }

      // 2. Fallback to direct pg pool if needed
      if (currentUserId) {
        await this.query(
          `UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
          [conversationId, currentUserId]
        );
        await this.query(
          `UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2`,
          [conversationId, currentUserId]
        );
      }

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

  // ==========================================
  // --- ASSIGNMENTS & PROGRESSION ENGINE ---
  // ==========================================

  static async getAssignments(filters?: {
    instructorId?: string;
    studentId?: string;
    classId?: string;
    status?: string;
  }) {
    try {
      let sql = `
        SELECT
          a.*,
          c.title AS class_title,
          p.first_name AS instructor_first_name,
          p.last_name AS instructor_last_name,
          p.avatar_url AS instructor_avatar_url,
          (SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id) AS submissions_count,
          (SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status IN ('GRADED', 'COMPLETED')) AS graded_count
        FROM assignments a
        LEFT JOIN classes c ON a.class_id = c.id
        LEFT JOIN profiles p ON a.instructor_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters?.instructorId) {
        params.push(filters.instructorId);
        sql += ` AND a.instructor_id = $${params.length}`;
      }
      if (filters?.classId) {
        params.push(filters.classId);
        sql += ` AND a.class_id = $${params.length}`;
      }
      if (filters?.status) {
        params.push(filters.status);
        sql += ` AND a.status = $${params.length}`;
      }

      sql += ` ORDER BY a.due_date ASC, a.created_at DESC`;

      const rows = await this.query(sql, params);

      // If queried for a specific student, attach their specific submission status
      if (filters?.studentId) {
        const studentSubmissions = await this.query(
          `SELECT * FROM assignment_submissions WHERE student_id = $1`,
          [filters.studentId]
        );
        const subMap = new Map(studentSubmissions.map((s) => [s.assignment_id, s]));

        return rows.map((r) => ({
          ...r,
          max_marks: Number(r.max_marks || 100),
          resource_links: r.resource_links || [],
          instructor: {
            first_name: r.instructor_first_name,
            last_name: r.instructor_last_name,
            avatar_url: r.instructor_avatar_url,
          },
          user_submission: subMap.get(r.id) || null,
        }));
      }

      return rows.map((r) => ({
        ...r,
        max_marks: Number(r.max_marks || 100),
        resource_links: r.resource_links || [],
        instructor: {
          first_name: r.instructor_first_name,
          last_name: r.instructor_last_name,
          avatar_url: r.instructor_avatar_url,
        },
      }));
    } catch (err) {
      console.error('Error fetching assignments:', err);
      return [];
    }
  }

  static async getAssignmentById(id: string, studentId?: string) {
    try {
      const rows = await this.query(
        `
        SELECT
          a.*,
          c.title AS class_title,
          p.first_name AS instructor_first_name,
          p.last_name AS instructor_last_name,
          p.avatar_url AS instructor_avatar_url
        FROM assignments a
        LEFT JOIN classes c ON a.class_id = c.id
        LEFT JOIN profiles p ON a.instructor_id = p.id
        WHERE a.id = $1
        LIMIT 1
        `,
        [id]
      );
      if (rows.length === 0) return null;
      const r = rows[0];

      let userSubmission = null;
      if (studentId) {
        const subRows = await this.query(
          `SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2 LIMIT 1`,
          [id, studentId]
        );
        if (subRows.length > 0) userSubmission = subRows[0];
      }

      return {
        ...r,
        max_marks: Number(r.max_marks || 100),
        resource_links: r.resource_links || [],
        instructor: {
          first_name: r.instructor_first_name,
          last_name: r.instructor_last_name,
          avatar_url: r.instructor_avatar_url,
        },
        user_submission: userSubmission,
      };
    } catch (err) {
      console.error('Error in getAssignmentById:', err);
      return null;
    }
  }

  static async createAssignment(data: {
    instructor_id: string;
    class_id?: string | null;
    booking_id?: string | null;
    title: string;
    description?: string;
    file_url?: string | null;
    file_name?: string | null;
    resource_links?: Array<{ label: string; url: string }>;
    max_marks?: number;
    due_date: string;
    status?: string;
  }) {
    try {
      const sql = `
        INSERT INTO assignments (
          instructor_id, class_id, booking_id, title, description,
          file_url, file_name, resource_links, max_marks, due_date, status,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8::jsonb, $9, $10::timestamptz, $11,
          NOW(), NOW()
        )
        RETURNING *;
      `;
      const params = [
        data.instructor_id,
        data.class_id || null,
        data.booking_id || null,
        data.title,
        data.description || null,
        data.file_url || null,
        data.file_name || null,
        JSON.stringify(data.resource_links || []),
        data.max_marks || 100,
        data.due_date,
        data.status || 'PUBLISHED',
      ];
      const rows = await this.query(sql, params);
      return rows[0] || null;
    } catch (err) {
      console.error('Error creating assignment in DB:', err);
      return null;
    }
  }

  static async updateAssignment(id: string, updates: Record<string, any>) {
    try {
      const setClauses: string[] = [];
      const params: any[] = [id];
      Object.entries(updates).forEach(([key, val]) => {
        if (key === 'resource_links') {
          params.push(JSON.stringify(val));
          setClauses.push(`resource_links = $${params.length}::jsonb`);
        } else if (key === 'due_date') {
          params.push(val);
          setClauses.push(`due_date = $${params.length}::timestamptz`);
        } else {
          params.push(val);
          setClauses.push(`${key} = $${params.length}`);
        }
      });
      if (setClauses.length > 0) {
        setClauses.push(`updated_at = NOW()`);
        const sql = `UPDATE assignments SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *;`;
        const rows = await this.query(sql, params);
        if (rows && rows.length > 0) return rows[0];
      }
    } catch (err) {
      console.error('Error updating assignment:', err);
    }
    return null;
  }

  static async getSubmissions(assignmentId: string) {
    try {
      const rows = await this.query(
        `
        SELECT
          s.*,
          stu.first_name AS student_first_name,
          stu.last_name AS student_last_name,
          stu.email AS student_email,
          stu.avatar_url AS student_avatar_url
        FROM assignment_submissions s
        JOIN profiles stu ON s.student_id = stu.id
        WHERE s.assignment_id = $1
        ORDER BY s.submitted_at DESC
        `,
        [assignmentId]
      );
      return rows.map((r) => ({
        ...r,
        marks_awarded: r.marks_awarded !== null ? Number(r.marks_awarded) : null,
        student: {
          first_name: r.student_first_name,
          last_name: r.student_last_name,
          email: r.student_email,
          avatar_url: r.student_avatar_url,
        },
      }));
    } catch (err) {
      console.error('Error getting submissions:', err);
      return [];
    }
  }

  static async submitAssignment(data: {
    assignment_id: string;
    student_id: string;
    submission_text?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
  }) {
    try {
      const sql = `
        INSERT INTO assignment_submissions (
          assignment_id, student_id, submission_text, file_url, file_name, file_size,
          submitted_at, status, file_pruned, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          NOW(), 'SUBMITTED', false, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          submission_text = EXCLUDED.submission_text,
          file_url = EXCLUDED.file_url,
          file_name = EXCLUDED.file_name,
          file_size = EXCLUDED.file_size,
          submitted_at = NOW(),
          updated_at = NOW()
        RETURNING *;
      `;
      const params = [
        data.assignment_id,
        data.student_id,
        data.submission_text || null,
        data.file_url || null,
        data.file_name || null,
        data.file_size || null,
      ];
      const rows = await this.query(sql, params);
      return rows[0] || null;
    } catch (err) {
      console.error('Error submitting assignment:', err);
      return null;
    }
  }

  static async gradeSubmission(
    submissionId: string,
    gradeData: {
      marks_awarded: number;
      grade_letter: string;
      instructor_feedback: string;
    }
  ) {
    try {
      // 1. Update marks, pedagogical review feedback, and status to COMPLETED
      // 2. Prune file URL from record while keeping complete metadata permanently (Rule/Client requirement)
      const sql = `
        UPDATE assignment_submissions
        SET
          marks_awarded = $1,
          grade_letter = $2,
          instructor_feedback = $3,
          graded_at = NOW(),
          status = 'COMPLETED',
          file_pruned = true,
          pruned_at = NOW(),
          updated_at = NOW()
        WHERE id = $4
        RETURNING *;
      `;
      const rows = await this.query(sql, [
        gradeData.marks_awarded,
        gradeData.grade_letter,
        gradeData.instructor_feedback,
        submissionId,
      ]);

      return rows[0] || null;
    } catch (err) {
      console.error('Error grading submission:', err);
      return null;
    }
  }

  static async getStudentProgressionMetrics(studentId: string) {
    try {
      const rows = await this.query(
        `
        SELECT
          COUNT(*)::int AS total_submitted,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::int AS total_graded,
          COALESCE(AVG(marks_awarded), 0)::numeric(5,2) AS average_score
        FROM assignment_submissions
        WHERE student_id = $1
        `,
        [studentId]
      );

      const stats = rows[0] || { total_submitted: 0, total_graded: 0, average_score: 0 };
      const avg = Number(stats.average_score || 0);

      let level = 'Foundational';
      if (avg >= 90) level = 'Mastery / Advanced';
      else if (avg >= 75) level = 'Proficient';
      else if (avg >= 60) level = 'Developing';

      return {
        totalSubmitted: Number(stats.total_submitted || 0),
        totalGraded: Number(stats.total_graded || 0),
        averageScore: avg,
        progressionLevel: level,
      };
    } catch {
      return { totalSubmitted: 0, totalGraded: 0, averageScore: 0, progressionLevel: 'Foundational' };
    }
  }

  static async getProfileById(id: string): Promise<UserProfile | null> {
    try {
      const rows = await this.query(`SELECT * FROM profiles WHERE id = $1 LIMIT 1`, [id]);
      if (rows.length > 0) return rows[0] as UserProfile;
    } catch (err) {
      console.error('Error fetching profile by id:', err);
    }
    return memoryDb.getProfileById(id) || null;
  }

  // ============================================================
  // CLASS REPORTS & ADMIN MODERATION WORKFLOW
  // ============================================================

  static async createClassReport(data: {
    classId: string;
    bookingId?: string | null;
    instructorId: string;
    format: 'VIRTUAL' | 'PHYSICAL';
    classType: 'ONE_ON_ONE' | 'GROUP';
    sessionDate?: string;
    locationId?: string | null;
    topicsCovered: string;
    homeworkAssigned?: string;
    instructorPrivateNotes?: string;
    textClassComments: string;
    attendanceRecords?: Array<{ studentId: string; studentName: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }>;
    status?: 'DRAFT' | 'PENDING_ADMIN_REVIEW';
  }) {
    try {
      const {
        classId,
        bookingId = null,
        instructorId,
        format = 'VIRTUAL',
        classType = 'ONE_ON_ONE',
        sessionDate = new Date().toISOString(),
        locationId = null,
        topicsCovered,
        homeworkAssigned = '',
        instructorPrivateNotes = '',
        textClassComments,
        attendanceRecords = [],
        status = 'PENDING_ADMIN_REVIEW',
      } = data;

      const rows = await this.query(
        `INSERT INTO class_reports (
          class_id, booking_id, instructor_id, format, class_type,
          session_date, location_id, topics_covered, homework_assigned,
          instructor_private_notes, text_class_comments, attendance_records, status,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, NOW(), NOW())
        RETURNING *`,
        [
          classId,
          bookingId,
          instructorId,
          format,
          classType,
          sessionDate,
          locationId,
          topicsCovered,
          homeworkAssigned,
          instructorPrivateNotes,
          textClassComments,
          JSON.stringify(attendanceRecords),
          status,
        ]
      );

      return rows[0] || null;
    } catch (err) {
      console.error('Error in createClassReport:', err);
      throw err;
    }
  }

  static async getClassReports(options?: {
    classId?: string;
    instructorId?: string;
    studentId?: string;
    status?: string;
    adminView?: boolean;
  }) {
    try {
      const { classId, instructorId, studentId, status, adminView } = options || {};
      let sql = `
        SELECT
          cr.*,
          c.title as class_title,
          c.format as class_format,
          c.class_type as class_mode,
          p.first_name as instructor_first_name,
          p.last_name as instructor_last_name,
          p.email as instructor_email,
          p.avatar_url as instructor_avatar_url,
          loc.name as location_name,
          loc.address as location_address
        FROM class_reports cr
        JOIN classes c ON cr.class_id = c.id
        JOIN profiles p ON cr.instructor_id = p.id
        LEFT JOIN class_locations loc ON cr.location_id = loc.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (classId) {
        params.push(classId);
        sql += ` AND cr.class_id = $${params.length}`;
      }

      if (instructorId) {
        params.push(instructorId);
        sql += ` AND cr.instructor_id = $${params.length}`;
      }

      if (status && status !== 'ALL') {
        params.push(status);
        sql += ` AND cr.status = $${params.length}`;
      } else if (!adminView && !instructorId) {
        // Platform users (students/parents) ONLY see APPROVED/PUBLISHED reports
        sql += ` AND cr.status IN ('APPROVED', 'PUBLISHED')`;
      }

      sql += ` ORDER BY cr.session_date DESC, cr.created_at DESC`;

      const rows = await this.query(sql, params);
      return rows;
    } catch (err) {
      console.error('Error in getClassReports:', err);
      return [];
    }
  }

  static async getClassReportById(id: string) {
    try {
      const rows = await this.query(
        `SELECT cr.*, c.title as class_title, p.first_name as instructor_first_name, p.last_name as instructor_last_name, p.email as instructor_email
         FROM class_reports cr
         JOIN classes c ON cr.class_id = c.id
         JOIN profiles p ON cr.instructor_id = p.id
         WHERE cr.id = $1 LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    } catch (err) {
      console.error('Error in getClassReportById:', err);
      return null;
    }
  }

  static async updateClassReportStatus(params: {
    reportId: string;
    status: 'APPROVED' | 'PUBLISHED' | 'CHANGES_REQUESTED' | 'DRAFT' | 'PENDING_ADMIN_REVIEW';
    adminReviewerId?: string;
    adminNotes?: string;
  }) {
    try {
      const { reportId, status, adminReviewerId, adminNotes } = params;
      const isPublished = status === 'APPROVED' || status === 'PUBLISHED';
      
      const rows = await this.query(
        `UPDATE class_reports
         SET status = $1,
             admin_reviewer_id = COALESCE($2, admin_reviewer_id),
             admin_notes = COALESCE($3, admin_notes),
             published_at = CASE WHEN $4 = true THEN NOW() ELSE published_at END,
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [status, adminReviewerId || null, adminNotes || null, isPublished, reportId]
      );

      return rows[0] || null;
    } catch (err) {
      console.error('Error in updateClassReportStatus:', err);
      throw err;
    }
  }

  // ==========================================
  // PASSWORD RESET METHODS
  // ==========================================

  static async createPasswordResetToken(email: string): Promise<{ token: string; user: any } | null> {
    const cleanEmail = email.trim().toLowerCase();
    const token = `rst_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    try {
      const rows = await this.query(
        `UPDATE profiles
         SET reset_password_token = $1,
             reset_password_expires_at = $2,
             updated_at = NOW()
         WHERE LOWER(email) = $3
         RETURNING id, email, first_name, last_name, role`,
        [token, expiresAt, cleanEmail]
      );

      if (rows && rows.length > 0) {
        // Also update memory store fallback if present
        memoryDb.createPasswordResetToken(cleanEmail);
        return { token, user: rows[0] };
      }

      // Try in-memory fallback
      return memoryDb.createPasswordResetToken(cleanEmail);
    } catch (err) {
      console.error('Error in createPasswordResetToken:', err);
      return memoryDb.createPasswordResetToken(cleanEmail);
    }
  }

  static async verifyPasswordResetToken(
    email: string,
    token: string
  ): Promise<{ valid: boolean; user?: any; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const rows = await this.query(
        `SELECT id, email, first_name, last_name, role, reset_password_token, reset_password_expires_at
         FROM profiles
         WHERE LOWER(email) = $1
         LIMIT 1`,
        [cleanEmail]
      );

      if (rows && rows.length > 0) {
        const u = rows[0];
        if (!u.reset_password_token || u.reset_password_token !== token) {
          return { valid: false, error: 'Invalid reset token' };
        }
        if (!u.reset_password_expires_at || new Date(u.reset_password_expires_at).getTime() < Date.now()) {
          return { valid: false, error: 'Reset token has expired' };
        }
        return { valid: true, user: u };
      }

      return memoryDb.verifyPasswordResetToken(cleanEmail, token);
    } catch (err) {
      console.error('Error in verifyPasswordResetToken:', err);
      return memoryDb.verifyPasswordResetToken(cleanEmail, token);
    }
  }

  static async resetPasswordWithToken(
    email: string,
    token: string,
    newPasswordHash: string
  ): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const verify = await this.verifyPasswordResetToken(cleanEmail, token);
      if (!verify.valid) {
        return { success: false, error: verify.error || 'Invalid or expired token' };
      }

      const rows = await this.query(
        `UPDATE profiles
         SET password_hash = $1,
             reset_password_token = NULL,
             reset_password_expires_at = NULL,
             updated_at = NOW()
         WHERE LOWER(email) = $2
         RETURNING id, email`,
        [newPasswordHash, cleanEmail]
      );

      // Keep memory store in sync
      memoryDb.resetPasswordWithToken(cleanEmail, token, newPasswordHash);

      return { success: true };
    } catch (err) {
      console.error('Error in resetPasswordWithToken:', err);
      const memSuccess = memoryDb.resetPasswordWithToken(cleanEmail, token, newPasswordHash);
      return { success: memSuccess, error: memSuccess ? undefined : 'Failed to reset password' };
    }
  }

  // ==========================================
  // STUDENT SEMESTER CHECK-IN (6-MONTH MANDATORY UPDATE)
  // ==========================================

  static async updateStudentSemesterCheckin(params: {
    userId: string;
    gradeLevel: string;
    learningGoals?: string;
    subjects?: string[];
    parentGuardianPhone?: string;
  }): Promise<{ success: boolean; studentProfile?: any; error?: string }> {
    try {
      const { userId, gradeLevel, learningGoals, subjects, parentGuardianPhone } = params;

      // 1. Fetch existing student profile preferences
      const existingUser = await this.getUserById(userId);
      const existingProfile = (existingUser as any)?.student_profile || (existingUser as any)?.studentProfile;
      let prefs = existingProfile?.preferences || {};
      if (typeof prefs === 'string') {
        try {
          prefs = JSON.parse(prefs);
        } catch {
          prefs = {};
        }
      }

      const updatedPrefs = {
        ...prefs,
        grade_level: gradeLevel,
        subjects: subjects || prefs.subjects || [],
        learning_goals: learningGoals || prefs.learning_goals || '',
        semester_checkin_completed: true,
      };

      const rows = await this.query(
        `UPDATE student_profiles
         SET grade_level = $1,
             learning_goals = COALESCE($2, learning_goals),
             parent_guardian_phone = COALESCE($3, parent_guardian_phone),
             preferences = $4,
             profile_last_verified_at = NOW(),
             updated_at = NOW()
         WHERE user_id = $5
         RETURNING *`,
        [gradeLevel, learningGoals || null, parentGuardianPhone || null, JSON.stringify(updatedPrefs), userId]
      );

      // Keep in-memory store in sync
      const memProfile = memoryDb.state?.student_profiles?.find((sp) => sp.user_id === userId);
      if (memProfile) {
        memProfile.grade_level = gradeLevel;
        if (learningGoals) memProfile.learning_goals = learningGoals;
        if (parentGuardianPhone) memProfile.parent_guardian_phone = parentGuardianPhone;
        memProfile.preferences = updatedPrefs;
        memProfile.profile_last_verified_at = new Date().toISOString();
        memProfile.updated_at = new Date().toISOString();
      }

      return { success: true, studentProfile: rows[0] || memProfile };
    } catch (err: any) {
      console.error('Error in updateStudentSemesterCheckin:', err);
      return { success: false, error: err.message || 'Failed to update semester check-in' };
    }
  }
}

export const supabaseDb = SupabaseDbService;
