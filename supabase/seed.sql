-- MediFlow CRM Seed Data (Safe Development Fixtures)
-- Note: Does NOT contain real patient information.

-- Insert Test Clinic
INSERT INTO clinics (id, name, subdomain, phone, email, address, timezone, currency)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'عيادة النور الطبية التخصصية (Al-Noor Clinic)',
    'alnoor',
    '+9647700000001',
    'contact@alnoorclinic.test',
    'شارع المنصور، بغداد، العراق',
    'Asia/Baghdad',
    'IQD'
) ON CONFLICT (id) DO NOTHING;

-- Clinic Settings
INSERT INTO clinic_settings (clinic_id, default_language, appointment_buffer_minutes, cancellation_notice_hours, reminder_24h_enabled, reminder_2h_enabled, whatsapp_enabled, ai_booking_enabled)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'ar',
    10,
    4,
    TRUE,
    TRUE,
    TRUE,
    TRUE
) ON CONFLICT (clinic_id) DO NOTHING;

-- Business Hours (Sunday through Thursday 9:00 - 18:00, Friday Closed, Saturday 10:00 - 15:00)
INSERT INTO business_hours (clinic_id, day_of_week, open_time, close_time, break_start, break_end, is_closed) VALUES
('a0000000-0000-0000-0000-000000000001', 0, '09:00', '18:00', '13:00', '14:00', FALSE),
('a0000000-0000-0000-0000-000000000001', 1, '09:00', '18:00', '13:00', '14:00', FALSE),
('a0000000-0000-0000-0000-000000000001', 2, '09:00', '18:00', '13:00', '14:00', FALSE),
('a0000000-0000-0000-0000-000000000001', 3, '09:00', '18:00', '13:00', '14:00', FALSE),
('a0000000-0000-0000-0000-000000000001', 4, '09:00', '18:00', '13:00', '14:00', FALSE),
('a0000000-0000-0000-0000-000000000001', 5, '00:00', '00:00', NULL, NULL, TRUE),  -- Friday Closed
('a0000000-0000-0000-0000-000000000001', 6, '10:00', '15:00', NULL, NULL, FALSE)
ON CONFLICT (clinic_id, day_of_week) DO NOTHING;

-- Services Catalog
INSERT INTO services (id, clinic_id, name_ar, name_en, description, duration_minutes, price, currency, sort_order) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'كشف عام واستشارة', 'General Consultation', 'فحص سريري عام واستشارة طبية أولية', 30, 25000, 'IQD', 1),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'مراجعة ومتابعة', 'Follow-up Visit', 'متابعة نتائج التحاليل والعلاج', 20, 15000, 'IQD', 2),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'فحص موجات فوق صوتية (سونار)', 'Ultrasound Scan', 'فحص تلفزيوني دقيق للأعضاء الداخلية', 30, 40000, 'IQD', 3),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'تنظيف أسنان وإزالة جير', 'Dental Cleaning', 'تنظيف أسنان احترافي وتلميع', 45, 50000, 'IQD', 4)
ON CONFLICT (id) DO NOTHING;

-- Seed Patients (Synthetic Names & Numbers)
INSERT INTO patients (id, clinic_id, patient_number, full_name, phone, email, date_of_birth, gender, preferred_language, whatsapp_consent) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'P-1001', 'علي حسن الكرخي', '+9647711112222', 'ali.karhi@example.test', '1988-04-12', 'male', 'ar', TRUE),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'P-1002', 'مريم أحمد البياتي', '+9647722223333', 'maryam.bayati@example.test', '1995-09-25', 'female', 'ar', TRUE),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'P-1003', 'John Doe', '+9647733334444', 'john.doe@example.test', '1990-01-15', 'male', 'en', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Appointments (Upcoming and Past)
INSERT INTO appointments (id, clinic_id, patient_id, service_id, start_time, end_time, duration_minutes, status, booking_source, notes) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 30 minutes', 30, 'confirmed', 'whatsapp', 'حجز عبر المساعد الذكي'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 30 minutes', 30, 'pending', 'dashboard', 'مريض محول من عيادة أخرى')
ON CONFLICT (id) DO NOTHING;

-- Seed Payment Records
INSERT INTO payments (id, clinic_id, patient_id, appointment_id, amount, currency, payment_method, payment_date, reference_number, notes) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 25000, 'IQD', 'cash', NOW(), 'REC-9001', 'دفعة كاملة عند الحجز')
ON CONFLICT (id) DO NOTHING;
