# MASTER PROMPT — BUILD A COMPLETE MEDICAL CRM PLATFORM

## 1. YOUR ROLE

Act as a principal full-stack software engineer, SaaS architect, database engineer, cybersecurity specialist, UI/UX designer, QA engineer, and WhatsApp automation engineer.

Your task is to DESIGN, IMPLEMENT, TEST, DOCUMENT, AND PREPARE FOR DEPLOYMENT a complete medical clinic CRM web application.

Project name: **MediFlow CRM**

The product must be a real, functional application backed by a real database. It must not be a static dashboard, frontend-only prototype, mock application, or collection of disconnected components.

I want to use this application to manage a medical clinic, patients, appointments, payments, services, and automated patient communications.

The system must eventually support an intelligent WhatsApp bot that can understand patient messages, check real appointment availability, create bookings, reschedule appointments, cancel bookings, and send appointment reminders automatically.

The first release must support ONE clinic with one primary administrative workspace. Prepare the architecture for future independent CRM workspaces for different doctors, but do not implement the complete multi-clinic SaaS product yet.

**Your primary responsibility is to write and maintain the actual project files and make the application work. Do not stop after producing a plan, a mockup, or code snippets.**

---

# 2. NON-NEGOTIABLE EXECUTION RULES

Follow these rules throughout the project:

1. Inspect the existing workspace before making changes.
2. If the workspace is empty, initialize the project.
3. If a project already exists, understand it and preserve useful existing functionality.
4. Research current official documentation before implementing external integrations or version-sensitive APIs.
5. Use stable, compatible dependency versions and avoid deprecated packages.
6. Create a written implementation plan, then immediately start building.
7. Implement features in small, verifiable stages.
8. Connect every implemented feature to actual business logic and database operations.
9. Never use hardcoded dashboard statistics as substitutes for database queries.
10. Never pretend that a message was delivered, a payment was collected, or a deployment succeeded without evidence.
11. Never expose API keys, database credentials, service-role keys, or other secrets to the browser or Git repository.
12. Never use real patient information in development fixtures, screenshots, tests, or seed files.
13. Run the appropriate checks after each significant stage.
14. Fix errors rather than simply reporting them.
15. If an external service requires credentials, implement the integration and clearly document the remaining setup steps.
16. Do not ask me to approve every technical decision. Make reasonable engineering decisions and document them.
17. If a required service is unavailable, complete the independent parts of the application and use an explicitly labeled development adapter.
18. Do not mark a feature complete if its essential behavior is missing.
19. Maintain a progress checklist in `docs/IMPLEMENTATION_STATUS.md`.
20. Continue working through the implementation stages until the application is genuinely usable within the capabilities and credentials available in the environment.

At the beginning, create:

- `docs/IMPLEMENTATION_PLAN.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/ARCHITECTURE.md`

Update the status document as implementation progresses.

---

# 3. PRODUCT OBJECTIVE

Build a professional medical CRM with these capabilities:

- Patient registration and management.
- Editable patient profiles.
- Appointment scheduling and calendar management.
- Doctor and service configuration for the initial clinic.
- Payment records and outstanding balances.
- Visit history and controlled access to medical notes.
- WhatsApp messaging through the official WhatsApp Business Platform.
- Automatic appointment reminders.
- A conversational WhatsApp booking bot.
- Background jobs and delivery monitoring.
- Secure authentication and authorization.
- Reporting and exports.
- Arabic and English interfaces.
- Responsive design for desktop, tablet, and mobile.
- GitHub repository preparation and deployment documentation.

The system must work without an AI subscription for essential patient, appointment, and payment management.

WhatsApp production messaging requires real Meta configuration. AI-based natural language understanding must be optional and replaceable.

---

# 4. REQUIRED TECHNOLOGY STACK

Use this stack unless an incompatibility is discovered and documented.

## Frontend

- Next.js App Router.
- React.
- TypeScript in strict mode.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.
- React Hook Form where appropriate.
- Zod for validation.
- TanStack Table for complex data tables where appropriate.
- A maintained calendar component compatible with the selected React version.
- A charting library for meaningful dashboard reports.

## Backend

Use Next.js server-side functionality for application logic, server actions where appropriate, and Route Handlers for HTTP APIs and webhooks.

Separate business logic from presentation components.

## Database and authentication

- PostgreSQL.
- Supabase.
- Supabase Auth.
- The officially supported Supabase SSR integration for Next.js.
- PostgreSQL constraints, indexes, transactions, and Row Level Security.

## Testing

