# Levchary LMS — Enterprise Education Marketplace & Management System

> **A Company-Controlled Education Marketplace & LMS connecting students with verified tutors for 1-on-1 and group learning across both virtual (Google Meet) and approved physical classrooms.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe%20%26%20Connect-635BFF.svg)](https://stripe.com/)
[![Google Meet](https://img.shields.io/badge/Video-Google%20Meet%20API-4285F4.svg)](https://developers.google.com/meet)
[![Tests](https://img.shields.io/badge/Tests-16%20Passing-success.svg)](./tests/levchary.test.ts)

---

## 1. Executive Product Overview

Levchary is an education marketplace platform engineered with strict company authority. Unlike open directories where tutors self-regulate or students transact off-platform, Levchary ensures:
- **Tutor Verification State Machine**: Only tutors manually approved by administrators can publish classes, schedule availability, or teach.
- **Strict Role-Based Access Control (RBAC)**: Distinct permissions for `STUDENT`, `TUTOR`, and `ADMIN` enforced server-side.
- **Four Core Class Types**:
  1. **1-on-1 Virtual**: One student + one tutor with dedicated Google Meet session.
  2. **1-on-1 Physical**: One student + one tutor hosted in an admin-approved location.
  3. **Group Virtual**: Multi-student cohort sharing a single Google Meet session with capacity enforcement.
  4. **Group Physical**: Multi-student cohort in an admin-approved physical venue.
- **Immutable Financial Snapshots**: Historical booking financial records (gross price, company commission, tutor earnings, processing fees) are locked upon reservation and are strictly immutable.
- **Double-Booking & Capacity Guard**: Atomic reservation algorithms prevent overlapping tutor sessions and enforce hard group capacity limits.
- **Message Moderation & Safety Engine**: Scans direct messaging in real time for off-platform payment attempts (Venmo, PayPal, Zelle, Crypto), phone numbers, emails, and flags names for review without blocking genuine inquiries.
- **Expiring Document Privacy**: Government IDs and university degrees stored in private buckets with 15-minute expiring signed URLs.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, TypeScript (Strict) |
| **Styling & UI** | Tailwind CSS, Radix UI Primitives, Lucide Icons, Class Variance Authority |
| **Database** | PostgreSQL, Supabase (with Row Level Security & Triggers) |
| **Authentication** | Supabase Auth (Email/Password, Google OAuth, Session Cookies) |
| **Payments** | Stripe Checkout, Stripe Connect Custom/Express for Tutor Payouts, Stripe Webhooks |
| **Conferencing** | Google Calendar & Google Meet API via Server-Side Service Account |
| **Transactional Email** | Resend API abstraction with HTML templates |
| **File Storage** | Supabase Storage (Private verification bucket, short-lived signed URLs) |
| **Validation** | Zod schemas for client forms and server endpoints |
| **Testing** | Vitest with coverage for concurrency, financial precision, and RBAC |

---

## 3. Application Structure

The platform is structured into three dedicated portals and public discovery:

```
├── /                       # Public Website & Landing
├── /find-tutors            # Marketplace: Filter tutors by subject, rating, format
├── /tutors/[id]            # Public Tutor Profile (Reviews, credentials, bio)
├── /classes                # Class Discovery (All 4 formats, category & grade filters)
├── /classes/[id]           # Live Booking Engine & Checkout Flow
├── /how-it-works           # Platform Explainer
├── /pricing                # Transparent Fee & Commission Structure
├── /become-a-tutor         # Tutor Recruitment & Onboarding Information
├── /about, /faq, /contact  # Company & Support Pages
├── /terms, /privacy        # Legal & Compliance Policies
├── /login, /register       # Authentication with instant Demo Role Switcher
│
├── /student/               # STUDENT PORTAL
│   ├── dashboard           # Next session countdown, quick stats, recommended tutors
│   ├── bookings            # Active, completed, and cancelled bookings
│   ├── calendar            # Interactive monthly schedule
│   ├── messages            # Direct messaging with active tutors
│   ├── payments            # Immutable receipts and refund requests
│   ├── reviews             # Leave verified reviews on completed classes
│   ├── verification        # Identity & address document submission
│   ├── tutors & classes    # Enrolled tutors and group rosters
│   └── settings            # Profile, timezone, notification preferences
│
├── /tutor/                 # TUTOR PORTAL
│   ├── dashboard           # Today's roster, active students, pending earnings
│   ├── application         # Multistep verification & credential upload
│   ├── verification        # Real-time state machine status & feedback
│   ├── availability        # Weekly recurring slots & blocked exceptions
│   ├── classes             # Class manager with modal class creator
│   ├── calendar            # Teaching agenda with one-click Google Meet launch
│   ├── students            # Enrolled student profiles & notes
│   ├── earnings            # Gross vs net breakdown, commission deduction
│   ├── payouts             # Stripe Connect onboarding & payout ledger
│   ├── messages            # Student messaging with moderation warnings
│   └── settings            # Bio, qualifications, hourly rates
│
└── /admin/                 # ADMIN CONTROL CENTER
    ├── dashboard           # Real-time KPIs, gross revenue, pending actions
    ├── verifications       # Document inspector with 15-minute signed URLs
    ├── flags               # Moderation queue for off-platform payment attempts
    ├── users               # RBAC control, suspension, and account activation
    ├── tutor-applications  # Tutor credential review and approval engine
    ├── classes             # Global class publisher, scheduler, and archiver
    ├── bookings            # Centralized booking ledger
    ├── transactions        # Immutable financial ledger
    ├── refunds             # Automated eligibility engine & manual overrides
    ├── payouts             # Tutor Connect payout trigger & records
    ├── commissions         # Versioned platform commission rules
    ├── locations           # Physical classroom venue management
    ├── categories          # Academic categories, subjects, and grades
    ├── reports             # Server-side CSV exports for audit & finance
    ├── audit-logs          # Immutable append-only administrative trail
    └── settings            # Platform configuration & emergency freeze
```

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+ or pnpm
- PostgreSQL (or Supabase CLI for local database)

### 1. Clone & Install Dependencies
```bash
cd Levchary
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Instant Demo Access**: The application includes a built-in interactive role switcher in the navigation bar and login page. Switch between **Student** (Lucas Miller), **Tutor** (Dr. Marcus Chen), and **Admin** (Sarah Jenkins) with zero setup required.

---

## 5. Automated Testing & Verification

Run the comprehensive Vitest test suite covering financial precision, double-booking prevention, group capacity overflow, chat safety moderation, and signed URL security:

```bash
# Run unit & integration tests
npm run test

# Run strict TypeScript type check
npm run type-check

# Run production Next.js build
npm run build
```

---

## 6. Database Migrations & Supabase Setup

All migrations are located in `supabase/migrations/`:
- `001_initial_schema.sql`: 25+ relational tables, enums, foreign keys, and indexes.
- `002_functions_and_triggers.sql`: Concurrency functions (`reserve_one_on_one_slot`, `enroll_group_class_atomic`), immutability triggers for financial snapshots and append-only audit logs.
- `003_rls_policies.sql`: Row-Level Security policies enforcing data boundaries for Student, Tutor, and Admin.
- `seed.sql`: Realistic seed data with 8 verified tutors, sample students, classes, and transactions.

To apply to your Supabase project:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

---

## 7. License & Rights
Copyright © 2026 Levchary LMS Inc. All rights reserved. Commercial marketplace platform software.
