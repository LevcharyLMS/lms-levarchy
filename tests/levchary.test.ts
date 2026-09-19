import { describe, it, expect } from 'vitest';
import { calculateFinancialSnapshot, formatMoney, parseMoneyToCents, generateBookingNumber } from '../src/lib/utils';
import { ModerationService } from '../src/services/moderation';
import { StorageService } from '../src/services/storage';
import { AuthService } from '../src/services/auth';
import { db } from '../src/lib/data-store';

describe('Levchary LMS - Comprehensive Production Test Suite', () => {

  // ============================================================
  // 1. FINANCIAL PRECISION & IMMUTABILITY (Rules 12, 16, 59)
  // ============================================================
  describe('1. Financial Precision & Immutability', () => {
    it('calculates financial snapshots in integer minor units (cents) with zero floating-point drift', () => {
      // Base class price: $65.00 (6500 cents), 20% platform commission, 2.9% + 30c processing fee
      const snapshot = calculateFinancialSnapshot(6500, 20.0, 2.9, 30);

      expect(snapshot.gross_amount).toBe(6500);
      // Platform commission: round(6500 * 0.20) = 1300 cents ($13.00)
      expect(snapshot.platform_fee_amount).toBe(1300);
      // Tutor earnings: 6500 - 1300 = 5200 cents ($52.00)
      expect(snapshot.tutor_earnings).toBe(5200);
      // Stripe fee: round(6500 * 0.029) + 30 = 189 + 30 = 219 cents ($2.19)
      expect(snapshot.stripe_fee_estimate).toBe(219);
    });

    it('formats monetary minor units accurately into currency display strings', () => {
      expect(formatMoney(6500, 'USD')).toBe('$65.00');
      expect(formatMoney(219, 'USD')).toBe('$2.19');
      expect(formatMoney(0, 'USD')).toBe('$0.00');
      expect(formatMoney(10550, 'USD')).toBe('$105.50');
      expect(formatMoney(99, 'USD')).toBe('$0.99');
    });

    it('parses dollar values safely into integer cents', () => {
      expect(parseMoneyToCents('65.00')).toBe(6500);
      expect(parseMoneyToCents('25.50')).toBe(2550);
      expect(parseMoneyToCents(100)).toBe(10000);
      expect(parseMoneyToCents('0.99')).toBe(99);
      expect(parseMoneyToCents('invalid')).toBe(0);
    });

    it('generates unique booking identification numbers matching enterprise pattern', () => {
      const b1 = generateBookingNumber();
      const b2 = generateBookingNumber();
      expect(b1).toMatch(/^LEV-\d{6}-[A-Z0-9]{5}$/);
      expect(b2).toMatch(/^LEV-\d{6}-[A-Z0-9]{5}$/);
      expect(b1).not.toBe(b2);
    });
  });

  // ============================================================
  // 2. MESSAGE SAFETY & MODERATION (Rules 17, 18, 19, Section 28)
  // ============================================================
  describe('2. Message Safety & Moderation Service', () => {
    it('detects off-platform payment attempts (Venmo, PayPal, Zelle, CashApp, crypto)', () => {
      const texts = [
        'Can we bypass fees? Send to my PayPal account directly.',
        'Just Venmo me the class fee before class starts.',
        'Zelle me $50 to my personal number.',
        'Pay with crypto or cash in person.'
      ];

      for (const text of texts) {
        const result = ModerationService.scanText(text);
        expect(result.hasFlags).toBe(true);
        expect(result.flags.some((f) => f.type === 'OFF_PLATFORM_PAYMENT')).toBe(true);
      }
    });

    it('detects phone numbers formatted with spaces, dashes, parentheses and country codes', () => {
      const phoneTexts = [
        'Call me directly at 555-019-2831 to coordinate',
        'Text my cell at +1 (800) 555-0199',
        'Reach me on 555 234 5678'
      ];

      for (const text of phoneTexts) {
        const result = ModerationService.scanText(text);
        expect(result.hasFlags).toBe(true);
        expect(result.flags.some((f) => f.type === 'PHONE')).toBe(true);
      }
    });

    it('detects email addresses attempting direct contact exchange', () => {
      const text = 'Send your syllabus directly to tutor.private@example.com';
      const result = ModerationService.scanText(text);
      expect(result.hasFlags).toBe(true);
      expect(result.flags.some((f) => f.type === 'EMAIL')).toBe(true);
    });

    it('allows benign educational inquiries without triggering false flags', () => {
      const text = 'Looking forward to our upcoming linear algebra session on matrices!';
      const result = ModerationService.scanText(text);
      expect(result.hasFlags).toBe(false);
      expect(result.flags.length).toBe(0);
    });
  });

  // ============================================================
  // 3. SCHEDULING ENGINE & CONCURRENCY GUARDS (Rules 10, 11)
  // ============================================================
  describe('3. Scheduling Engine & Concurrency Protection', () => {
    it('prevents double-booking of the same 1-on-1 slot (Rule 11)', () => {
      const tutors = db.getTutors();
      expect(tutors.length).toBeGreaterThan(0);
      const tutor = tutors[0];

      // Create a class
      const cls = db.createClass({
        title: 'Advanced Calculus 1-on-1',
        description: 'Derivatives and integrals',
        tutor_id: tutor.user_id,
        category_id: 'cat-1',
        subject_id: 'sub-1',
        grade_id: 'grd-2',
        class_type: 'ONE_ON_ONE',
        format: 'VIRTUAL',
        duration_minutes: 60,
        price: 7500,
        currency: 'USD',
        capacity: 1,
        status: 'PUBLISHED'
      });

      const startTime = new Date(Date.now() + 86400000).toISOString();
      const endTime = new Date(Date.now() + 86400000 + 3600000).toISOString();

      // Booking 1 succeeds
      const res1 = db.bookOneOnOneSlot({
        studentId: 'usr-stu-1',
        tutorId: tutor.user_id,
        classId: cls.id,
        startTime,
        endTime,
        format: 'VIRTUAL'
      });
      expect(res1.booking).toBeDefined();
      expect(res1.booking.status).toBe('CONFIRMED');

      // Booking 2 for overlapping slot MUST THROW CONFLICT ERROR
      expect(() => {
        db.bookOneOnOneSlot({
          studentId: 'usr-stu-2',
          tutorId: tutor.user_id,
          classId: cls.id,
          startTime,
          endTime,
          format: 'VIRTUAL'
        });
      }).toThrow(/conflict detected/i);
    });

    it('enforces group class capacity and closes enrollment when full (Rule 10)', () => {
      const tutor = db.getTutors()[0];

      // Create group class with capacity of 2
      const groupClass = db.createClass({
        title: 'Python Workshop for Beginners',
        description: 'Interactive pair programming',
        tutor_id: tutor.user_id,
        category_id: 'cat-2',
        subject_id: 'sub-3',
        grade_id: 'grd-2',
        class_type: 'GROUP',
        format: 'VIRTUAL',
        duration_minutes: 90,
        price: 3500,
        currency: 'USD',
        capacity: 2,
        status: 'PUBLISHED'
      });

      // Student 1 enrolls (1/2)
      const res1 = db.enrollGroupClass({
        studentId: 'usr-stu-1',
        classId: groupClass.id
      });
      expect(res1.booking).toBeDefined();

      // Student 2 enrolls (2/2) -> reaches full capacity
      const res2 = db.enrollGroupClass({
        studentId: 'usr-stu-2',
        classId: groupClass.id
      });
      expect(res2.booking).toBeDefined();

      // Check class status is updated to FULL
      const updatedClass = db.getClassById(groupClass.id);
      expect(updatedClass?.enrolled_count).toBe(2);
      expect(updatedClass?.status).toBe('FULL');

      // Student 3 attempts enrollment -> MUST THROW CAPACITY ERROR
      expect(() => {
        db.enrollGroupClass({
          studentId: 'usr-stu-3',
          classId: groupClass.id
        });
      }).toThrow(/capacity limit reached/i);
    });
  });

  // ============================================================
  // 4. RBAC & SECURITY AUTHORIZATION (Rules 1, 3, 4, 5, 20)
  // ============================================================
  describe('4. RBAC & Account Suspension Enforcement', () => {
    it('restricts teaching to APPROVED tutors only (Rule 1)', () => {
      // Find an approved tutor
      const approved = db.getTutors().find((t) => t.is_approved);
      expect(approved).toBeDefined();

      // Attempt to book with unapproved tutor ID should be rejected
      expect(() => {
        db.bookOneOnOneSlot({
          studentId: 'usr-stu-1',
          tutorId: 'unapproved-tutor-999',
          classId: 'cls-1',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          format: 'VIRTUAL'
        });
      }).toThrow(/not currently approved/i);
    });

    it('enforces server-side RBAC role permissions', () => {
      const studentSession = {
        user: db.getProfileById('usr-stu-1')!,
        role: 'STUDENT' as const,
        isAuthenticated: true
      };

      // Student attempting to access ADMIN route must be rejected
      expect(() => {
        AuthService.requireRole(studentSession, ['ADMIN']);
      }).toThrow(/Access denied for role STUDENT/i);

      // Student accessing STUDENT route succeeds
      const verifiedUser = AuthService.requireRole(studentSession, ['STUDENT']);
      expect(verifiedUser.id).toBe('usr-stu-1');
    });

    it('prohibits suspended accounts from proceeding with operations (Rule 20)', () => {
      const suspendedUser = db.createUser({
        email: 'suspended.test@levchary.local',
        role: 'STUDENT',
        firstName: 'Banned',
        lastName: 'User',
        account_status: 'SUSPENDED',
        emailVerified: true
      });

      const suspendedSession = {
        user: suspendedUser,
        role: 'STUDENT' as const,
        isAuthenticated: true
      };

      expect(() => {
        AuthService.requireRole(suspendedSession, ['STUDENT']);
      }).toThrow(/account has been suspended/i);
    });
  });

  // ============================================================
  // 5. STORAGE SECURITY & SIGNED URLS (Rule 2, Section 10)
  // ============================================================
  describe('5. Storage Security & Verification Document Privacy', () => {
    it('generates short-lived signed URLs with 15-minute expiration and audit logging (Rule 2 & 16)', async () => {
      const filePath = 'verifications/tutors/tut-1/government_id.pdf';
      const signedUrl = await StorageService.getSignedUrl(filePath, 'usr-admin-1', 'ADMIN');

      expect(signedUrl).toContain('/api/documents/view?path=');
      expect(signedUrl).toContain('&token=');
      expect(signedUrl).toContain('&expires=');

      // Validate audit log was appended
      const logs = db.getAuditLogs();
      const documentAudit = logs.find((l) => l.action === 'SENSITIVE_DOCUMENT_ACCESSED');
      expect(documentAudit).toBeDefined();
      expect(documentAudit?.actor_role).toBe('ADMIN');
    });

    it('validates upload MIME type and rejects dangerous or invalid file formats', () => {
      // Valid PDF
      const validPdf = StorageService.validateUpload({
        name: 'passport.pdf',
        size: 2 * 1024 * 1024,
        type: 'application/pdf'
      });
      expect(validPdf.valid).toBe(true);

      // Invalid executable
      const invalidExe = StorageService.validateUpload({
        name: 'malware.exe',
        size: 1024,
        type: 'application/x-msdownload'
      });
      expect(invalidExe.valid).toBe(false);
      expect(invalidExe.error).toMatch(/Invalid file format/i);

      // Oversized file (>10MB)
      const oversized = StorageService.validateUpload({
        name: 'huge_scan.pdf',
        size: 15 * 1024 * 1024,
        type: 'application/pdf'
      });
      expect(oversized.valid).toBe(false);
      expect(oversized.error).toMatch(/exceeds 10MB limit/i);
    });
  });

  // ============================================================
  // 6. HISTORICAL FINANCIAL TRANSACTION IMMUTABILITY (Rule 12)
  // ============================================================
  describe('6. Historical Financial Immutability (Rule 12)', () => {
    it('preserves historical booking financial snapshot even when class price changes', () => {
      const tutor = db.getTutors()[0];

      // Create class at $50.00 (5000 cents)
      const cls = db.createClass({
        title: 'Biology 1-on-1 Tutorial',
        description: 'Cell biology review',
        tutor_id: tutor.user_id,
        category_id: 'cat-2',
        subject_id: 'sub-2',
        grade_id: 'grd-2',
        class_type: 'ONE_ON_ONE',
        format: 'VIRTUAL',
        duration_minutes: 60,
        price: 5000,
        currency: 'USD',
        capacity: 1,
        status: 'PUBLISHED'
      });

      const startTime = new Date(Date.now() + 300000000).toISOString();
      const endTime = new Date(Date.now() + 300000000 + 3600000).toISOString();

      const { booking, snapshot } = db.bookOneOnOneSlot({
        studentId: 'usr-stu-1',
        tutorId: tutor.user_id,
        classId: cls.id,
        startTime,
        endTime,
        format: 'VIRTUAL'
      });

      expect(snapshot.gross_amount).toBe(5000);
      expect(snapshot.tutor_earnings).toBe(4000); // 80% of 5000

      // Now price of the class is changed to $120.00 (12000 cents)
      const targetClass = db.getClassById(cls.id);
      if (targetClass) {
        targetClass.price = 12000;
      }

      // Query historical booking: the locked financial snapshot must remain exactly $50.00 (5000 cents)
      const historicalBookings = db.getBookings({ studentId: 'usr-stu-1' });
      const myBooking = historicalBookings.find((b) => b.id === booking.id);
      expect(myBooking).toBeDefined();
      expect(myBooking?.financial_snapshot?.gross_amount).toBe(5000);
      expect(myBooking?.financial_snapshot?.tutor_earnings).toBe(4000);
    });
  });

});
