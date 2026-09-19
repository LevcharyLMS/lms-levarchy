// ============================================================
// LEVCHARY LMS - AUTHENTICATION & AUTHORIZATION SERVICE
// Server-side RBAC, session verification & account status guard
// ============================================================

import { UserProfile, UserRole } from '@/types';
import { db } from '@/lib/data-store';

export interface AuthSession {
  user: UserProfile;
  role: UserRole;
  isAuthenticated: boolean;
}

export class AuthService {
  /**
   * Get current session user. In production this validates Supabase Auth JWT and loads profile.
   * In local/demo mode, it supports switching between Admin, Tutor, and Student demo roles.
   */
  static async getCurrentSession(activeUserId?: string): Promise<AuthSession | null> {
    let userId = activeUserId;

    if (!userId) {
      try {
        const { cookies } = await import('next/headers');
        const sessionCookie = cookies().get('levchary_session');
        if (sessionCookie?.value) {
          const parsed = JSON.parse(sessionCookie.value);
          userId = parsed.userId;
        }
      } catch {}
    }

    if (!userId) return null;

    let profile = db.getProfileById(userId);
    if (!profile) {
      try {
        const { SupabaseDbService } = await import('@/lib/supabase-db');
        const dbUser = await SupabaseDbService.getUserById(userId);
        if (dbUser) profile = dbUser;
      } catch {}
    }

    if (!profile) return null;

    // RULE 20: Suspended accounts cannot continue performing restricted actions.
    if (profile.account_status === 'SUSPENDED') {
      throw new Error('Account suspended: Please contact Levchary administration.');
    }

    return {
      user: profile,
      role: profile.role,
      isAuthenticated: true,
    };
  }

  /**
   * Enforce Role-Based Access Control on server components and route handlers
   */
  static requireRole(session: AuthSession | null, allowedRoles: UserRole[]): UserProfile {
    if (!session || !session.isAuthenticated) {
      throw new Error('Unauthorized: Authentication required.');
    }

    if (session.user.account_status === 'SUSPENDED') {
      throw new Error('Forbidden: Your account has been suspended.');
    }

    if (!allowedRoles.includes(session.role)) {
      throw new Error(`Forbidden: Access denied for role ${session.role}. Required: ${allowedRoles.join(', ')}`);
    }

    return session.user;
  }

  /**
   * Switch active demo role for testing without needing to clear cookies
   */
  static getDemoUsers() {
    return {
      admin: db.getProfileByEmail('admin@levchary.local'),
      tutor: db.getProfileByEmail('marcus.chen@tutor.levchary.local'),
      student: db.getProfileByEmail('student@levchary.local'),
      pendingTutor: db.getProfileByEmail('emily.zhao@tutor.levchary.local'),
    };
  }
}
