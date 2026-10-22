-- MediFlow CRM Initial Schema Migration
-- Enables UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLINICS
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'Asia/Baghdad' NOT NULL,
    currency VARCHAR(10) DEFAULT 'IQD' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. CLINIC MEMBERSHIPS (Role-Based Access)
-- Roles: 'owner', 'admin', 'doctor', 'receptionist'
CREATE TABLE IF NOT EXISTS clinic_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'doctor', 'receptionist')),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(clinic_id, user_id)
);

-- 4. CLINIC SETTINGS
CREATE TABLE IF NOT EXISTS clinic_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL UNIQUE REFERENCES clinics(id) ON DELETE CASCADE,
    default_language VARCHAR(10) DEFAULT 'ar' NOT NULL CHECK (default_language IN ('ar', 'en')),
    appointment_buffer_minutes INT DEFAULT 0 NOT NULL,
    cancellation_notice_hours INT DEFAULT 4 NOT NULL,
    reminder_24h_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    reminder_2h_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    whatsapp_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    ai_booking_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. BUSINESS HOURS
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    is_closed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(clinic_id, day_of_week)
);

-- 6. CLINIC CLOSURES / HOLIDAYS
CREATE TABLE IF NOT EXISTS clinic_closures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. SERVICES
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) DEFAULT 'IQD' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    preferred_language VARCHAR(10) DEFAULT 'ar' NOT NULL,
    whatsapp_consent BOOLEAN DEFAULT TRUE NOT NULL,
    admin_notes TEXT,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(clinic_id, patient_number)
);

CREATE INDEX IF NOT EXISTS idx_patients_search ON patients(clinic_id, phone, full_name);

-- 9. APPOINTMENTS
-- Statuses: 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed' NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    booking_source VARCHAR(50) DEFAULT 'dashboard' NOT NULL, -- 'dashboard', 'whatsapp', 'phone', 'walk_in'
    notes TEXT,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(clinic_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);

-- 10. PAYMENTS
-- Methods: 'cash', 'card', 'bank_transfer', 'other'
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'IQD' NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'other')),
    payment_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reference_number VARCHAR(100),
    is_refunded BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_clinic ON payments(clinic_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);

-- 11. VISITS & MEDICAL NOTES
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    visit_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    diagnosis TEXT,
    clinical_notes TEXT,
    prescription TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_visits_patient ON visits(patient_id);

-- 12. WHATSAPP CONVERSATIONS & SESSIONS
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    phone_number VARCHAR(50) NOT NULL,
    session_state VARCHAR(50) DEFAULT 'idle' NOT NULL,
    context_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    last_interaction_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(clinic_id, phone_number)
);

-- 13. WHATSAPP MESSAGES
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_phone VARCHAR(50) NOT NULL,
    receiver_phone VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' NOT NULL,
    content TEXT,
    provider_message_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'sent' NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_msgs_conv ON whatsapp_messages(conversation_id, created_at);

-- 14. WEBHOOK EVENTS (Idempotency)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE NOT NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. NOTIFICATION JOBS (Durable Reminders Queue)
CREATE TABLE IF NOT EXISTS notification_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('reminder_24h', 'reminder_2h', 'confirmation', 'cancellation')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    attempts INT DEFAULT 0 NOT NULL,
    max_attempts INT DEFAULT 3 NOT NULL,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(appointment_id, job_type)
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_poll ON notification_jobs(status, scheduled_for);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic ON audit_logs(clinic_id, created_at);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION current_user_has_clinic_access(cid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM clinic_memberships
        WHERE clinic_id = cid
          AND user_id = auth.uid()
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_role(cid UUID)
RETURNS VARCHAR AS $$
    SELECT role FROM clinic_memberships
    WHERE clinic_id = cid
      AND user_id = auth.uid()
      AND is_active = TRUE
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read all profiles in their clinic and update their own
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Clinics: Accessible if member
CREATE POLICY "Members can view clinic" ON clinics
    FOR SELECT USING (current_user_has_clinic_access(id));

CREATE POLICY "Owners can update clinic" ON clinics
    FOR UPDATE USING (current_user_role(id) IN ('owner', 'admin'));

-- Patients: Accessible to clinic members
CREATE POLICY "Members can view patients" ON patients
    FOR SELECT USING (current_user_has_clinic_access(clinic_id));

CREATE POLICY "Members can insert patients" ON patients
    FOR INSERT WITH CHECK (current_user_has_clinic_access(clinic_id));

CREATE POLICY "Members can update patients" ON patients
    FOR UPDATE USING (current_user_has_clinic_access(clinic_id));

-- Appointments: Accessible to clinic members
CREATE POLICY "Members can view appointments" ON appointments
    FOR SELECT USING (current_user_has_clinic_access(clinic_id));

CREATE POLICY "Members can manage appointments" ON appointments
    FOR ALL USING (current_user_has_clinic_access(clinic_id));

-- Payments: Accessible to receptionists, admins, and owners
CREATE POLICY "Authorized members can view payments" ON payments
    FOR SELECT USING (
        current_user_has_clinic_access(clinic_id) AND
        current_user_role(clinic_id) IN ('owner', 'admin', 'receptionist')
    );

CREATE POLICY "Authorized members can manage payments" ON payments
    FOR ALL USING (
        current_user_has_clinic_access(clinic_id) AND
        current_user_role(clinic_id) IN ('owner', 'admin', 'receptionist')
    );

-- Visits: Doctors, Admins, Owners can view and manage clinical notes
CREATE POLICY "Doctors and admins can access visits" ON visits
    FOR ALL USING (
        current_user_has_clinic_access(clinic_id) AND
        current_user_role(clinic_id) IN ('owner', 'admin', 'doctor')
    );

-- Audit logs: Viewable by owner and admin
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        current_user_has_clinic_access(clinic_id) AND
        current_user_role(clinic_id) IN ('owner', 'admin')
    );
