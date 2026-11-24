// ============================================================
// LEVCHARY LMS - IN-MEMORY & LOCAL DATA STORE
// Authoritative local database provider for development & demo mode
// Conforms to Supabase PostgreSQL schema with atomic locking semantics
// ============================================================

import {
  UserProfile,
  TutorProfile,
  StudentProfile,
  Category,
  Subject,
  Grade,
  ClassLocation,
  ClassItem,
  Booking,
  BookingFinancialSnapshot,
  Transaction,
  Refund,
  Message,
  Conversation,
  MessageFlag,
  Notification,
  Review,
  AuditLog,
  SupportTicket,
  PlatformSettings,
  TutorAvailability,
  TutorApplication,
  VerificationDocument,
  AdvertItem,
} from '@/types';
import { calculateFinancialSnapshot, generateBookingNumber } from './utils';

export interface DatabaseState {
  profiles: UserProfile[];
  student_profiles: StudentProfile[];
  instructor_profiles: TutorProfile[];
  tutor_profiles: TutorProfile[]; // getter/setter sync
  instructor_applications: TutorApplication[];
  tutor_applications: TutorApplication[];
  verification_documents: VerificationDocument[];
  categories: Category[];
  subjects: Subject[];
  grades: Grade[];
  class_locations: ClassLocation[];
  instructor_availability: TutorAvailability[];
  tutor_availability: TutorAvailability[];
  classes: ClassItem[];
  bookings: Booking[];
  booking_financial_snapshots: BookingFinancialSnapshot[];
  transactions: Transaction[];
  refunds: Refund[];
  conversations: Conversation[];
  messages: Message[];
  message_flags: MessageFlag[];
  notifications: Notification[];
  reviews: Review[];
  audit_logs: AuditLog[];
  support_tickets: SupportTicket[];
  platform_settings: PlatformSettings[];
  adverts: AdvertItem[];
}