- Vitest or an equivalent maintained unit-testing framework.
- Integration tests for database-backed operations.
- Playwright for critical end-to-end user flows.
- Linting and TypeScript checks.
- Production build verification.

## External integrations

- Official WhatsApp Business Platform Cloud API.
- A configurable AI provider interface for optional natural language understanding.
- A deployment-compatible scheduler for reminders and background tasks.

Do not install every available library. Choose only the packages that provide a real benefit.

Pin compatible versions in the lockfile and document the runtime requirements.

---

# 5. PROJECT STRUCTURE

Organize the application into clear, maintainable modules.

Use a structure similar to:

- `src/app/`
  - Authentication pages.
  - Dashboard.
  - Patients.
  - Appointments.
  - Calendar.
  - Services.
  - Payments.
  - Reports.
  - Settings.
  - Messaging.
  - API Route Handlers.
- `src/components/`
  - Layout.
  - Navigation.
  - Forms.
  - Tables.
  - Dialogs.
  - Charts.
  - Shared UI.
- `src/lib/`
  - Authentication.
  - Authorization.
  - Database clients.
  - Validation.
  - Logging.
  - Date and time utilities.
  - Business rules.
- `src/features/`
  - Patients.
  - Appointments.
  - Payments.
  - Services.
  - WhatsApp.
  - Booking bot.
  - Notifications.
  - Reporting.
- `src/server/`
  - Server-only business logic.
  - Database operations.
  - Background job handlers.
  - External API clients.
- `supabase/`
  - Migrations.
  - Seed scripts.
  - Database configuration.
- `tests/`
  - Unit.
  - Integration.
  - End-to-end.
- `docs/`
  - Architecture.
  - Database.
  - Security.
  - WhatsApp.
  - Deployment.
  - Testing.
  - Future multi-clinic architecture.

You may adjust the structure when needed, but preserve separation of concerns.

Do not put the entire application in a single page or a single component.

---

# 6. DESIGN SYSTEM AND USER EXPERIENCE

Build a polished, professional healthcare administration interface.

The visual direction should be modern, calm, clean, trustworthy, and premium.

Avoid excessive gradients, unnecessary glass effects, oversized cards, excessive animations, and cluttered dashboards.

Use consistent spacing, typography, colors, borders, shadows, and interaction states.

## Localization

Support:

- Arabic as the default language.
- English as a fully supported alternative.
- RTL layout for Arabic.
- LTR layout for English.
- Correct direction for forms, tables, menus, sidebars, dialogs, and calendar controls.
- Localized dates and numbers.
- A configurable clinic timezone.
- A configurable currency.

All user-facing strings must use a translation system rather than being scattered as hardcoded text throughout components.

Do not translate database field names or internal identifiers dynamically.

## Layout

Create:

- A responsive sidebar.
- A top navigation bar.
- Search and notification areas.
- A profile menu.
- Breadcrumbs.
- Consistent page headers.
- Reusable data tables.
- Reusable form components.
- Confirmation dialogs.
- Toast notifications.
- Loading skeletons.
- Empty states.
- Error states.
- Accessible form validation.
- Keyboard-friendly interactions.

The interface must work on mobile without requiring horizontal scrolling for the entire application.

All primary buttons and menus must have meaningful behavior.

---

# 7. AUTHENTICATION AND USER MANAGEMENT

Implement a real authentication system.

Required features:

- Login.
- Logout.
- Session persistence.
- Password reset through a properly configured flow.
- Protected routes.
- Server-side session verification.
- User profile.
- Account status.
- Role-based authorization.
- Safe handling of expired sessions.

Initial roles:

1. `owner`
2. `admin`
3. `doctor`
4. `receptionist`

Design role permissions deliberately.

Examples:

- Owner: clinic-wide configuration and administration.
- Admin: permitted administrative and reporting operations.
- Doctor: authorized patient, appointment, and visit information.
- Receptionist: patient registration, appointments, and permitted payment operations.

Create a documented permission matrix and implement it consistently.

Do not rely on hidden navigation items as an authorization mechanism.

Every sensitive server operation must verify the current user's permissions.

For the initial setup, create a secure owner onboarding process. Do not ship a public registration page that allows anyone to become the clinic owner.

Never create a hardcoded production administrator account or commit a default password.

---

# 8. DATABASE DESIGN

Use PostgreSQL as the source of truth.

Create versioned SQL migrations with proper relationships, indexes, constraints, and timestamps.

Create the tables necessary for the following entities:

## Core entities

