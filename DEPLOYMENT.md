# Production Deployment Guide — Levchary LMS

## 1. Deployment Target Architecture

| Component | Provider | Configuration |
| :--- | :--- | :--- |
| **Next.js Web Application** | Vercel | Node.js 20 runtime, Edge / Serverless functions |
| **Relational Database & Auth** | Supabase | PostgreSQL 15, Row Level Security, Triggers |
| **Document Storage** | Supabase Storage | Private bucket `verification-documents` |
| **Payments & Payouts** | Stripe | Hosted Checkout, Stripe Connect Express |
| **Conferencing** | Google Cloud | Service Account with Google Calendar API |
| **Transactional Email** | Resend | DNS verified domain, DKIM/SPF configured |

---

## 2. Step-by-Step Deployment

### Step 1: Database & Storage Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Link your local CLI to the project:
   ```bash
   supabase link --project-ref <your-supabase-ref>
   ```
3. Run all migrations and triggers:
   ```bash
   supabase db push
   ```
4. Create a private storage bucket named `verification-documents`:
   - Set **Public Bucket** to `False`.
   - Apply the storage RLS policies defined in `003_rls_policies.sql`.

### Step 2: Stripe & Stripe Connect Setup
1. Create a Stripe account at [Stripe Dashboard](https://dashboard.stripe.com/).
2. Under **Connect**, enable Stripe Connect Express onboarding.
3. Configure your webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `charge.refunded`
     - `account.updated`
4. Copy the Webhook Signing Secret (`whsec_...`).

### Step 3: Google Meet Service Account
1. In the [Google Cloud Console](https://console.cloud.google.com/), enable the **Google Calendar API**.
2. Create a Service Account (e.g. `levchary-calendar@your-project.iam.gserviceaccount.com`).
3. Generate and download a JSON Private Key.
4. Delegate domain-wide calendar authority or share your master booking calendar with this service account email.

### Step 4: Vercel Deployment
1. Import your Git repository into [Vercel](https://vercel.com/).
2. Add all environment variables from `.env.example`.
3. Set Framework Preset to **Next.js**.
4. Deploy!

---

## 3. Post-Deployment Verification Checklist

- [ ] Visit homepage `https://your-domain.com`
- [ ] Test student registration and email verification
- [ ] Test tutor application submission and document upload
- [ ] Access `/admin` and verify document view with short-lived signed URL
- [ ] Approve tutor and verify they appear on `/find-tutors`
- [ ] Book a 1-on-1 virtual class with Stripe test card
- [ ] Verify Google Meet conference URL generates on booking confirmation
- [ ] Confirm webhook updates booking to `CONFIRMED`
- [ ] Test chat moderation by attempting to send a phone number or PayPal handle
- [ ] Check audit log at `/admin/audit-logs`
