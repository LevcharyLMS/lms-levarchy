// ============================================================
// LEVCHARY LMS - DOMAIN TYPE DEFINITIONS
// Strict TypeScript types for all models, roles & state machines
// ============================================================

export type UserRole = 'STUDENT' | 'TUTOR' | 'ADMIN' | 'SYSTEM';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export type VerificationStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUIRED'
  | 'SUSPENDED';

export type ClassType = 'ONE_ON_ONE' | 'GROUP';

export type ClassFormat = 'VIRTUAL' | 'PHYSICAL';

export type ClassStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'OPEN'
  | 'FULL'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export type RefundStatus =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'ELIGIBLE'
  | 'NOT_ELIGIBLE'
  | 'APPROVED'
  | 'PROCESSING'
  | 'REFUNDED'
  | 'REJECTED';

export type PayoutStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type MessageFlagType =
  | 'PHONE'
  | 'EMAIL'
  | 'OFF_PLATFORM_PAYMENT'
  | 'SUSPICIOUS_NAME'
  | 'HARASSMENT';

export type FlagSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type FlagStatus =
  | 'PENDING_REVIEW'
  | 'DISMISSED'
  | 'WARNED'
  | 'RESTRICTED'
  | 'ACTIONED';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_USER'
  | 'RESOLVED'
  | 'CLOSED';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  postal_code?: string | null;
  account_status: AccountStatus;
  verification_status: VerificationStatus;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface StudentProfile {
  user_id: string;
  grade_level?: string | null;
  learning_goals?: string | null;
  parent_guardian_name?: string | null;
  parent_guardian_phone?: string | null;
  parent_guardian_email?: string | null;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TutorProfile {
  user_id: string;
  headline?: string | null;
  bio?: string | null;
  qualifications?: string | null;
  experience_years: number;
  hourly_rate: number; // in integer cents ($40.00 = 4000)
  stripe_account_id?: string | null;
  stripe_onboarding_completed: boolean;
  rating_avg: number;
  reviews_count: number;
  is_approved: boolean;
  preferred_format: 'VIRTUAL' | 'PHYSICAL' | 'BOTH';
  timezone: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: UserProfile;
  subjects?: Subject[];
  grades?: Grade[];
}

export interface TutorApplication {
  id: string;
  tutor_id: string;
  status: VerificationStatus;
  submitted_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  tutor?: UserProfile;
}

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: string; // 'GOVERNMENT_ID', 'PASSPORT', 'DEGREE_CERTIFICATE', etc.
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  status: VerificationStatus;
  admin_notes?: string | null;
  uploaded_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  signed_url?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  category?: Category;
}

export interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string | null;
  created_at: string;
}

export interface ClassLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  capacity: number;
  directions?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;  // "09:00"
  end_time: string;    // "12:00"
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityException {
  id: string;
  tutor_id: string;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  is_blocked: boolean;
  reason?: string | null;
  created_at: string;
}

export interface ClassItem {
  id: string;
  title: string;
  description: string;
  tutor_id: string;
  category_id: string;
  subject_id: string;
  grade_id?: string | null;
  class_type: ClassType;
  format: ClassFormat;
  duration_minutes: number;
  price: number; // in cents
  currency: string;
  capacity: number;
  enrolled_count: number;
  location_id?: string | null;
  meet_url?: string | null;
  meet_event_id?: string | null;
  status: ClassStatus;
  start_time?: string | null;
  end_time?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  tutor?: UserProfile & { tutor_profile?: TutorProfile };
  subject?: Subject;
  category?: Category;
  grade?: Grade;
  location?: ClassLocation;
}

export interface ClassSession {
  id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  timezone: string;
  meet_url?: string | null;
  meet_event_id?: string | null;
  status: ClassStatus;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  student_id: string;
  tutor_id: string;
  class_id: string;
  session_id?: string | null;
  status: BookingStatus;
  start_time: string;
  end_time: string;
  timezone: string;
  format: ClassFormat;
  location_id?: string | null;
  meet_url?: string | null;
  meet_event_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  student?: UserProfile;
  tutor?: UserProfile;
  class_item?: ClassItem;
  location?: ClassLocation;
  financial_snapshot?: BookingFinancialSnapshot;
}

export interface BookingFinancialSnapshot {
  id: string;
  booking_id: string;
  gross_amount: number; // in integer cents
  platform_fee_percent: number;
  platform_fee_amount: number; // in integer cents
  tutor_earnings: number; // in integer cents
  stripe_fee_estimate: number;
  currency: string;
  locked_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  student_id: string;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  booking_id?: string | null;
  student_id?: string | null;
  tutor_id?: string | null;
  type: 'PAYMENT' | 'COMMISSION' | 'PAYOUT' | 'REFUND';
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  stripe_charge_id?: string | null;
  stripe_transfer_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  booking?: Booking;
  student?: UserProfile;
  tutor?: UserProfile;
}

export interface Refund {
  id: string;
  booking_id: string;
  student_id: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  admin_notes?: string | null;
  stripe_refund_id?: string | null;
  requested_at: string;
  processed_at?: string | null;
  reviewed_by?: string | null;
  booking?: Booking;
  student?: UserProfile;
}

export interface Payout {
  id: string;
  tutor_id: string;
  stripe_transfer_id?: string | null;
  amount: number;
  currency: string;
  status: PayoutStatus;
  arrival_date?: string | null;
  created_at: string;
  tutor?: UserProfile;
}

export interface CommissionRule {
  id: string;
  name: string;
  default_percent: number;
  effective_from: string;
  effective_to?: string | null;
  is_active: boolean;
  created_at: string;
  created_by?: string | null;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  participants?: UserProfile[];
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  has_flag: boolean;
  created_at: string;
  sender?: UserProfile;
  flag?: MessageFlag;
}

export interface MessageFlag {
  id: string;
  message_id: string;
  flag_type: MessageFlagType;
  detected_text: string;
  severity: FlagSeverity;
  status: FlagStatus;
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  message?: Message;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'PAYMENT' | 'CLASS_REMINDER' | 'MESSAGE' | 'VERIFICATION' | 'PAYOUT' | 'SYSTEM';
  link?: string | null;
  is_read: boolean;
  idempotency_key?: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  student_id: string;
  tutor_id: string;
  rating: number; // 1 to 5
  comment?: string | null;
  is_moderated: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  student?: UserProfile;
  tutor?: UserProfile;
  class_item?: ClassItem;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_role?: UserRole | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  actor?: UserProfile;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: TicketStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface PlatformSettings {
  key: string;
  value: Record<string, unknown>;
  description?: string | null;
  updated_at: string;
  updated_by?: string | null;
}
