# Testing Guide & Test Suite Documentation — Levchary LMS

## 1. Test Strategy Overview

Levchary LMS enforces automated testing across critical business constraints, concurrency guards, financial accuracy, and data security.

---

## 2. Test Suite Architecture (`tests/levchary.test.ts`)

The test suite uses **Vitest** for fast, deterministic, in-memory execution:

| Test Suite Category | Tested Rule / Requirement | Description |
| :--- | :--- | :--- |
| **1. Financial Precision & Immutability** | Rule 12 & Rule 59 | Verifies calculation of platform fees, tutor net earnings, and Stripe fees in integer minor units (cents) with zero floating-point drift. Confirms format and parse helpers. |
| **2. Message Safety & Moderation** | Rule 17, 18, 19, Section 28 | Tests real-time regex filtering for PayPal, Venmo, Zelle, CashApp, cryptocurrency, formatted phone numbers, emails, and allows benign educational messages. |
| **3. Scheduling Engine & Concurrency** | Rule 10 & Rule 11 | Confirms atomic 1-on-1 slot conflict rejection (double-booking prevention) and group class capacity capping at max enrollment. |
| **4. RBAC & Security Authorization** | Rule 1, 3, 4, 5, 20 | Enforces teaching restrictions to approved tutors only, rejects student access to admin areas, and halts operations for suspended accounts. |
| **5. Storage Security & Signed URLs** | Rule 2 & Section 10 | Verifies generation of short-lived signed URLs with 15-minute expiration, validates MIME types, rejects executables, and caps uploads at 10MB. |
| **6. Historical Transaction Immutability** | Rule 12 | Validates that existing bookings retain their locked pricing even after an administrator modifies the class price in the database. |

---

## 3. Running Automated Tests

```bash
# Execute full test suite
npm run test

# Run tests in watch mode for development
npm run test:watch

# Execute strict TypeScript type validation
npm run type-check

# Execute production Next.js build compilation
npm run build
```

---

## 4. Current Test Results

```
 ✓ tests/levchary.test.ts (16 tests) 228ms

 Test Files  1 passed (1)
      Tests  16 passed (16)
   Duration  8.36s
```
All 16 mission-critical unit and integration tests pass with zero failures and zero warnings.
