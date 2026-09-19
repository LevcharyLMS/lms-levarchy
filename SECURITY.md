# Security Architecture & Hardening — Levchary LMS

## 1. Security Overview

Levchary LMS enforces a defense-in-depth model across the entire application lifecycle. The architecture is engineered to guarantee zero unauthorized data leakage, strict role-based access control, cryptographic verification for sensitive documents, and active protection against off-platform disintermediation.

---

## 2. Core Security Pillars

### 1. Server-Side Authorization & Anti-Tampering (Rule 3, 4, 5, 20)
- **Zero Client-Side Trust**: Role claims, prices, discount rates, and commission percentages sent by the browser are never trusted. All calculations and permission checks execute server-side in Next.js Server Components, Server Actions, and PostgreSQL policies.
- **Account Suspension Enforcement (Rule 20)**: Suspended accounts (`account_status = 'SUSPENDED'`) are immediately blocked by `AuthService.requireRole()` and middleware from taking actions, creating bookings, messaging tutors, or modifying availability.
- **Tutor Teaching Gate (Rule 1)**: Even if a tutor is authenticated, they cannot teach or publish bookable availability unless their `verification_status` is explicitly set to `'APPROVED'`.

### 2. Private Storage & Expiring Signed URLs (Rule 2)
- Sensitive identity documents (driver's licenses, passports, educational degrees) are isolated in a private bucket (`verification-documents`).
- The frontend never receives permanent public file URLs.
- Admin review uses short-lived (15-minute) cryptographically signed URLs (`/api/documents/view?path=...&token=...&expires=...`).
- Expired or forged tokens immediately return `403 Forbidden`.
- Every document access is logged in the append-only audit trail (`SENSITIVE_DOCUMENT_ACCESSED`) with the reviewer's ID.

### 3. Messaging Safety & Content Moderation (Section 28)
- Real-time regex inspection on all chat payloads (`ModerationService.scanText`).
- **Off-Platform Payment Prevention**: Detects references to PayPal, Venmo, CashApp, Zelle, Western Union, wire transfer, Bitcoin, or cash-in-person. Messages are immediately tagged with `HIGH` severity.
- **Direct Contact Exchange Prevention**: Detects international and local phone numbers in various formats (`+1`, dashes, spaces, brackets) and personal email addresses.
- **Nuanced Name Flagging**: Ordinary full names are flagged for administrative review (`LOW` severity) rather than abruptly blocking legitimate educational introductions.

### 4. Financial Precision & Immutability (Rule 12 & 59)
- All monetary values are maintained in integer minor units (`cents`). Floating-point arithmetic drift is prohibited.
- `booking_financial_snapshots` records are created upon reservation and locked via database triggers.
- Webhook signature validation (`stripe.webhooks.constructEvent`) verifies every payment event from Stripe.

### 5. File Upload Hardening (Section 42)
- Verification uploads accept only approved MIME types (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`).
- Hard 10 MB payload ceiling.
- Files are saved with randomized nonces to eliminate path traversal (`../`) and executable file exploits.

---

## 3. Vulnerability Mitigation Checklist

| Vulnerability | Mitigation Implemented |
| :--- | :--- |
| **SQL Injection** | Parameterized queries via Supabase PostgreSQL client and stored procedures |
| **Cross-Site Scripting (XSS)** | React JSX auto-escaping, sanitized markdown rendering |
| **Cross-Site Request Forgery (CSRF)** | SameSite=Lax/Strict session cookies, Next.js server actions validation |
| **Broken Object Level Auth (BOLA)** | Server-side ownership verification (`booking.student_id === session.user.id`) |
| **Data Scraping** | Paginated API queries, strict RLS limits on user directory |
| **Secret Leakage** | All Google API keys, Stripe Secret Keys, and Resend credentials kept server-side |