- `clinics`
- `profiles`
- `clinic_memberships`
- `patients`
- `services`
- `appointments`
- `visits`
- `payments`
- `clinic_settings`
- `business_hours`
- `clinic_closures`
- `whatsapp_conversations`
- `whatsapp_messages`
- `webhook_events`
- `notification_jobs`
- `audit_logs`

You may add tables for payment adjustments, AI usage, message templates, booking sessions, consent history, or other necessary functionality.

Avoid unnecessary duplication.

## General requirements

- Use UUID primary keys where appropriate.
- Use foreign keys.
- Add indexes for frequently queried fields.
- Use unique constraints when business rules require them.
- Use check constraints for appropriate monetary and status fields.
- Store creation and update timestamps.
- Use appropriate delete restrictions and archival strategies.
- Keep financial records linked to their relevant patient and appointment.
- Avoid storing the same information redundantly without a clear reason.
- Define appropriate indexes for search, patient lookups, appointment ranges, and message processing.
- Use transactions for multi-step operations that must succeed or fail together.

Use database migrations as the authoritative schema history.

Do not rely on undocumented manual changes to the production database.

## Future multi-clinic architecture

The first release must operate as a single-clinic workspace.

However, design the database and authorization boundaries to support future clinic isolation.

Use `clinic_id` consistently for clinic-owned data and enforce the relationship between authenticated users, clinic memberships, and accessible clinic records.

Do not implement a full SaaS tenant selector, subscription system, or multi-clinic administration interface yet.

Create `docs/FUTURE_MULTI_CLINIC.md` describing the migration path toward independently isolated CRM workspaces for different doctors or clinics.

Future tenant isolation must be enforced by database policies and server-side authorization, not just frontend filters.

---

# 9. ROW LEVEL SECURITY AND DATABASE SAFETY

Enable Row Level Security on every exposed table containing application data.

Review the policies table by table.

Implement least-privilege access based on:

- Authenticated user.
- Clinic membership.
- Role.
- Requested operation.
- Record ownership or clinic scope where applicable.

Test that unauthorized users cannot:

- Read another clinic's patients.
- Access another clinic's payments.
- Read private visit notes without permission.
- Change appointment records outside their scope.
- Modify user roles.
- Read protected message content.
- Access audit logs without permission.

Do not assume that RLS automatically solves all authorization problems.

Validate authorization in server-side business logic as well.

If an administrative database key bypasses RLS, keep it strictly server-side and use it only for carefully controlled operations.

Never expose secrets in browser bundles, HTML, client-side environment variables, logs, or Git history.

Document the security model in `docs/SECURITY.md`.

---

# 10. PATIENT MANAGEMENT

Implement a complete patient CRM.

## Patient profile

Include the fields required for the clinic's workflow:

- Internal patient number.
- Full name.
- Phone number.
- Optional email.
- Optional date of birth.
- Optional demographic information when needed.
- Registration date.
- Active or archived status.
- Preferred communication language.
- WhatsApp contact and consent status.
- Administrative notes with appropriate permissions.

Keep sensitive medical information separate from general administrative data.

Do not collect unnecessary health information.

## Patient operations

Implement:

- Create patient.
- View patient.
- Edit patient.
- Search by name, phone, or email.
- Filter and paginate patient lists.
- Detect likely duplicates.
- Open patient history.
- View appointments.
- View payments.
- View outstanding balances.
- View permitted visit history.
- Add and edit authorized visit notes.
- Archive patients.
- Export authorized patient records to CSV.

Patient updates must persist to PostgreSQL.

Use server-side validation.

Do not allow duplicate patient creation through accidental repeated submissions.

Do not automatically merge two patients merely because their names are similar.

Define a deliberate policy for duplicate detection.

Protect sensitive information in search results and exports.

---

# 11. APPOINTMENT MANAGEMENT

Implement a complete scheduling module.

## Appointment information

Each appointment should include:

- Patient.
- Clinic.
- Assigned doctor or provider.
- Service.
- Start time.
- End time.
- Duration.
- Status.
- Booking source.
- Administrative notes.
- Creation timestamp.
- Relevant confirmation and cancellation timestamps.

Possible statuses:

- `pending`
- `confirmed`
- `completed`
- `cancelled`
- `no_show`

Add other states only if the workflow requires them.

## Calendar

Provide:

- Daily view.
- Weekly view.
- Monthly view.
- Appointment list.
- Search.
- Date filters.
- Status filters.
- Patient filters.
- Doctor filters where appropriate.

## Scheduling rules

Support:

