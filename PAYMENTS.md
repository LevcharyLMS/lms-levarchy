# Payment Architecture & Stripe Connect — Levchary LMS

## 1. Overview

Levchary LMS implements a double-sided payment ledger supporting student payments via Stripe Checkout and tutor earnings payouts via Stripe Connect (Custom/Express).

---

## 2. Core Financial Flow

```
[Student] 
   │
   ├── 1. Books Class (Selects slot or enrolls in group)
   │
   ├── 2. Server creates Checkout Session
   │      - Base Price: $65.00 (6500 cents)
   │      - Platform Fee: 20% ($13.00)
   │      - Tutor Net: 80% ($52.00)
   │      - Stripe Fee (estimate): $2.19
   │
   ├── 3. Enters payment on Stripe hosted checkout
   │
   v
[Stripe]
   │
   ├── 4. Processes Card / Apple Pay / Google Pay
   │
   v Webhook: checkout.session.completed (signed with STRIPE_WEBHOOK_SECRET)
[Next.js Server: /api/webhooks/stripe]
   │
   ├── 5. Validates cryptographic webhook signature
   │
   ├── 6. Checks event idempotency (prevents double-processing)
   │
   ├── 7. Transitions booking status to CONFIRMED
   │
   ├── 8. Creates immutable BookingFinancialSnapshot
   │
   ├── 9. Credits tutor's pending balance
   │
   └── 10. Automatically schedules Google Meet video session
```

---

## 3. Stripe Connect & Tutor Payouts

- **Onboarding**: Tutors onboard via Stripe Connect Express/Custom (`/tutor/payouts`).
- **Account Verification**: Tutors must complete Stripe identity verification (`charges_enabled = true` and `payouts_enabled = true`) to receive automatic disbursements.
- **Payout Trigger**: After a class session is marked `COMPLETED` and the cancellation window expires, funds transition from pending to available for transfer via `stripe.transfers.create()`.
- **Fee Transparency**: Tutors have full visibility into gross student payments, platform commission deductions, and net payouts in their dedicated earnings dashboard (`/tutor/earnings`).

---

## 4. Refund & Cancellation Engine

Configurable cancellation and refund policies are enforced through `PlatformSettings`:
- **Full Refund Window**: Cancellations made >48 hours before session start receive a 100% refund.
- **Partial Refund Window**: Cancellations made between 24 and 48 hours receive a 50% refund.
- **Locked Window**: Cancellations within <24 hours of start time are non-refundable to protect the tutor's reserved time.
- **Admin Overrides**: Administrators can execute manual override refunds via `/admin/refunds`, triggering `stripe.refunds.create()` and recording the audit rationale.

---

## 5. Webhook Idempotency

All incoming webhook events are recorded in `webhook_events`:
```sql
CREATE TABLE webhook_events (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
If a webhook with the same Stripe Event ID (`evt_...`) is delivered multiple times, the handler detects the existing record and exits immediately with `200 OK` without duplicating financial credits or notification dispatches.
