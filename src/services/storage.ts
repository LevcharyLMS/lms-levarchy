// ============================================================
// LEVCHARY LMS - SECURE STORAGE SERVICE
// Private document storage with short-lived signed URLs & audit logging
// ============================================================

import { AuditService } from './audit';

export class StorageService {
  /**
   * Generate short-lived signed URL (15 minute expiry) for authorized verification documents
   */
  static async getSignedUrl(filePath: string, viewerId: string, viewerRole: string): Promise<string> {
    // RULE 16: Record access to sensitive verification documents in audit logs
    AuditService.log({
      actor_id: viewerId,
      actor_role: viewerRole as any,
      action: 'SENSITIVE_DOCUMENT_ACCESSED',
      entity_type: 'VERIFICATION_DOCUMENT',
      entity_id: filePath,
      metadata: { expiry_minutes: 15 },
    });

    // In production with Supabase Storage:
    // const { data, error } = await supabase.storage.from('verification-documents').createSignedUrl(filePath, 900);
    // return data.signedUrl;

    // Secure temporary signed token simulation
    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 15 * 60 * 1000;
    return `/api/documents/view?path=${encodeURIComponent(filePath)}&token=${token}&expires=${expiresAt}`;
  }

  /**
   * Validate MIME types and file size for verification document uploads
   */
  static validateUpload(file: { name: string; size: number; type: string }): { valid: boolean; error?: string } {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file format. Only PDF, JPG, PNG, and WebP documents are permitted.',
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit. Please compress or optimize the document.',
      };
    }

    return { valid: true };
  }
}
