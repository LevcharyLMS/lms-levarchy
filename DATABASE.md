# Database Architecture & Security — Levchary LMS

## 1. Schema Overview

Levchary LMS employs a normalized PostgreSQL schema managed via Supabase. All primary keys use `UUID` or formatted domain identifiers. Money values are strictly stored in integer minor units (cents) with ISO currency codes (e.g. `USD`).

```
+---------------------------------------------------------------------------------+
|                                 DATABASE SCHEMA                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [users / auth.users]                                                           |
|       │ 1:1                                                                     |
|       ├──> [profiles] (role, status, verification_status, contact details)      |
|       │       ├──> [student_profiles] (grade, learning preferences)             |
|       │       └──> [tutor_profiles] (bio, hourly_rate, is_approved, rating_avg) |
|       │                                                                         |
|       ├──> [tutor_applications] (credentials, experience, review notes)         |
|       │                                                                         |
|       ├──> [verification_documents] (mime, size, private path, signed access)   |
|       │                                                                         |
|       ├──> [tutor_availability] (day_of_week, start_time, end_time)            |
|       │                                                                         |
|       └──> [classes] (title, type, format, price_cents, capacity, enrolled)    |
|               │                                                                 |
|               ├──> [categories] (Mathematics, Sciences, Languages)              |
|               ├──> [subjects] (Calculus, Physics, Python)                       |
|               ├──> [grades] (High School, Undergraduate, Professional)          |
|               ├──> [class_locations] (Physical venue address & capacity)       |
|               │                                                                 |
|               └──> [bookings] (start_time, end_time, meet_url, status)          |
|                       │ 1:1                                                     |
|                       ├──> [booking_financial_snapshots] (IMMUTABLE CENTS)     |
|                       ├──> [transactions] (gross, fees, tutor_net, stripe_id)   |
|                       ├──> [reviews] (rating 1-5, comment, is_published)       |
|                       └──> [refunds] (amount_cents, reason, status)             |
|                                                                                 |
|  [conversations]                                                                |
|       └──> [messages] (body, is_read, has_flag)                                 |
|               └──> [message_flags] (OFF_PLATFORM_PAYMENT, PHONE, EMAIL)         |
|                                                                                 |
|  [notifications] (title, type, is_read, idempotency_key)                        |
|                                                                                 |
|  [audit_logs] (actor_id, actor_role, action, entity_type, metadata) [APPEND-ONLY]|
|                                                                                 |
|  [commission_rules] (version, platform_percent, active_from)                    |
+---------------------------------------------------------------------------------+
```

---

## 2. Row Level Security (RLS) Matrix

| Entity | Student Role | Tutor Role | Admin / Owner Role |
| :--- | :--- | :--- | :--- |
| `profiles` | Read all public; Update own profile | Read all public; Update own profile | Full Read/Write all profiles |
| `tutor_profiles` | Read approved tutors only | Read all; Update own profile | Full Read/Write |
| `verification_documents` | Read own uploaded docs | Read own uploaded docs | Full Read/Write |
| `classes` | Read published/open classes | Read all; Write own classes | Full Read/Write |
| `bookings` | Read own student bookings | Read own tutor bookings | Full Read/Write all bookings |
| `financial_snapshots` | Read own booking snapshot | Read own booking snapshot | Full Read (Updates forbidden) |
| `transactions` | Read own payment receipts | Read own earnings transactions | Full Read/Write |
| `messages` | Read/Write participated convos | Read/Write participated convos | Read flagged messages for review |
| `message_flags` | No access | No access | Full Read/Write review queue |
| `audit_logs` | No access | No access | Read-Only (Deletions forbidden) |
| `commission_rules` | No access | No access | Full Read/Write |

---

## 3. Database Triggers & Concurrency Functions

### Immutability of Financial Snapshots Trigger
```sql
CREATE OR REPLACE FUNCTION prevent_snapshot_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Rule 12 Violation: Historical booking financial snapshots are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_financial_snapshots
BEFORE UPDATE OR DELETE ON booking_financial_snapshots
FOR EACH ROW EXECUTE FUNCTION prevent_snapshot_modification();
```

### Atomic 1-on-1 Slot Reservation
The PostgreSQL stored function `reserve_one_on_one_slot(p_tutor_id, p_student_id, p_class_id, p_start_time, p_end_time)` acquires a lock on the tutor's booking rows using:
```sql
PERFORM 1 FROM bookings
WHERE tutor_id = p_tutor_id
  AND status IN ('CONFIRMED', 'PENDING_PAYMENT')
  AND (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
FOR UPDATE;
```
If an overlap exists, an exception with code `ERR_SLOT_CONFLICT` is raised, rolling back the transaction immediately.

### Atomic Group Class Enrollment
```sql
UPDATE classes
SET enrolled_count = enrolled_count + 1,
    status = CASE WHEN enrolled_count + 1 >= capacity THEN 'FULL' ELSE status END
WHERE id = p_class_id AND enrolled_count < capacity;
```
If no rows are updated (`FOUND` is false), the function immediately aborts with `ERR_CLASS_FULL`.

---

## 4. Migration Files Reference

- `supabase/migrations/001_initial_schema.sql`: Core relational DDL and indexes.
- `supabase/migrations/002_functions_and_triggers.sql`: Concurrency functions and immutability triggers.
- `supabase/migrations/003_rls_policies.sql`: Complete RLS security policies.
- `supabase/seed.sql`: Realistic demonstration dataset.