// Initial rich seed data
const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Mathematics',
    slug: 'mathematics',
    description: 'Algebra, Calculus, Geometry, Statistics, and Applied Math',
    icon: 'Calculator',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Sciences',
    slug: 'sciences',
    description: 'Physics, Chemistry, Biology, and Organic Synthesis',
    icon: 'Atom',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Computer Science',
    slug: 'computer-science',
    description: 'Python, Full-Stack Web Development, Data Structures, and AI',
    icon: 'Code',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Languages & Writing',
    slug: 'languages',
    description: 'Academic Writing, Literature Analysis, French, and Spanish',
    icon: 'BookOpen',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-5',
    name: 'Test Preparation',
    slug: 'test-prep',
    description: 'Digital SAT, ACT, AP Examinations, and GRE',
    icon: 'GraduationCap',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const initialSubjects: Subject[] = [
  {
    id: 'sub-1',
    category_id: 'cat-1',
    name: 'AP Calculus BC',
    slug: 'ap-calculus-bc',
    description: 'Differential and integral calculus, series, vectors, and exam mastery.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-2',
    category_id: 'cat-1',
    name: 'Linear Algebra',
    slug: 'linear-algebra',
    description: 'Matrix algebra, eigenvalues, eigenvectors, and geometric spaces.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-3',
    category_id: 'cat-2',
    name: 'Physics: Mechanics & E&M',
    slug: 'physics-mechanics',
    description: 'Kinematics, dynamics, conservation laws, electromagnetism.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-4',
    category_id: 'cat-2',
    name: 'Organic Chemistry',
    slug: 'organic-chemistry',
    description: 'Molecular structure, reaction pathways, stereochemistry, synthesis.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-5',
    category_id: 'cat-3',
    name: 'Python & Algorithms',
    slug: 'python-algorithms',
    description: 'Modern algorithmic thinking, data structures, complexity analysis.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-6',
    category_id: 'cat-3',
    name: 'Full-Stack Web (React/Next.js)',
    slug: 'fullstack-web',
    description: 'Production React, Next.js, API design, and backend integration.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-7',
    category_id: 'cat-4',
    name: 'English Literature & Rhetoric',
    slug: 'english-literature',
    description: 'Close textual analysis, scholarly essays, rhetorical devices.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sub-8',
    category_id: 'cat-5',
    name: 'Digital SAT Math & Strategy',
    slug: 'digital-sat-math',
    description: 'Comprehensive math review and pacing for the new digital SAT format.',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const initialGrades: Grade[] = [
  { id: 'grd-1', name: 'Middle School (Grades 6–8)', level: 1, created_at: new Date().toISOString() },
  { id: 'grd-2', name: 'High School (Grades 9–10)', level: 2, created_at: new Date().toISOString() },
  { id: 'grd-3', name: 'High School (Grades 11–12 / AP)', level: 3, created_at: new Date().toISOString() },
  { id: 'grd-4', name: 'University / Undergraduate', level: 4, created_at: new Date().toISOString() },
];

const initialLocations: ClassLocation[] = [
  {
    id: 'loc-1',
    name: 'Levchary Central Learning Hub - Room 302',
    address: '100 Main Street, Suite 300',
    city: 'Boston',
    state: 'MA',
    postal_code: '02110',
    country: 'US',
    capacity: 20,
    directions: 'Directly across from Downtown Crossing Station. Front desk check-in required.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'loc-2',
    name: 'Levchary Cambridge Study Center - Studio A',
    address: '450 Massachusetts Ave',
    city: 'Cambridge',
    state: 'MA',
    postal_code: '02139',
    country: 'US',
    capacity: 14,
    directions: 'Two blocks from Central Square Red Line. Secure keypad door code provided upon booking.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'loc-3',
    name: 'Levchary Manhattan Learning Lab - Room 4B',
    address: '520 5th Avenue, Floor 8',
    city: 'New York',
    state: 'NY',
    postal_code: '10036',
    country: 'US',
    capacity: 16,
    directions: 'Short walk from Grand Central Terminal. Quiet conference room with dual digital whiteboards.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialProfiles: UserProfile[] = [
  // 1. Admin
  {
    id: '6e983f2f-472f-43f9-a666-33521966ff8a',
    email: 'admin@levchary.com',
    role: 'ADMIN',
    first_name: 'Admin',
    last_name: 'Levchary',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+1 (617) 555-0100',
    country: 'US',
    city: 'Boston',
    state: 'MA',
    account_status: 'ACTIVE',
    verification_status: 'APPROVED',
    email_verified: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
];

const initialTutorProfiles: TutorProfile[] = [];
const initialClasses: ClassItem[] = [];
const initialBookings: Booking[] = [];
const initialSnapshots: BookingFinancialSnapshot[] = [];
const initialTransactions: Transaction[] = [];
const initialReviews: Review[] = [];
const initialFlags: MessageFlag[] = [];
const initialNotifications: Notification[] = [];
const initialAuditLogs: AuditLog[] = [];
const initialAvailability: TutorAvailability[] = [];
const initialMessages: Message[] = [];
const initialConversations: Conversation[] = [];
const initialVerificationDocuments: VerificationDocument[] = [];

// In-Memory Database Class
class DataStore {
  public state: DatabaseState;

  constructor() {
    this.state = {
      profiles: [...initialProfiles],
      student_profiles: [],
      instructor_profiles: [...initialTutorProfiles],
      get tutor_profiles() {
        return this.instructor_profiles;
      },
      set tutor_profiles(val) {
        this.instructor_profiles = val;
      },
      instructor_applications: [],
      get tutor_applications() {
        return this.instructor_applications;
      },
      set tutor_applications(val) {
        this.instructor_applications = val;
      },
      verification_documents: [...initialVerificationDocuments],
      categories: [...initialCategories],
      subjects: [...initialSubjects],
      grades: [...initialGrades],
      class_locations: [...initialLocations],
      instructor_availability: [...initialAvailability],
      get tutor_availability() {
        return this.instructor_availability;
      },
      set tutor_availability(val) {
        this.instructor_availability = val;
      },
      classes: [...initialClasses],
      bookings: [...initialBookings],
      booking_financial_snapshots: [...initialSnapshots],
      transactions: [...initialTransactions],
      refunds: [],
      conversations: [...initialConversations],
      messages: [...initialMessages],
      message_flags: [...initialFlags],
      notifications: [],
      reviews: [...initialReviews],
      audit_logs: [...initialAuditLogs],
      support_tickets: [],
      adverts: [],
      platform_settings: [
        {
          key: 'platform_info',
          value: { name: 'Levchary LMS', support_email: 'support@levchary.com', currency: 'USD' },
          updated_at: new Date().toISOString(),
        },
        {
          key: 'refund_policy',
          value: { cancellation_window_hours: 24, full_refund_window_hours: 48, partial_refund_percent: 50 },
          updated_at: new Date().toISOString(),
        },
      ],
    };
  }

  // --- PROFILES ---
  getProfiles() {
    return this.state.profiles;
  }

  getProfileById(id: string) {
    return this.state.profiles.find((p) => p.id === id);
  }

  getProfileByEmail(email: string) {
    const normalized = (email || '').toLowerCase().trim();
    if (normalized === 'admin@levchary.local' || normalized === 'admin@levchary.com') {
      return this.state.profiles.find((p) => p.role === 'ADMIN') || this.state.profiles.find((p) => p.email.toLowerCase() === normalized);
    }
    return this.state.profiles.find((p) => p.email.toLowerCase() === normalized);
  }

  seedTestFixtures() {
    // Only used in isolated unit test environments (vitest) to verify RBAC & double-booking logic
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      if (!this.state.profiles.some((p) => p.id === 'usr-test-tut')) {
        this.state.profiles.push({
          id: 'usr-test-tut',
          email: 'test.instructor@levchary.test',
          role: 'INSTRUCTOR',
          first_name: 'Test',
          last_name: 'Instructor',
          avatar_url: '',
          phone: '+1 555-0100',
          country: 'US',
          city: 'Boston',
          state: 'MA',
          account_status: 'ACTIVE',
          verification_status: 'APPROVED',
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      if (!this.state.profiles.some((p) => p.id === 'usr-stu-1')) {
        this.state.profiles.push({
          id: 'usr-stu-1',
          email: 'student.test@levchary.test',
          role: 'STUDENT',
          first_name: 'Test',
          last_name: 'Student',
          avatar_url: '',
          phone: '+1 555-0200',
          country: 'US',
          city: 'Boston',
          state: 'MA',
          account_status: 'ACTIVE',
          verification_status: 'APPROVED',
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      if (!this.state.instructor_profiles.some((tp) => tp.user_id === 'usr-test-tut')) {
        this.state.instructor_profiles.push({
          user_id: 'usr-test-tut',
          instructor_type: 'FACULTY',
          headline: 'Mathematics Faculty',
          bio: 'Test faculty educator.',
          qualifications: 'Ph.D. Mathematics',
          experience_years: 10,
          hourly_rate: 6500,
          stripe_account_id: 'acct_test',
          stripe_onboarding_completed: true,
          rating_avg: 5.0,
          reviews_count: 10,
          is_approved: true,
          preferred_format: 'BOTH',
          timezone: 'America/New_York',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  updateProfile(id: string, updates: Partial<UserProfile>) {
    const idx = this.state.profiles.findIndex((p) => p.id === id);
    if (idx >= 0) {
      this.state.profiles[idx] = { ...this.state.profiles[idx], ...updates, updated_at: new Date().toISOString() };
      return this.state.profiles[idx];
    }
    return null;
  }

  // --- INSTRUCTORS ---
  getInstructors(filters?: {
    categoryId?: string;
    subjectId?: string;
    search?: string;
    format?: string;
    instructorType?: "ALL" | "TUTOR" | "FACULTY";
  }) {
    let list = this.state.instructor_profiles.filter((t) => t.is_approved);

    if (filters?.instructorType && filters.instructorType !== "ALL") {
      list = list.filter((t) => t.instructor_type === filters.instructorType);
    }

    return list.map((tp) => {
      const user = this.getProfileById(tp.user_id);
      return {
        ...tp,
        user,
      };
    });
  }

  // Alias for backward compatibility
  getTutors(filters?: any) {
    return this.getInstructors(filters);
  }

  getInstructorById(userId: string) {
    const tp = this.state.instructor_profiles.find((t) => t.user_id === userId);
    if (!tp) return null;
    const user = this.getProfileById(userId);
    const classes = this.state.classes.filter((c) => (c.instructor_id || c.tutor_id) === userId);
    const reviews = this.state.reviews.filter((r) => (r.instructor_id || r.tutor_id) === userId && r.is_published);
    return {
      ...tp,
      user,
      classes,
      reviews,
    };
  }

  getTutorById(userId: string) {
    return this.getInstructorById(userId);
  }

  // --- CLASSES ---
  getClasses(filters?: { type?: string; format?: string; subjectId?: string; search?: string }) {
    let classes = [...this.state.classes];

    if (filters?.type) {
      classes = classes.filter((c) => c.class_type === filters.type);
    }
    if (filters?.format) {
      classes = classes.filter((c) => c.format === filters.format);
    }
    if (filters?.subjectId) {
      classes = classes.filter((c) => c.subject_id === filters.subjectId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      classes = classes.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }

    return classes.map((c) => this.hydrateClass(c));
  }

  getClassById(id: string) {
    const c = this.state.classes.find((item) => item.id === id);
    if (!c) return null;
    return this.hydrateClass(c);
  }

  private hydrateClass(c: ClassItem) {
    const instructorId = c.instructor_id || c.tutor_id || '';
    const tutorProfile = this.state.instructor_profiles.find((t) => t.user_id === instructorId);
    const user = this.getProfileById(instructorId);
    const category = this.state.categories.find((cat) => cat.id === c.category_id);
    const subject = this.state.subjects.find((sub) => sub.id === c.subject_id);
    const grade = c.grade_id ? this.state.grades.find((g) => g.id === c.grade_id) : undefined;
    const location = c.location_id ? this.state.class_locations.find((l) => l.id === c.location_id) : undefined;

    return {
      ...c,
      instructor_id: instructorId,
      tutor_id: instructorId,
      tutor: user ? { ...user, tutor_profile: tutorProfile } : undefined,
      instructor: user ? { ...user, instructor_profile: tutorProfile } : undefined,
      category,
      subject,
      grade,
      location,
    };
  }

  createClass(classData: Omit<ClassItem, 'id' | 'created_at' | 'updated_at' | 'enrolled_count'>) {
    const id = `cls-${Date.now()}`;
    const newClass: ClassItem = {
      ...classData,
      id,
      enrolled_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.classes.push(newClass);
    return this.hydrateClass(newClass);
  }

  updateClass(classId: string, updates: Partial<ClassItem>) {
    const idx = this.state.classes.findIndex((c) => c.id === classId);
    if (idx < 0) return null;
    this.state.classes[idx] = {
      ...this.state.classes[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.hydrateClass(this.state.classes[idx]);
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId: string) {
    return this.state.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);
  }

  createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.state.notifications.push(newNotification);
    return newNotification;
  }

  markNotificationsRead(userId: string) {
    this.state.notifications
      .filter((n) => n.user_id === userId)
      .forEach((n) => { n.is_read = true; });
    return true;
  }

  toggleNotificationRead(notificationId: string, isRead: boolean) {
    const notif = this.state.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.is_read = isRead;
      return notif;
    }
    return null;
  }

  deleteNotification(notificationId: string) {
    const idx = this.state.notifications.findIndex((n) => n.id === notificationId);
    if (idx >= 0) {
      this.state.notifications.splice(idx, 1);
      return true;
    }
    return false;
  }

  clearReadNotifications(userId: string) {
    this.state.notifications = this.state.notifications.filter(
      (n) => !(n.user_id === userId && n.is_read)
    );
    return true;
  }

  // --- BOOKING ENGINE (ATOMIC SLOT & CAPACITY PRESERVATION) ---
  bookOneOnOneSlot(params: {
    studentId: string;
    tutorId: string;
    classId: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    format: 'VIRTUAL' | 'PHYSICAL';
    locationId?: string;
    notes?: string;
  }) {
    const tutor = this.state.tutor_profiles.find((t) => t.user_id === params.tutorId);
    if (!tutor || !tutor.is_approved) {
      throw new Error('Double Booking Prevention: Tutor is not currently approved for teaching.');
    }

    // Check conflict (atomic check)
    const start = new Date(params.startTime).getTime();
    const end = new Date(params.endTime).getTime();

    const conflict = this.state.bookings.some((b) => {
      if (b.tutor_id !== params.tutorId) return false;
      if (['CANCELLED', 'REFUNDED'].includes(b.status)) return false;
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      return (start >= bStart && start < bEnd) || (end > bStart && end <= bEnd);
    });

    if (conflict) {
      throw new Error('Conflict detected: This tutor slot has already been reserved. Please select another time window.');
    }

    const classItem = this.getClassById(params.classId);
    if (!classItem) throw new Error('Class not found.');

    const bookingId = `bk-${Date.now()}`;
    const bookingNumber = generateBookingNumber();

    const booking: Booking = {
      id: bookingId,
      booking_number: bookingNumber,
      student_id: params.studentId,
      tutor_id: params.tutorId,
      class_id: params.classId,
      status: 'CONFIRMED',
      start_time: params.startTime,
      end_time: params.endTime,
      timezone: params.timezone || 'America/New_York',
      format: params.format,
      location_id: params.locationId,
      meet_url: params.format === 'VIRTUAL' ? classItem.meet_url || `/classroom/Levchary-${bookingId}` : null,
      notes: params.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.bookings.push(booking);

    // Create IMMUTABLE Financial Snapshot
    const financial = calculateFinancialSnapshot(classItem.price, 20.0);
    const snapshot: BookingFinancialSnapshot = {
      id: `snap-${Date.now()}`,
      booking_id: bookingId,
      ...financial,
      currency: classItem.currency,
      locked_at: new Date().toISOString(),
    };
    this.state.booking_financial_snapshots.push(snapshot);

    // Record Transaction Ledger
    this.state.transactions.push({
      id: `tx-${Date.now()}`,
      booking_id: bookingId,
      student_id: params.studentId,
      tutor_id: params.tutorId,
      type: 'PAYMENT',
      gross_amount: snapshot.gross_amount,
      fee_amount: snapshot.platform_fee_amount,
      net_amount: snapshot.tutor_earnings,
      currency: snapshot.currency,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
    });

    // Record Audit Log
    this.logAudit({
      actor_id: params.studentId,
      actor_role: 'STUDENT',
      action: 'BOOKING_CREATED_AND_LOCKED',
      entity_type: 'BOOKING',
      entity_id: bookingId,
      metadata: { booking_number: bookingNumber, gross_cents: snapshot.gross_amount },
    });

    return { booking, snapshot };
  }

  enrollGroupClass(params: {
    studentId: string;
    classId: string;
    timezone?: string;
  }) {
    const classIdx = this.state.classes.findIndex((c) => c.id === params.classId);
    if (classIdx < 0) throw new Error('Class not found.');

    const c = this.state.classes[classIdx];
    if (c.enrolled_count >= c.capacity) {
      throw new Error(`Class capacity limit reached (${c.enrolled_count}/${c.capacity}). Enrollment closed.`);
    }

    // Atomic increment
    c.enrolled_count += 1;
    if (c.enrolled_count >= c.capacity) {
      c.status = 'FULL';
    }
    c.updated_at = new Date().toISOString();

    const bookingId = `bk-grp-${Date.now()}`;
    const bookingNumber = generateBookingNumber();

    const booking: Booking = {
      id: bookingId,
      booking_number: bookingNumber,
      student_id: params.studentId,
      tutor_id: c.tutor_id,
      class_id: c.id,
      status: 'CONFIRMED',
      start_time: c.start_time || new Date().toISOString(),
      end_time: c.end_time || new Date(Date.now() + 3600000).toISOString(),
      timezone: params.timezone || 'America/New_York',
      format: c.format,
      location_id: c.location_id || undefined,
      meet_url: c.meet_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.bookings.push(booking);

    // Financial snapshot
    const financial = calculateFinancialSnapshot(c.price, 20.0);
    const snapshot: BookingFinancialSnapshot = {
      id: `snap-${Date.now()}`,
      booking_id: bookingId,
      ...financial,
      currency: c.currency,
      locked_at: new Date().toISOString(),
    };
    this.state.booking_financial_snapshots.push(snapshot);

    return { booking, snapshot };
  }

  // --- BOOKINGS & SNAPSHOTS ---
  getBookings(filter?: { studentId?: string; tutorId?: string; status?: string }) {
    let list = [...this.state.bookings];
    if (filter?.studentId) list = list.filter((b) => b.student_id === filter.studentId);
    if (filter?.tutorId) list = list.filter((b) => b.tutor_id === filter.tutorId);
    if (filter?.status) list = list.filter((b) => b.status === filter.status);

    return list.map((b) => {
      const student = this.getProfileById(b.student_id);
      const tutor = this.getProfileById(b.instructor_id || b.tutor_id || '');
      const classItem = this.getClassById(b.class_id);
      const financial_snapshot = this.state.booking_financial_snapshots.find((s) => s.booking_id === b.id);
      const location = b.location_id ? this.state.class_locations.find((l) => l.id === b.location_id) : undefined;
      return {
        ...b,
        student,
        tutor,
        class_item: classItem || undefined,
        financial_snapshot,
        location,
      };
    });
  }

  // --- REVIEWS ---
  submitReview(review: {
    bookingId: string;
    studentId: string;
    tutorId: string;
    rating: number;
    comment: string;
  }) {
    const booking = this.state.bookings.find((b) => b.id === review.bookingId);
    if (!booking || booking.status !== 'COMPLETED') {
      throw new Error('Reviews can only be submitted for completed classes.');
    }

    const existing = this.state.reviews.find((r) => r.booking_id === review.bookingId);
    if (existing) {
      throw new Error('A review has already been submitted for this booking.');
    }

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      booking_id: review.bookingId,
      student_id: review.studentId,
      tutor_id: review.tutorId,
      rating: review.rating,
      comment: review.comment,
      is_moderated: false,
      is_published: true,
      is_featured_testimonial: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.reviews.push(newRev);

    // Recalculate tutor rating average
    const tutorRevs = this.state.reviews.filter((r) => r.tutor_id === review.tutorId && r.is_published);
    const avg = tutorRevs.reduce((acc, curr) => acc + curr.rating, 0) / tutorRevs.length;
    const tutorIdx = this.state.tutor_profiles.findIndex((t) => t.user_id === review.tutorId);
    if (tutorIdx >= 0) {
      this.state.tutor_profiles[tutorIdx].rating_avg = Math.round(avg * 100) / 100;
      this.state.tutor_profiles[tutorIdx].reviews_count = tutorRevs.length;
    }

    return newRev;
  }

  updateReview(reviewId: string, updates: Partial<Review>) {
    const idx = this.state.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) return null;
    this.state.reviews[idx] = {
      ...this.state.reviews[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.state.reviews[idx];
  }

  // --- MESSAGING & MODERATION ---
  getMessages(conversationId: string) {
    return this.state.messages
      .filter((m) => m.conversation_id === conversationId)
      .map((m) => ({
        ...m,
        sender: this.getProfileById(m.sender_id),
      }));
  }

  sendMessage(params: { conversationId: string; senderId: string; body: string }) {
    const { detectedFlags } = this.scanMessageModeration(params.body);
    const messageId = `msg-${Date.now()}`;
    const hasFlag = detectedFlags.length > 0;

    const message: Message = {
      id: messageId,
      conversation_id: params.conversationId,
      sender_id: params.senderId,
      body: params.body,
      is_read: false,
      has_flag: hasFlag,
      created_at: new Date().toISOString(),
    };

    this.state.messages.push(message);

    // If flagged, store in moderation flags table
    detectedFlags.forEach((flag) => {
      this.state.message_flags.push({
        id: `flg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        message_id: messageId,
        flag_type: flag.type,
        detected_text: flag.snippet,
        severity: flag.severity,
        status: 'PENDING_REVIEW',
        created_at: new Date().toISOString(),
      });
    });

    return { message, flags: detectedFlags };
  }

  scanMessageModeration(text: string) {
    const flags: { type: any; snippet: string; severity: any }[] = [];

    // Phone number pattern
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      flags.push({ type: 'PHONE', snippet: phoneMatch[0], severity: 'MEDIUM' });
    }

    // Email pattern
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      flags.push({ type: 'EMAIL', snippet: emailMatch[0], severity: 'MEDIUM' });
    }

    // Off-platform payment keywords (Venmo, Cash App, Zelle, PayPal, wire transfer, Western Union, crypto)
    const offPlatformKeywords = /\b(venmo|zelle|cash\s?app|paypal|wire\s?transfer|bank\s?transfer|crypto|btc|pay\s?offline|outside\s?the\s?site)\b/i;
    const kwMatch = text.match(offPlatformKeywords);
    if (kwMatch) {
      flags.push({ type: 'OFF_PLATFORM_PAYMENT', snippet: kwMatch[0], severity: 'HIGH' });
    }

    return { detectedFlags: flags };
  }

  // --- AUDIT LOGGING ---
  logAudit(entry: Omit<AuditLog, 'id' | 'created_at'>) {
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...entry,
    };
    this.state.audit_logs.push(log);
    return log;
  }

  getAuditLogs() {
    return [...this.state.audit_logs].reverse();
  }

  // --- ADMIN KPIS & ANALYTICS ---
  getAdminStats() {
    const totalStudents = this.state.profiles.filter((p) => p.role === 'STUDENT').length;
    const totalTutors = this.state.profiles.filter((p) => p.role === 'TUTOR').length;
    const approvedTutors = this.state.tutor_profiles.filter((t) => t.is_approved).length;
    const pendingVerifications = this.state.verification_documents.filter(
      (v) => v.status === 'PENDING_REVIEW'
    ).length;
    const totalBookings = this.state.bookings.length;
    const completedClasses = this.state.bookings.filter((b) => b.status === 'COMPLETED').length;

    // Financial ledger sums from locked snapshots
    const grossRevenueCents = this.state.booking_financial_snapshots.reduce(
      (sum, s) => sum + s.gross_amount,
      0
    );
    const platformCommissionCents = this.state.booking_financial_snapshots.reduce(
      (sum, s) => sum + s.platform_fee_amount,
      0
    );
    const tutorEarningsCents = this.state.booking_financial_snapshots.reduce(
      (sum, s) => sum + s.tutor_earnings,
      0
    );

    const pendingFlagsCount = this.state.message_flags.filter(
      (f) => f.status === 'PENDING_REVIEW'
    ).length;

    return {
      totalStudents,
      totalTutors,
      approvedTutors,
      pendingVerifications,
      totalBookings,
      completedClasses,
      grossRevenueCents,
      platformCommissionCents,
      tutorEarningsCents,
      pendingFlagsCount,
      activeClasses: this.state.classes.filter((c) => c.status === 'PUBLISHED' || c.status === 'OPEN').length,
    };
  }

  // --- VERIFICATION ADMIN ACTIONS ---
  updateVerificationDocumentStatus(docId: string, status: any, adminNotes?: string) {
    const doc = this.state.verification_documents.find((d) => d.id === docId);
    if (doc) {
      doc.status = status;
      doc.admin_notes = adminNotes || doc.admin_notes;
      doc.reviewed_at = new Date().toISOString();

      // If approved, update user's profile and tutor profile
      if (status === 'APPROVED') {
        const tutor = this.state.tutor_profiles.find((t) => t.user_id === doc.user_id);
        if (tutor) tutor.is_approved = true;
        const profile = this.state.profiles.find((p) => p.id === doc.user_id);
        if (profile) profile.verification_status = 'APPROVED';
      }

      this.logAudit({
        actor_id: 'usr-admin-1',
        actor_role: 'ADMIN',
        action: `DOCUMENT_${status}`,
        entity_type: 'VERIFICATION_DOCUMENT',
        entity_id: docId,
        metadata: { status, adminNotes },
      });
    }
    return doc;
  }

  // --- SUPPORT TICKETS ---
  getSupportTickets() {
    return this.state.support_tickets;
  }

  createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>) {
    const newTkt: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.support_tickets.push(newTkt);
    return newTkt;
  }

  // Helper for test creation
  createUser(profile: Partial<UserProfile> & {
    email: string;
    role: any;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    accountStatus?: any;
    emailVerified?: boolean;
    verificationStatus?: any;
  }) {
    const fn = profile.first_name || profile.firstName || 'User';
    const ln = profile.last_name || profile.lastName || '';
    const newUser: UserProfile = {
      ...profile,
      id: `usr-test-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email: profile.email,
      role: profile.role,
      first_name: fn,
      last_name: ln,
      full_name: `${fn} ${ln}`.trim(),
      account_status: profile.account_status || profile.accountStatus || 'ACTIVE',
      email_verified: profile.email_verified ?? profile.emailVerified ?? true,
      verification_status: profile.verification_status || profile.verificationStatus || 'NOT_SUBMITTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UserProfile;
    this.state.profiles.push(newUser);
    return newUser;
  }

  // --- MONTHLY VISITORS ---
  incrementMonthlyVisitor(): number {
    const curMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-11"
    const settingKey = `visitor_count_${curMonth}`;
    const idx = this.state.platform_settings.findIndex((s) => s.key === settingKey);

    if (idx === -1) {
      const initialValue = 1;
      this.state.platform_settings.push({
        key: settingKey,
        value: { count: initialValue },
        description: `Total unique visitors for ${curMonth}`,
        updated_at: new Date().toISOString(),
      });
      return initialValue;
    }

    const currentObj = this.state.platform_settings[idx].value;
    const currentCount = typeof currentObj?.count === 'number' ? currentObj.count : 0;
    const nextCount = currentCount + 1;

    this.state.platform_settings[idx].value = { count: nextCount };
    this.state.platform_settings[idx].updated_at = new Date().toISOString();
    return nextCount;
  }

  getMonthlyVisitorCount(): number {
    const curMonth = new Date().toISOString().slice(0, 7);
    const item = this.state.platform_settings.find((s) => s.key === `visitor_count_${curMonth}`);
    if (!item?.value) return 0;
    const count = item.value.count;
    return typeof count === 'number' ? count : 0;
  }

  // --- ADVERTS ENGINE ---
  getActiveAdverts(): AdvertItem[] {
    const now = new Date().getTime();
    return (this.state.adverts || [])
      .filter((ad) => {
        if (!ad.is_active) return false;
        if (ad.start_date && new Date(ad.start_date).getTime() > now) return false;
        if (ad.end_date && new Date(ad.end_date).getTime() < now) return false;
        return true;
      })
      .sort((a, b) => a.display_order - b.display_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getAllAdverts(): AdvertItem[] {
    return (this.state.adverts || []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  createAdvert(data: Omit<AdvertItem, 'id' | 'view_count' | 'download_count' | 'created_at' | 'updated_at'>): AdvertItem {
    const newAdvert: AdvertItem = {
      ...data,
      id: `adv-${Date.now()}`,
      view_count: 0,
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!this.state.adverts) this.state.adverts = [];
    this.state.adverts.unshift(newAdvert);
    return newAdvert;
  }

  updateAdvert(id: string, updates: Partial<AdvertItem>): AdvertItem | null {
    const idx = (this.state.adverts || []).findIndex((ad) => ad.id === id);
    if (idx === -1) return null;
    this.state.adverts[idx] = {
      ...this.state.adverts[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.state.adverts[idx];
  }

  deleteAdvert(id: string): boolean {
    const lenBefore = (this.state.adverts || []).length;
    this.state.adverts = (this.state.adverts || []).filter((ad) => ad.id !== id);
    return this.state.adverts.length < lenBefore;
  }

  incrementAdvertView(id: string): number {
    const ad = (this.state.adverts || []).find((a) => a.id === id);
    if (ad) {
      ad.view_count = (ad.view_count || 0) + 1;
      return ad.view_count;
    }
    return 0;
  }

  incrementAdvertDownload(id: string): number {
    const ad = (this.state.adverts || []).find((a) => a.id === id);
    if (ad) {
      ad.download_count = (ad.download_count || 0) + 1;
      return ad.download_count;
    }
    return 0;
  }

  // --- PASSWORD RESET ENGINE ---
  createPasswordResetToken(email: string): { token: string; user: UserProfile } | null {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.state.profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (!user) return null;

    const token = `rst_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    user.reset_password_token = token;
    user.reset_password_expires_at = expiresAt;
    user.updated_at = new Date().toISOString();

    return { token, user };
  }

  verifyPasswordResetToken(email: string, token: string): { valid: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.state.profiles.find((p) => p.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { valid: false, error: 'User not found' };
    }

    if (!user.reset_password_token || user.reset_password_token !== token) {
      return { valid: false, error: 'Invalid reset token' };
    }

    if (!user.reset_password_expires_at || new Date(user.reset_password_expires_at).getTime() < Date.now()) {
      return { valid: false, error: 'Reset token has expired' };
    }

    return { valid: true, user };
  }

  resetPasswordWithToken(email: string, token: string, newPasswordHash: string): boolean {
    const check = this.verifyPasswordResetToken(email, token);
    if (!check.valid || !check.user) return false;

    check.user.password_hash = newPasswordHash;
    check.user.reset_password_token = null;
    check.user.reset_password_expires_at = null;
    check.user.updated_at = new Date().toISOString();
    return true;
  }
}

// Global Singleton for development
const globalForData = globalThis as unknown as { dataStore: DataStore };
export const db = globalForData.dataStore || new DataStore();
// Ensure admin in existing memory singleton is updated
const existingAdmin = db.state?.profiles?.find((p) => p.role === 'ADMIN');
if (existingAdmin) {
  existingAdmin.email = 'admin@levchary.com';
  existingAdmin.first_name = 'Admin';
  existingAdmin.last_name = 'Levchary';
}
export const dataStore = db;
if (process.env.NODE_ENV !== 'production') globalForData.dataStore = db;
