# Architecture & System Design — Levchary LMS

## 1. System Architecture Overview

Levchary LMS is architected around a domain-driven, company-controlled model where business integrity, security boundaries, and financial immutability are enforced on the server layer.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|  +--------------------+     +--------------------+     +--------------------+     |
|  |   Student Portal   |     |    Tutor Portal    |     |   Admin Control    |     |
|  |  (/student/*)      |     |   (/tutor/*)       |     |   (/admin/*)       |     |
|  +--------------------+     +--------------------+     +--------------------+     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v  HTTPS / Cookies / Sessions
+-----------------------------------------------------------------------------------+
|                              NEXT.JS SERVER LAYER                                 |
|                                                                                   |
|  +----------------------+  +---------------------+  +--------------------------+  |
|  | Route Handlers & API |  | Auth / RBAC Guards  |  | Server Actions           |  |
|  | (/api/bookings, etc) |  | (AuthService)       |  | (Strict Server Execution) |  |
|  +----------+-----------+  +----------+----------+  +------------+-------------+  |
+-------------|-------------------------|--------------------------|----------------+
              |                         |                          |
              +-------------------------v--------------------------+
                                        |
+---------------------------------------v-------------------------------------------+
|                              DOMAIN SERVICES LAYER                                |
|                                                                                   |
|  +--------------------+  +--------------------+  +--------------------+           |
|  |   BookingService   |  |   PaymentService   |  | GoogleMeetService  |           |
|  |   (Concurrency)    |  |   (Stripe & Payout)|  | (Calendar & Meet)  |           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  |  ModerationService |  |   StorageService   |  |    AuditService    |           |
|  |  (Safety Filters)  |  |   (Signed URLs)    |  |    (Append-only)   |           |
|  +--------------------+  +--------------------+  +--------------------+           |
+---------------------------------------+-------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                               DATABASE & INTEGRATIONS                             |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                        Supabase PostgreSQL Engine                           |  |
|  |   - Row-Level Security (RLS)               - Atomic Booking Triggers        |  |
|  |   - Immutable Snapshot Enforcement          - Append-Only Audit Logs         |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +--------------------+  +--------------------+  +--------------------+           |
|  |   Stripe Connect   |  |  Google Cloud API  |  |    Resend Email    |           |
|  |   (Payments & Tx)  |  |  (Meet Video Conf) |  |    (Notifications) |           |
|  +--------------------+  +--------------------+  +--------------------+           |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Principles

### 1. Company Authority over Marketplace
Tutors are contractors in the platform ecosystem. They cannot arbitrarily alter commission rates, override platform refund policies, delete audit records, or bypass verification requirements. Administration retains absolute visibility and veto power over all marketplace activity.

### 2. Immutability of Historical Transactions (Rule 12 & Rule 59)
When a class booking is made, all financial parameters (`gross_amount`, `platform_fee_percent`, `platform_fee_amount`, `tutor_earnings`, `stripe_fee_estimate`) are locked into a dedicated `booking_financial_snapshots` record. If an administrator later alters platform commission rates or the tutor changes their hourly price, historical transactions remain unchanged.

### 3. Concurrency Protection & Zero Double-Booking
For 1-on-1 classes, slot booking is atomic:
- Pre-reservation conflict detection checks overlapping time intervals for the specific tutor across all active bookings.
- In PostgreSQL, the `reserve_one_on_one_slot()` function uses `SELECT ... FOR UPDATE` row-level locks on the tutor's availability slot to prevent race conditions when two students click "Book" simultaneously.
- For group classes, `enroll_group_class_atomic()` executes an atomic increment on `enrolled_count` and immediately changes the status to `'FULL'` if `enrolled_count == capacity`. Any subsequent transaction receives an immediate rejection.

### 4. Zero Sensitive Data Exposure
- Private verification documents (Government Passports, Driver's Licenses, Academic Transcripts) are isolated in private Supabase Storage buckets.
- Documents are accessed exclusively via 15-minute expiring cryptographic signed tokens.
- Every retrieval is recorded in the append-only audit ledger with the administrator's ID and timestamp.

---

## 3. State Machines

### A. Tutor Verification Lifecycle
```
                 +-------------------+
                 |   NOT_SUBMITTED   |
                 +---------+---------+
                           |
                           v (Submit credentials & ID)
                 +-------------------+
                 |  PENDING_REVIEW   |
                 +---+-----------+---+
                     |           |
 (Admin Approves)    |           | (Admin Requests Changes)
         +-----------+           +-----------+
         v                                   v
+-----------------+                 +-------------------------+
|    APPROVED     |                 |  RESUBMISSION_REQUIRED  |
+--------+--------+                 +------------+------------+
         |                                       |
         | (Admin Action)                        v
         v                          (Tutor resubmits documents)
+-----------------+
|    SUSPENDED    |
+-----------------+
```
- **Rule 1 Enforcement**: Only tutors in the `APPROVED` state have publicly discoverable profiles and can have bookable classes.

### B. Class Booking Lifecycle
```
PENDING_PAYMENT ──> PAYMENT_PROCESSING ──> CONFIRMED ──> IN_PROGRESS ──> COMPLETED
       │                                       │
       └──> (Abandon / Timeout)                └──> CANCELLED ──> REFUND_PENDING ──> REFUNDED
```

---

## 4. Domain Service Layer

- `src/services/auth.ts`: Enforces RBAC permissions and rejects suspended user sessions.
- `src/services/booking.ts`: Handles atomic 1-on-1 scheduling and group capacity enforcement.
- `src/services/stripe.ts`: Manages Stripe Checkout sessions, Connect account onboarding, and webhook dispatching with idempotency.
- `src/services/google-meet.ts`: Interacts with Google Calendar API using server-side JWT authentication to create conferencing rooms.
- `src/services/moderation.ts`: Scans messaging payloads using regex filters for phone numbers, emails, off-platform payment services, and third-party chat apps.
- `src/services/storage.ts`: Generates short-lived signed URLs for documents and validates MIME types and file sizes.
- `src/services/audit.ts`: Appends tamper-proof audit trails for administrative, financial, and security actions.
- `src/services/notification.ts`: Dispatches in-app notifications and email notifications with idempotency keys.
