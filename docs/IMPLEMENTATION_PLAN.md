# MediFlow CRM — Implementation Plan

## 1. Overview
MediFlow CRM is a full-stack medical clinic management system built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase (PostgreSQL + Auth + RLS). It features bilingual support (Arabic RTL / English LTR), appointment scheduling, patient records, payment tracking, visit/clinical notes, and WhatsApp Business Cloud API integration with automated reminders and an intelligent conversational booking bot.

---

## 2. Architecture & Tech Stack
- **Framework:** Next.js (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript (strict mode)
- **Styling & UI:** Tailwind CSS, Lucide React, Radix UI / shadcn style components
- **Database & Auth:** PostgreSQL via Supabase, Row Level Security (RLS), Supabase SSR
- **Validation:** Zod
- **Forms:** React Hook Form
- **Tables & Charts:** TanStack Table, Recharts
- **Integrations:**
  - Official WhatsApp Business Platform Cloud API (with mock development adapter)
  - Optional AI provider interface for natural language booking parsing
  - Background scheduler / durable notification jobs for appointment reminders

---

## 3. Phased Implementation Roadmap

### Phase 1: Foundation & Setup
- [x] Workspace inspection and environment checks
- [x] Initial documentation (`IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_STATUS.md`, `ARCHITECTURE.md`)
- [ ] Initialize Next.js App Router application with TypeScript and Tailwind CSS
- [ ] Configure Supabase client (browser and server SSR)
- [ ] Design PostgreSQL schema and write initial migration (`supabase/migrations/001_initial_schema.sql`)
- [ ] Enable Row Level Security (RLS) with role-based policies
- [ ] Create seed data script with fake development records

### Phase 2: Authentication & Core Layout
- [ ] Supabase Auth integration (login, logout, session persistence, role verification)
- [ ] Role-based authorization matrix (`owner`, `admin`, `doctor`, `receptionist`)
- [ ] Responsive bilingual layout (Arabic RTL default, English LTR toggle)
- [ ] Sidebar, navigation, top bar, breadcrumbs, user profile menu

### Phase 3: Patient Management CRM
- [ ] Patient listing with server-side pagination, search, and filtering
- [ ] Patient registration and editable profile (demographics, contact, WhatsApp consent)
- [ ] Duplicate detection logic
- [ ] Patient history tabs (appointments, payments, visits)
- [ ] CSV export for authorized roles

### Phase 4: Services & Clinic Configuration
- [ ] Clinic settings (name, working hours, breaks, holidays, currency, timezone)
- [ ] Services catalog (Arabic & English names, duration, price, provider assignment)
- [ ] Active/inactive toggle and ordering

### Phase 5: Appointment Scheduling & Calendar
- [ ] Interactive Calendar (Day, Week, Month views)
- [ ] Booking slot availability engine (respecting hours, breaks, provider availability)
- [ ] Conflict prevention and transaction-safe booking
- [ ] Rescheduling and cancellation workflows with audit records

### Phase 6: Financial & Payment Tracking
- [ ] Payment recording (cash, bank transfer, card/external) linked to patient/appointment
- [ ] Outstanding balance calculation
- [ ] Partial payments, refunds, and adjustments
- [ ] Daily/monthly financial reports and CSV export

### Phase 7: Clinical Visits & Audit Trail
- [ ] Authorized visit records and clinical notes
- [ ] Strict role-based access for medical notes
- [ ] System-wide audit log table and viewer for administrative actions

### Phase 8: WhatsApp Business Cloud API Integration
- [ ] Dedicated server-side WhatsApp Cloud API client
- [ ] Webhook verification endpoint (Meta challenge) and signature verification
- [ ] Inbound/outbound message processing and delivery status webhooks
- [ ] Mock development adapter for testing without live credentials
- [ ] WhatsApp status & configuration check page

### Phase 9: Conversational Booking Bot
- [ ] Multi-turn conversation state machine
- [ ] Intent recognition (Arabic/Iraqi dialect & English)
- [ ] Availability inquiry, service selection, and confirmation
- [ ] AI adapter interface + deterministic rule-based fallback
- [ ] Reschedule/cancellation verification and human handoff

### Phase 10: Automatic Reminders & Background Jobs
- [ ] Durable notification job queue in PostgreSQL
- [ ] Scheduler endpoint with CRON secret authorization
- [ ] 24-hour and 2-hour automated reminders
- [ ] Exponential backoff retry logic and duplicate prevention

### Phase 11: Dashboard, Hardening & Deployment Prep
- [ ] Dashboard analytics with real database aggregation queries
- [ ] Automated tests (unit, integration, mock webhook tests)
- [ ] Environment configuration (`.env.example`)
- [ ] GitHub repository configuration and CI workflow
- [ ] Deployment documentation (`docs/DEPLOYMENT.md`)
