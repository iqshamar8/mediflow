// MediFlow Development Database Adapter
// Provides active state and database operations when Supabase is running in local development mode.

export interface Service {
  id: string;
  name_ar: string;
  name_en: string;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
}

export interface Patient {
  id: string;
  patient_number: string;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  gender: "male" | "female";
  preferred_language: "ar" | "en";
  whatsapp_consent: boolean;
  admin_notes?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_phone?: string;
  service_id: string;
  service_name?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  booking_source: "dashboard" | "whatsapp" | "phone" | "walk_in";
  notes?: string;
}

export interface Payment {
  id: string;
  patient_id: string;
  patient_name?: string;
  appointment_id?: string;
  amount: number;
  currency: string;
  payment_method: "cash" | "card" | "bank_transfer";
  payment_date: string;
  reference_number: string;
  notes?: string;
}

export interface WhatsAppMessage {
  id: string;
  direction: "inbound" | "outbound";
  sender_phone: string;
  receiver_phone: string;
  content: string;
  status: "queued" | "sent" | "delivered" | "read";
  created_at: string;
}

// Global in-memory storage to survive hot-reloads during dev session
declare global {
  // eslint-disable-next-line no-var
  var __mediflow_db: {
    services: Service[];
    patients: Patient[];
    appointments: Appointment[];
    payments: Payment[];
    messages: WhatsAppMessage[];
  } | undefined;
}

function initDb() {
  if (global.__mediflow_db) return global.__mediflow_db;

  global.__mediflow_db = {
    services: [
      {
        id: "srv-001",
        name_ar: "كشف عام واستشارة",
        name_en: "General Consultation",
        duration_minutes: 30,
        price: 25000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-002",
        name_ar: "مراجعة ومتابعة",
        name_en: "Follow-up Visit",
        duration_minutes: 20,
        price: 15000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-003",
        name_ar: "فحص موجات فوق صوتية (سونار)",
        name_en: "Ultrasound Scan",
        duration_minutes: 30,
        price: 40000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-004",
        name_ar: "تنظيف أسنان وإزالة جير",
        name_en: "Dental Cleaning",
        duration_minutes: 45,
        price: 50000,
        currency: "IQD",
        is_active: true,
      },
    ],
    patients: [
      {
        id: "pat-001",
        patient_number: "P-1001",
        full_name: "علي حسن الكرخي",
        phone: "+9647711112222",
        email: "ali.karhi@example.test",
        date_of_birth: "1988-04-12",
        gender: "male",
        preferred_language: "ar",
        whatsapp_consent: true,
        admin_notes: "يعاني من ضغط الدم المرتفع",
        created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
      {
        id: "pat-002",
        patient_number: "P-1002",
        full_name: "مريم أحمد البياتي",
        phone: "+9647722223333",
        email: "maryam.bayati@example.test",
        date_of_birth: "1995-09-25",
        gender: "female",
        preferred_language: "ar",
        whatsapp_consent: true,
        admin_notes: "حساسية من البنسلين",
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: "pat-003",
        patient_number: "P-1003",
        full_name: "John Doe",
        phone: "+9647733334444",
        email: "john.doe@example.test",
        date_of_birth: "1990-01-15",
        gender: "male",
        preferred_language: "en",
        whatsapp_consent: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    appointments: [
      {
        id: "apt-001",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        patient_phone: "+9647711112222",
        service_id: "srv-001",
        service_name: "كشف عام واستشارة",
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 86400000 + 1800000).toISOString(),
        duration_minutes: 30,
        status: "confirmed",
        booking_source: "whatsapp",
        notes: "حجز تلقائي عبر المساعد الذكي",
      },
      {
        id: "apt-002",
        patient_id: "pat-002",
        patient_name: "مريم أحمد البياتي",
        patient_phone: "+9647722223333",
        service_id: "srv-003",
        service_name: "فحص موجات فوق صوتية (سونار)",
        start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
        end_time: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString(),
        duration_minutes: 30,
        status: "pending",
        booking_source: "dashboard",
        notes: "مراجعة الدكتورة",
      },
    ],
    payments: [
      {
        id: "pay-001",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        appointment_id: "apt-001",
        amount: 25000,
        currency: "IQD",
        payment_method: "cash",
        payment_date: new Date().toISOString(),
        reference_number: "REC-9001",
        notes: "دفعة كاملة عند الحجز",
      },
    ],
    messages: [
      {
        id: "msg-001",
        direction: "inbound",
        sender_phone: "+9647711112222",
        receiver_phone: "+9647700000001",
        content: "مرحبا دكتور، أريد أحجز موعد كشف باچر",
        status: "read",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "msg-002",
        direction: "outbound",
        sender_phone: "+9647700000001",
        receiver_phone: "+9647711112222",
        content: "أهلاً وسهلاً بك في عيادة النور! المواعيد المتاحة غداً: 10:00 صباحاً أو 11:30 صباحاً. أيهما يناسبك؟",
        status: "delivered",
        created_at: new Date(Date.now() - 3600000 * 3 + 10000).toISOString(),
      },
    ],
  };

  return global.__mediflow_db;
}

export const db = initDb();