- Configurable business hours.
- Break periods.
- Holidays and closures.
- Service durations.
- Appointment buffers when required.
- Provider availability.
- Timezone-aware display.
- Rescheduling.
- Cancellation.
- Appointment confirmation.
- Appointment completion.
- No-show tracking.

Prevent overlapping appointments for the same provider.

Prevent bookings outside available business hours.

Recheck availability when an appointment is saved.

Use database-level protections and transaction-safe logic to prevent concurrent requests from booking conflicting times.

Do not trust frontend availability checks.

Do not create appointments in the past through public booking flows.

Administrative overrides must require authorization and must be auditable.

Implement cancellation and rescheduling as proper state transitions, not as arbitrary edits that bypass business rules.

---

# 12. SERVICES AND CLINIC SETTINGS

Create a services management page.

Each service may include:

- Name in Arabic.
- Name in English.
- Description.
- Duration.
- Price.
- Currency.
- Active or inactive status.
- Optional assigned provider.
- Optional booking restrictions.

Allow authorized users to add, edit, activate, deactivate, and reorder services.

Create clinic settings for:

- Clinic name.
- Contact details.
- Address.
- Timezone.
- Currency.
- Language defaults.
- Working hours.
- Appointment rules.
- Reminder schedules.
- Cancellation rules.
- WhatsApp configuration status.

Validate all configuration changes on the server.

---

# 13. PAYMENTS AND FINANCIAL RECORDS

Implement an operational financial module.

## Payment features

- Record a payment.
- Link the payment to a patient.
- Link the payment to an appointment or service when applicable.
- Record full or partial payments.
- Record payment date.
- Record amount and currency.
- Record payment method.
- Store an optional external reference.
- View payment history.
- Calculate totals.
- Calculate remaining balances.
- Filter payments.
- Generate daily and monthly reports.
- Export authorized financial reports.

Support payment methods such as:

- Cash.
- Bank transfer.
- Card recorded as paid externally.
- Other configurable methods.

This is a payment-recording system, not an electronic payment processor.

Do not claim to have collected money electronically.

## Accounting integrity

Store monetary amounts using a suitable exact numeric representation, never binary floating-point arithmetic for authoritative financial calculations.

Do not silently delete or overwrite recorded payments.

Implement reversals, refunds, or adjustment entries where appropriate, preserving an auditable history.

Define the exact meaning of appointment price, amount paid, amount refunded, and outstanding balance.

Avoid counting cancelled or refunded amounts as ordinary revenue without an explicit accounting rule.

Ensure reports use the correct clinic timezone and reporting period.

Test all financial calculations.

---

# 14. VISITS AND MEDICAL NOTES

Create a controlled visit history.

Each visit may contain:

- Patient.
- Related appointment.
- Provider.
- Visit date.
- Authorized clinical notes.
- Relevant service.
- Follow-up date when needed.

Do not build an automated diagnosis system.

Do not let the AI bot diagnose conditions or recommend treatment.

Restrict clinical notes to authorized users.

Create an audit trail for access and changes to sensitive records where appropriate.

Keep clinical data out of ordinary notification logs and WhatsApp reminders.

Support archival and retention policies without silently destroying records that must be retained.

---

# 15. WHATSAPP BUSINESS PLATFORM INTEGRATION

Use the official WhatsApp Business Platform Cloud API.

Do not use unofficial WhatsApp Web automation.

Do not require a personal WhatsApp session or QR login.

Create a dedicated server-side WhatsApp integration module.

## Configuration

Use environment variables such as:

`WHATSAPP_ACCESS_TOKEN`

`WHATSAPP_PHONE_NUMBER_ID`

`WHATSAPP_VERIFY_TOKEN`

`WHATSAPP_APP_SECRET`

`WHATSAPP_API_VERSION`

`WHATSAPP_ENABLED`

`WHATSAPP_PROVIDER`

Never commit actual secret values.

Use the current official Meta API documentation to determine endpoint formats, API versions, message payloads, authentication, webhook verification, and messaging policy requirements.

## Outgoing messages

Support:

- Appointment confirmation.
- Appointment reminder.
- Rescheduling notification.
- Cancellation notification.
- Approved general administrative notifications.

Use approved WhatsApp message templates when required by Meta policy.

Handle the relevant messaging window, opt-in requirements, and applicable template rules.

Do not assume every outgoing message can be sent as an unrestricted free-form message.

## Incoming messages

Implement a webhook that:

- Supports the required Meta verification challenge.
- Verifies incoming request authenticity according to the current official signature-verification requirements.
- Parses supported text messages.
- Safely handles unsupported media and message types.
- Persists incoming events.
- Responds quickly to webhook requests.
- Processes business logic asynchronously where appropriate.
- Handles duplicate events.
- Records message identifiers.
- Processes delivery-status callbacks.
- Avoids exposing patient data in operational logs.

Use idempotency protections for incoming events and outgoing messages.

Never send the same booking confirmation repeatedly because Meta retried a webhook.

## Message status

Track the available states:

- Queued.
- Sent.
- Delivered.
- Read, when provided.
- Failed.

Do not mark a message as delivered simply because the API accepted the request.

Store the provider's message identifier and process later delivery callbacks.

## Development adapter

Create a development-only mock provider.

The mock provider may simulate API responses for tests, but must never send real messages.

Make it visually obvious when mock mode is enabled.

In production, fail safely when required credentials are missing.

Provide an administration page showing whether WhatsApp is configured and whether the latest integration checks succeeded.

---

# 16. INTELLIGENT WHATSAPP BOOKING BOT

Implement a conversational booking assistant that interacts with real clinic data.

The bot must support Arabic conversational messages and basic English messages.

Examples:

- "أريد أحجز موعد."
- "عندكم موعد باچر؟"
- "أريد أغير موعدي."
- "أريد ألغي الحجز."
- "شنو الخدمات المتوفرة؟"
- "كم سعر الخدمة؟"
- "أريد أحجي ويا موظف."

The bot should understand common Iraqi Arabic expressions when possible, while keeping a deterministic fallback flow.

## Booking flow

1. Receive the message through the verified webhook.
2. Identify the patient using the verified WhatsApp sender number and the configured identity rules.
3. Do not assume the sender's identity is proven merely because a phone number matches a patient record.
4. If the identity is ambiguous or sensitive action verification is required, request an appropriate verification step.
5. Identify the requested service from the actual services database.
6. Ask only for missing information.
7. Retrieve real availability from the scheduling service.
8. Offer a limited, clear list of available slots.
9. Let the patient select a slot.
10. Summarize the selected service, date, and time.
11. Request explicit confirmation.
12. Recheck availability.
13. Create the appointment transactionally.
14. Return the actual booking reference and confirmed details.
15. Queue a confirmation message and the appropriate future reminders.
16. Store the conversation state and relevant event identifiers.

If a slot becomes unavailable before confirmation, explain that it is no longer available and provide alternatives.

Never invent appointment slots, prices, services, patient details, or booking references.

## Rescheduling and cancellation

Require sufficient identity verification before changing or cancelling an existing appointment.

Present the relevant appointment details in a privacy-conscious manner.

Require explicit confirmation before cancellation.

Recheck availability before rescheduling.

Use safe state transitions and record the action in the audit log.

Prevent repeated webhook deliveries from creating repeated cancellations or bookings.

## Conversation state

Persist the booking flow state in the database.

Handle:

- Incomplete answers.
- Ambiguous dates.
- Multiple services.
- Invalid selections.
- Expired booking sessions.
- Repeated messages.
- Temporary database errors.
- Unavailable appointment slots.
- Human handoff.

Store only the minimum conversation content needed for the workflow.

Define retention rules for conversation records.

## AI architecture

Create a provider-independent interface for optional AI interpretation.

The AI may classify intent, extract a requested service, interpret natural-language date expressions, and help formulate a response.

The AI must not directly write to the database or execute arbitrary SQL.

Instead, it may request predefined, validated business operations, such as:

- Find available slots.
- Get active services.
- Create a booking after confirmation.
- Request a reschedule.
- Request cancellation.
- Transfer to a human.

Every operation must be validated by the backend.

Treat incoming messages as untrusted user input, never as instructions that override system security rules.

Do not let AI invent facts when a tool returns no data.

If AI is unavailable, use a rule-based conversation engine.

AI configuration must be optional and documented.

Never send clinical notes or unnecessary patient information to an external AI provider.

---

# 17. AUTOMATIC APPOINTMENT REMINDERS

Implement real background processing for reminders.

A button that sends reminders manually is not sufficient.

The system must support configurable reminder intervals, such as:

- 24 hours before the appointment.
- 2 hours before the appointment.

These are defaults, not hardcoded limitations.

## Reminder workflow

