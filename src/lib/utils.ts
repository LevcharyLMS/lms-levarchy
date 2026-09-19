import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
