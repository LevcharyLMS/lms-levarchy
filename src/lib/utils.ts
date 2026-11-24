import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strict privacy name formatting: "FirstName + first letter of LastName (without period)".
 * Examples:
 *   formatDisplayName("Marcus", "Chen") => "Marcus C"
 *   formatDisplayName("Dr. Marcus", "Chen") => "Dr. Marcus C"
 *   formatDisplayName("Lucas", "") => "Lucas"
 *   formatDisplayName("", "") => "User"
 */
export function formatDisplayName(firstName?: string | null, lastName?: string | null): string {
  const first = (firstName || "").trim();
  const lastInitial = (lastName || "").trim().charAt(0).toUpperCase();

  if (!first && !lastInitial) return "User";
  if (!first) return lastInitial;
  if (!lastInitial) return first;

  return `${first} ${lastInitial}`;
}

/**
 * Format monetary amount stored in minor units (integer cents) safely.
 * Prevents floating point errors.
 * Example: 3500 cents -> "$35.00"
 */
export function formatMoney(cents: number, currency: string = "USD"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate locked financial snapshot values given a gross price and platform fee percent.
 * All amounts returned in integer cents.
 */
export function calculateFinancialSnapshot(
  grossAmountCents: number,
  platformFeePercent: number = 20.0,
  stripeFeePercent: number = 2.9,
  stripeFixedFeeCents: number = 30
): {
  gross_amount: number;
  platform_fee_percent: number;
  platform_fee_amount: number;
  tutor_earnings: number;
  stripe_fee_estimate: number;
} {
  const platform_fee_amount = Math.round((grossAmountCents * platformFeePercent) / 100);
  const tutor_earnings = grossAmountCents - platform_fee_amount;
  const stripe_fee_estimate = Math.round((grossAmountCents * stripeFeePercent) / 100) + stripeFixedFeeCents;

  return {
    gross_amount: grossAmountCents,
    platform_fee_percent: platformFeePercent,
    platform_fee_amount,
    tutor_earnings,
    stripe_fee_estimate,
  };
}

/**
 * Generate a cryptographically secure, human-readable unique booking number
 * Example: LEV-202609-X9A7K
 */
export function generateBookingNumber(): string {
  const dateStr = format(new Date(), "yyyyMM");
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `LEV-${dateStr}-${randomChars}`;
}

/**
 * Format ISO datetime string to friendly readable format
 */
export function formatDateTime(isoString: string, formatStr: string = "MMM d, yyyy h:mm a"): string {
  try {
    const date = typeof isoString === "string" ? parseISO(isoString) : new Date(isoString);
    return format(date, formatStr);
  } catch {
    return isoString;
  }
}

/**
 * Format ISO date string
 */
export function formatDate(isoString: string, formatStr: string = "MMM d, yyyy"): string {
  try {
    const date = typeof isoString === "string" ? parseISO(isoString) : new Date(isoString);
    return format(date, formatStr);
  } catch {
    return isoString;
  }
}

/**
 * Relative time: "2 hours ago", "in 3 days"
 */
export function formatRelative(isoString: string): string {
  try {
    const date = typeof isoString === "string" ? parseISO(isoString) : new Date(isoString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return isoString;
  }
}

/**
 * Truncate text cleanly with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Role display helper
 */
export function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "TUTOR":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "STUDENT":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

/**
 * Parse dollar strings or numbers safely to integer cents
 */
export function parseMoneyToCents(amount: string | number): number {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Safely determine whether a student account has completed onboarding.
 * Detects:
 *   1. Explicit onboarding_completed: true boolean
 *   2. Parsed or stringified JSON preferences
 *   3. Existing student who already has grade_level configured
 *   4. Existing student with learning goals or subjects chosen
 *   5. Completed timestamp
 */
export function isStudentOnboarded(studentProfile: any, user?: any): boolean {
  if (!studentProfile && !user) return false;

  let prefs = studentProfile?.preferences;
  if (typeof prefs === "string") {
    try {
      prefs = JSON.parse(prefs);
    } catch {
      prefs = {};
    }
  }

  // 1. Explicit onboarding_completed flag
  if (prefs?.onboarding_completed === true) return true;

  // 2. Completed at timestamp exists
  if (prefs?.completed_at) return true;

  // 3. Existing student who already has grade_level populated
  if (studentProfile?.grade_level && String(studentProfile.grade_level).trim().length > 0) {
    return true;
  }

  // 4. Existing student with learning goals or subjects already selected
  if (studentProfile?.learning_goals && String(studentProfile.learning_goals).trim().length > 0) {
    return true;
  }
  if (Array.isArray(prefs?.subjects) && prefs.subjects.length > 0) {
    return true;
  }

  return false;
}