1. Find eligible upcoming appointments.
2. Verify that the appointment remains active.
3. Check consent and communication eligibility.
4. Verify that the relevant reminder has not already been sent or queued.
5. Create a durable notification job.
6. Send through the configured provider.
7. Record the provider response.
8. Update the message status through callbacks when available.
9. Retry temporary failures with bounded exponential backoff.
10. Stop retrying permanent failures.
11. Prevent duplicate sends.
12. Show failed jobs to an authorized administrator.

Use a scheduler compatible with the actual hosting platform.

Document how to configure the scheduler in development and production.

Protect scheduled-task endpoints with a secret or an equivalent secure mechanism.

Do not assume that a local `setInterval` continues to run after deployment.

Use a durable database-backed job model or an equivalent reliable queue.

Ensure that concurrent job workers cannot process the same notification unsafely.

---

# 18. DASHBOARD AND REPORTING

Build a dashboard backed by real database queries.

Display:

- Total active patients.
- New patients during the selected period.
- Today's appointments.
- Upcoming appointments.
- Completed appointments.
- Cancelled appointments.
- No-shows.
- Recorded revenue.
- Outstanding balances.
- Recent patient registrations.
- Upcoming appointment list.
- Failed notification count.
- WhatsApp integration status.

Provide useful date filters.

Charts must use actual database results.

Define revenue calculations clearly.

Avoid expensive queries that load the entire database into the browser.

Use server-side pagination and appropriate database indexes.

Provide CSV exports for authorized reports.

Do not include patient clinical notes in analytics exports.

---

# 19. SEARCH AND DATA MANAGEMENT

Implement a consistent search experience.

Search patients by name and phone number.

Search appointments by date, patient, provider, and status.

Search payments by date, patient, method, and relevant reference.

Use safe database query construction.

Do not interpolate untrusted input into raw SQL.

Implement pagination for large datasets.

Provide empty states, filters, sorting, and clear feedback.

For destructive or sensitive operations, use confirmation dialogs and audit logs.

---

# 20. AUDIT LOGGING

Create a protected audit trail for important actions.

Include events such as:

- Patient creation.
- Patient updates.
- Sensitive record access where appropriate.
- Appointment creation and changes.
- Appointment cancellation.
- Payment recording.
- Refunds and adjustments.
- Permission changes.
- Configuration changes.
- WhatsApp configuration changes.
- Manual reminder retries.
- Data exports.

Record:

- Actor.
- Clinic.
- Action.
- Relevant record identifier.
- Timestamp.
- Outcome.
- A limited, safe description of the change.

Do not store passwords, tokens, or unnecessary medical content in audit logs.

Protect audit logs from ordinary users and unauthorized modifications.

---

# 21. SECURITY REQUIREMENTS

Implement the following as real controls:

- Server-side authentication and authorization.
- Database Row Level Security.
- Secure cookie and session handling.
- Zod validation.
- Appropriate CSRF protections for relevant request patterns.
- Rate limiting for public endpoints.
- Webhook signature verification.
- Secure environment variables.
- Error handling that does not leak internal details.
- Safe logging.
- Input sanitization where appropriate.
- Output encoding.
- Protection against insecure direct object references.
- Least-privilege database access.
- Secure file handling if file uploads are implemented.
- Restrictions on sensitive exports.
- Secure owner onboarding.
- Auditability for important changes.

Do not invent a claim of regulatory compliance.

Document the privacy, consent, data residency, retention, and contractual reviews needed for the actual operating jurisdiction, including Turkey's KVKK where applicable.

Use fake development data until security and deployment configuration have been reviewed.

---

# 22. ENVIRONMENT CONFIGURATION

Create a `.env.example` containing documented placeholder values only.

