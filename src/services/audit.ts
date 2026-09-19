// ============================================================
// LEVCHARY LMS - AUDIT LOG SERVICE
// Append-only system activity logging for compliance & security
// ============================================================

import { db } from '@/lib/data-store';
import { UserRole } from '@/types';

export interface AuditEntry {
  actor_id?: string;
  actor_role?: UserRole;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditService {
  /**
   * Log an administrative or state transition event to the immutable append-only ledger
   */
  static log(entry: AuditEntry) {
    try {
      const log = db.logAudit({
        actor_id: entry.actor_id || null,
        actor_role: entry.actor_role || null,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || null,
        metadata: entry.metadata || {},
        ip_address: entry.ip_address || '127.0.0.1',
        user_agent: entry.user_agent || 'Levchary-Application/1.0',
      });
      return log;
    } catch (err) {
      console.error('CRITICAL: Failed to append to audit log:', err);
    }
  }

  static getRecentLogs() {
    return db.getAuditLogs();
  }
}