Include the variables required by the selected implementation, such as:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, only if required for a documented server-side use
- `WHATSAPP_ENABLED`
- `WHATSAPP_PROVIDER`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_API_VERSION`
- `AI_PROVIDER`
- `AI_API_KEY`, if an optional AI integration is implemented
- `CRON_SECRET`
- `APP_BASE_URL`

Add other variables only when the implementation actually needs them.

Use server-only environment access for secrets.

Validate required configuration at startup or at the relevant integration boundary.

If WhatsApp or AI credentials are missing, allow the independent CRM features to run and display a clear configuration status.

Do not crash the entire dashboard because an optional integration has not been configured.

Do not commit `.env.local` or other files containing secrets.

---

# 23. TESTING REQUIREMENTS

Create meaningful automated tests.

At minimum, cover the following.

## Authentication and authorization

- Unauthenticated requests cannot access protected data.
- Receptionist permissions are enforced.
- Doctor permissions are enforced.
- Unauthorized users cannot modify roles.
- Clinic scope is enforced.
- RLS policies prevent unauthorized cross-clinic access.

## Patients

- Create patient.
- Update patient.
- Search patient.
- Detect possible duplicates.
- Archive patient.
- Validate malformed input.

## Appointments

- Create an appointment.
- Reject overlapping appointments.
- Respect working hours.
- Respect closures.
- Handle timezone conversions.
- Reschedule an appointment.
- Cancel an appointment.
- Reject an unavailable slot.
- Handle concurrent booking attempts safely.

## Payments

- Record full payment.
- Record partial payment.
- Calculate outstanding balance.
- Handle refunds or adjustments.
- Reject invalid amounts.
- Verify reporting calculations.

## WhatsApp

- Verify webhook challenge.
- Reject invalid signatures.
- Process valid incoming messages.
- Handle duplicate webhook events.
- Handle API failures.
- Track delivery statuses.
- Prevent duplicate confirmations.
- Keep mock mode separate from production mode.

## Booking bot

- Start a booking conversation.
- Request missing information.
- Retrieve actual availability.
- Confirm a valid booking.
- Reject a conflicting booking.
- Handle invalid selections.
- Handle cancellation confirmation.
- Fall back when AI is unavailable.
- Transfer to a human when requested.

## Reminders

- Queue eligible reminders.
- Skip cancelled appointments.
- Skip ineligible contacts.
- Prevent duplicate jobs.
- Retry temporary failures.
- Stop retrying permanent failures.
- Record message outcomes.

## Application quality

Run:

- Lint.
- Type checking.
- Unit tests.
- Integration tests.
- Critical end-to-end tests.
- Production build.

Use deterministic tests and fake external API clients.

Do not use live patient data or real WhatsApp messages in automated tests.

Fix failures before declaring the corresponding feature complete.

---

# 24. GITHUB AND CI/CD

Prepare the project for GitHub.

Create:

- `.gitignore`
- `.env.example`
- `README.md`
- `docs/`
- Database migrations.
- Safe seed data.
- GitHub Actions workflows.

The CI workflow should run the appropriate lint, type-check, test, and build commands.

Do not expose secrets in workflow logs.

Do not commit generated production credentials or real patient exports.

Assume the repository is private unless I explicitly request otherwise.

If GitHub authentication is available, create or use the intended repository and push the code after checking the repository state and verifying that no secrets are included.

If authentication is unavailable, finish the local repository setup and provide exact commands for me to create the GitHub repository and push the project.

Never claim that a repository was created or code was pushed unless the operation actually succeeded.

---

# 25. PRODUCTION DEPLOYMENT

Prepare a deployment configuration compatible with the implemented architecture.

The intended architecture is:

- Next.js application on a suitable server-capable host.
- Supabase PostgreSQL and Auth.
- A publicly reachable HTTPS webhook endpoint.
- A supported scheduled-job mechanism.
- Optional AI provider.
- Official WhatsApp Cloud API.

Do not use GitHub Pages alone as the production host for this full-stack application.

Create `docs/DEPLOYMENT.md` with exact steps for:

1. Installing dependencies.
2. Creating the Supabase project.
3. Configuring database migrations.
4. Creating the initial owner securely.
5. Setting environment variables.
6. Running the application locally.
7. Running tests.
8. Connecting GitHub.
9. Deploying the application.
10. Configuring the production URL.
11. Configuring WhatsApp webhooks.
12. Configuring scheduled jobs.
13. Checking application health.
14. Backing up and restoring the database.
15. Rotating credentials safely.

Document what is free, what has usage limits, and what may incur a charge.

Never invent deployment URLs.

Only report a production deployment as successful if it has actually been completed and verified.

---

# 26. REQUIRED DOCUMENTATION FILES

Create and maintain:

- `README.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/SECURITY.md`
- `docs/WHATSAPP_SETUP.md`
- `docs/DEPLOYMENT.md`
- `docs/TESTING.md`
- `docs/FUTURE_MULTI_CLINIC.md`

Write practical documentation in Arabic wherever possible, retaining English technical identifiers and commands.

The documentation must match the code that actually exists.

Do not document unimplemented functionality as completed.

---

# 27. IMPLEMENTATION PHASES

Follow this sequence.

## Phase 1 — Foundation

- Inspect the workspace.
- Initialize or repair the project.
- Set up Next.js, TypeScript, Tailwind, and shared components.
- Configure Supabase.
- Create migrations.
- Implement authentication.
- Implement authorization and RLS.
- Create fake seed data.
- Verify that the application starts and builds.

## Phase 2 — Core CRM

- Dashboard.
- Patient list.
- Patient creation.
- Patient details.
- Patient editing.
- Search and filters.
- Services.
- Clinic settings.

## Phase 3 — Scheduling

- Calendar.
- Appointment creation.
- Appointment editing.
- Rescheduling.
- Cancellation.
- Availability calculation.
- Business hours.
- Conflict prevention.
- Timezone handling.

## Phase 4 — Financial module

- Payment records.
- Partial payments.
- Outstanding balances.
- Refunds and adjustments.
- Financial reports.
- CSV exports.

## Phase 5 — Visit history and auditing

- Visit records.
- Protected medical notes.
- Audit logging.
- Permission tests.

## Phase 6 — WhatsApp integration

- Cloud API client.
- Webhook verification.
- Incoming message processing.
- Outgoing messages.
- Message status tracking.
- Idempotency.
- Mock provider.
- Configuration screen.

## Phase 7 — Booking bot

- Conversation state.
- Intent recognition.
- Service selection.
- Availability lookup.
- Booking confirmation.
- Rescheduling.
- Cancellation.
- Identity verification.
- Human handoff.
- Optional AI adapter.
- Rule-based fallback.

## Phase 8 — Reminders and background jobs

- Durable notification queue.
- Scheduler.
- Automatic reminders.
- Retry policy.
- Duplicate prevention.
- Job monitoring.

## Phase 9 — Hardening

- Complete tests.
- Fix bugs.
- Check security boundaries.
- Verify RTL and English LTR.
- Test mobile layout.
- Run production build.
- Verify database migrations.
- Update documentation.

## Phase 10 — GitHub and deployment readiness

- Verify Git status.
- Inspect files for accidental secrets.
- Prepare CI.
- Push if credentials are available.
- Document deployment.
- Verify actual deployment if it is possible.

Do not skip core features to make the dashboard appear finished.

If execution time is limited, prioritize a complete, secure vertical slice that genuinely works, then continue with the remaining phases. Clearly report anything unfinished.

---

# 28. DEFINITION OF DONE

The project is not finished merely because the frontend renders.

The core release must satisfy all of the following:

- A user can log in securely.
- The owner can configure the clinic.
- An authorized user can add a patient.
- Patient edits persist to PostgreSQL.
- Patients can be searched.
- Appointments can be created and managed.
- Conflicting bookings are prevented.
- Business hours are enforced.
- Payment records persist.
- Outstanding balances are calculated correctly.
- Dashboard statistics reflect real database data.
- Role permissions are enforced on the server.
- Database policies prevent unauthorized access.
- The application supports Arabic RTL and English LTR.
- The project builds successfully.
- Core tests pass.
- The mock WhatsApp provider works in development and is clearly labeled.
- The production WhatsApp integration is implemented and documented.
- The booking bot uses actual availability and real booking operations.
- Reminder jobs are durable and protected against duplicates.
- Missing external credentials are documented honestly.
- GitHub and deployment instructions are complete.
- No secrets or real patient data are committed.

A production integration cannot be considered externally verified until the necessary credentials and external setup have been provided and the integration has been tested.

---

# 29. FINAL REPORT

When you finish each phase, update `docs/IMPLEMENTATION_STATUS.md`.

At the end, provide a concise but specific report containing:

1. What was actually implemented.
2. The major files and modules created.
3. The database tables and migrations.
4. The commands executed.
5. The actual lint, type-check, test, and build results.
6. How to run the project locally.
7. How to configure Supabase.
8. How to enable WhatsApp.
9. How to enable scheduled reminders.
10. How to configure optional AI.
11. How to push the project to GitHub.
12. How to deploy it.
13. Which features remain unfinished.
14. Which features require external credentials or paid services.
15. Any outstanding security or operational concerns.

Use exact commands for my operating system when it is known.

Do not claim success for operations that have not been executed.

Do not hide failing tests or missing features.

---

# 30. START NOW

Start by inspecting the current workspace, available tools, runtime versions, and existing files.

Create the implementation plan and status checklist.

Then immediately begin Phase 1 and continue implementing the actual application.

Do not return only an explanation of how you would build the system.

Do not stop after generating a design.

Do not stop after scaffolding the project.

Do not ask me to repeat requirements already included in this specification.

Make reasonable technical decisions independently, validate them, and keep the code and documentation synchronized.

**Build a real, secure, maintainable medical CRM that can be run locally, connected to PostgreSQL, tested, pushed to GitHub, and deployed when the required external accounts and credentials are available.**
