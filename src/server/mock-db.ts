// MediFlow Development Database Adapter
// Provides active state and database operations when Supabase is running in local development mode.

export interface Clinic {
  id: string;
  name: string;
  doctor_name: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  created_at: string;
}

export interface Service {
  id: string;
  clinic_id?: string;
  name_ar: string;
  name_en: string;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
}

export interface Patient {
  id: string;
  clinic_id?: string;
  patient_number: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth: string;
  gender: "male" | "female";
  preferred_language: "ar" | "en";
  whatsapp_consent: boolean;
  admin_notes?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id?: string;
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
  last_reminder_sent_at?: string;
}

export interface Payment {
  id: string;
  clinic_id?: string;
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

export interface Visit {
  id: string;
  clinic_id?: string;
  patient_id: string;
  patient_name?: string;
  doctor_name: string;
  service_name?: string;
  visit_date: string;
  diagnosis: string;
  clinical_notes: string;
  prescription: string;
  follow_up_date?: string;
}

export interface WhatsAppMessage {
  id: string;
  clinic_id?: string;
  direction: "inbound" | "outbound";
  sender_phone: string;
  receiver_phone: string;
  content: string;
  status: "queued" | "sent" | "delivered" | "read";
  created_at: string;
}

export interface ConversationSession {
  clinic_id?: string;
  phone: string;
  step: "idle" | "awaiting_service" | "awaiting_name" | "awaiting_time" | "awaiting_confirmation";
  patientName?: string;
  selectedServiceId?: string;
  selectedServiceName?: string;
  proposedTime?: string;
  notes?: string;
  lastInteraction: string;
}

export interface PrescriptionItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  clinic_id?: string;
  patient_id: string;
  patient_name?: string;
  patient_phone?: string;
  doctor_name: string;
  visit_id?: string;
  diagnosis: string;
  items: PrescriptionItem[];
  general_advice?: string;
  created_at: string;
}

export interface QueueItem {
  id: string;
  clinic_id?: string;
  queue_number: number;
  appointment_id?: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  service_name: string;
  doctor_name: string;
  status: "waiting" | "in_consultation" | "completed" | "cancelled";
  arrival_time: string;
  date?: string; // YYYY-MM-DD
  is_walk_in?: boolean;
  priority?: "normal" | "urgent";
  notes?: string;
  called_at?: string;
  completed_at?: string;
}

export interface MedicalAttachment {
  id: string;
  clinic_id?: string;
  patient_id: string;
  patient_name?: string;
  file_name: string;
  file_type: string;
  file_size_kb: number;
  category: "sonar" | "xray" | "lab" | "report";
  file_url: string;
  notes?: string;
  uploaded_at: string;
}

// Global in-memory storage to survive hot-reloads during dev session
declare global {
  // eslint-disable-next-line no-var
  var __mediflow_db: {
    clinics: Clinic[];
    services: Service[];
    patients: Patient[];
    appointments: Appointment[];
    payments: Payment[];
    visits: Visit[];
    prescriptions: Prescription[];
    queue: QueueItem[];
    attachments: MedicalAttachment[];
    messages: WhatsAppMessage[];
    sessions: Record<string, ConversationSession>;
  } | undefined;
}

function initDb() {
  if (global.__mediflow_db) return global.__mediflow_db;

  global.__mediflow_db = {
    clinics: [
      {
        id: "clinic-1",
        name: "عيادة د. أحمد الراوي التخصصية",
        doctor_name: "د. أحمد الراوي",
        specialty: "استشاري الأمراض الباطنية والقلب",
        phone: "07700000001",
        email: "dr.ahmed@mediflow.iq",
        address: "بغداد - المنصور - شارع 14 رمضان (قرب ساحة الرواد)",
        currency: "IQD",
        created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
      },
      {
        id: "clinic-2",
        name: "مركز د. سارة العبيدي للسونار",
        doctor_name: "د. سارة العبيدي",
        specialty: "أخصائية السونار والأشعة التشخيصية",
        phone: "+9647722220000",
        email: "dr.sara@mediflow.iq",
        address: "بغداد - المنصور - شارع 14 رمضان",
        currency: "IQD",
        created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
      },
      {
        id: "clinic-3",
        name: "عيادة د. حيدر الأسدي لطب الأسنان",
        doctor_name: "د. حيدر الأسدي",
        specialty: "طب وجراحة الفم والأسنان والتقويم",
        phone: "+9647733330000",
        email: "dr.haider@mediflow.iq",
        address: "بغداد - الكرادة خارج - ساحة التحريات",
        currency: "IQD",
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
    ],
    services: [
      // Clinic 1 (Dr. Ahmed Al-Rawi - Internal Medicine)
      {
        id: "srv-001",
        clinic_id: "clinic-1",
        name_ar: "كشف عام واستشارة باطنية",
        name_en: "Internal Medicine Consultation",
        duration_minutes: 30,
        price: 25000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-002",
        clinic_id: "clinic-1",
        name_ar: "متابعة ضغط الدم والسكري",
        name_en: "Hypertension & Diabetes Follow-up",
        duration_minutes: 20,
        price: 15000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-003",
        clinic_id: "clinic-1",
        name_ar: "فحص موجات فوق صوتية (سونار)",
        name_en: "Ultrasound Scan",
        duration_minutes: 30,
        price: 40000,
        currency: "IQD",
        is_active: true,
      },

      // Clinic 2 (Dr. Sara Al-Obaidi - Ultrasound)
      {
        id: "srv-101",
        clinic_id: "clinic-2",
        name_ar: "فحص موجات فوق صوتية وبطن وحوض شامل",
        name_en: "Comprehensive Abdomen & Pelvis Ultrasound",
        duration_minutes: 30,
        price: 40000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-102",
        clinic_id: "clinic-2",
        name_ar: "سونار رباعي الأبعاد للجنين (4D)",
        name_en: "4D Fetal Obstetric Ultrasound",
        duration_minutes: 40,
        price: 60000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-103",
        clinic_id: "clinic-2",
        name_ar: "سونار الغدة الدرقية والأنسجة",
        name_en: "Thyroid & Soft Tissue Ultrasound",
        duration_minutes: 25,
        price: 35000,
        currency: "IQD",
        is_active: true,
      },

      // Clinic 3 (Dr. Haider Al-Asadi - Dentistry)
      {
        id: "srv-201",
        clinic_id: "clinic-3",
        name_ar: "تنظيف أسنان وإزالة جير",
        name_en: "Dental Scaling & Polishing",
        duration_minutes: 45,
        price: 50000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-202",
        clinic_id: "clinic-3",
        name_ar: "حشوة ضوئية تجميلية",
        name_en: "Composite Aesthetic Filling",
        duration_minutes: 40,
        price: 45000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: "srv-203",
        clinic_id: "clinic-3",
        name_ar: "معالجة جذور وسحب عصب",
        name_en: "Root Canal Treatment",
        duration_minutes: 60,
        price: 80000,
        currency: "IQD",
        is_active: true,
      },
    ],
    patients: [
      // Clinic 1 Patients
      {
        id: "pat-001",
        clinic_id: "clinic-1",
        patient_number: "P-1001",
        full_name: "علي حسن الكرخي",
        phone: "+9647711112222",
        email: "ali.karhi@example.test",
        date_of_birth: "1988-04-12",
        gender: "male",
        preferred_language: "ar",
        whatsapp_consent: true,
        admin_notes: "يعاني من ضغط الدم المرتفع - كشف دوري",
        created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
      {
        id: "pat-002",
        clinic_id: "clinic-1",
        patient_number: "P-1002",
        full_name: "مصطفى جاسم الجبوري",
        phone: "+9647711113333",
        email: "mustafa.j@example.test",
        date_of_birth: "1982-11-20",
        gender: "male",
        preferred_language: "ar",
        whatsapp_consent: true,
        admin_notes: "مريض سكري نوع 2 ملتزم بالحمية",
        created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      },
      {
        id: "pat-003",
        clinic_id: "clinic-1",
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

      // Clinic 2 Patients
      {
        id: "pat-101",
        clinic_id: "clinic-2",
        patient_number: "P-2001",
        full_name: "مريم أحمد البياتي",
        phone: "+9647722223333",
        email: "maryam.bayati@example.test",
        date_of_birth: "1995-09-25",
        gender: "female",
        preferred_language: "ar",
        whatsapp_consent: true,
        admin_notes: "متابعة سونار حمل في الثلث الثاني",
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      },
      {
        id: "pat-102",
        clinic_id: "clinic-2",
        patient_number: "P-2002",
        full_name: "نور الهدى التميمي",
        phone: "+9647722224444",
        email: "noor.tamimi@example.test",
        date_of_birth: "1991-03-14",
        gender: "female",
        preferred_language: "ar",
        whatsapp_consent: true,
        admin_notes: "سونار الغدة الدرقية الدوري",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },

      // Clinic 3 Patients
      {
        id: "pat-201",
        clinic_id: "clinic-3",
        patient_number: "P-3001",
        full_name: "عمر كمال الدليمي",
        phone: "+9647733335555",
        email: "omar.dulaimi@example.test",
        date_of_birth: "1993-07-08",
        gender: "male",
        preferred_language: "ar",
        whatsapp_consent: true,
        admin_notes: "يعاني من حساسية الأسنان الباردة",
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: "pat-202",
        clinic_id: "clinic-3",
        patient_number: "P-3002",
        full_name: "زينب عبد الكريم",
        phone: "+9647733336666",
        email: "zainab.k@example.test",
        date_of_birth: "1998-12-03",
        gender: "female",
        preferred_language: "ar",
        whatsapp_consent: true,
        admin_notes: "جلسة تلميع وتنظيف أسنان سداسية",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    appointments: [
      // Clinic 1 Appointments
      {
        id: "apt-001",
        clinic_id: "clinic-1",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        patient_phone: "+9647711112222",
        service_id: "srv-001",
        service_name: "كشف عام واستشارة باطنية",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 1800000).toISOString(),
        duration_minutes: 30,
        status: "confirmed",
        booking_source: "whatsapp",
        notes: "حجز اليوم عبر المساعد الذكي",
      },
      {
        id: "apt-002",
        clinic_id: "clinic-1",
        patient_id: "pat-002",
        patient_name: "مصطفى جاسم الجبوري",
        patient_phone: "+9647711113333",
        service_id: "srv-002",
        service_name: "متابعة ضغط الدم والسكري",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 1200000).toISOString(),
        duration_minutes: 20,
        status: "confirmed",
        booking_source: "dashboard",
        notes: "مراجعة اليوم الدورية للتحاليل",
      },
      {
        id: "apt-003",
        clinic_id: "clinic-1",
        patient_id: "pat-003",
        patient_name: "John Doe",
        patient_phone: "+9647733334444",
        service_id: "srv-003",
        service_name: "تخطيط قلب كهربائي (ECG)",
        start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
        end_time: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString(),
        duration_minutes: 30,
        status: "pending",
        booking_source: "dashboard",
        notes: "موعد قادم بعد يومين",
      },

      // Clinic 2 Appointments
      {
        id: "apt-101",
        clinic_id: "clinic-2",
        patient_id: "pat-101",
        patient_name: "مريم أحمد البياتي",
        patient_phone: "+9647722223333",
        service_id: "srv-101",
        service_name: "فحص سونار بطن وحوض شامل",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 1800000).toISOString(),
        duration_minutes: 30,
        status: "confirmed",
        booking_source: "dashboard",
        notes: "سونار اليوم",
      },
      {
        id: "apt-102",
        clinic_id: "clinic-2",
        patient_id: "pat-102",
        patient_name: "نور الهدى التميمي",
        patient_phone: "+9647722224444",
        service_id: "srv-103",
        service_name: "سونار الغدة الدرقية والأنسجة",
        start_time: new Date(Date.now() + 86400000 * 3).toISOString(),
        end_time: new Date(Date.now() + 86400000 * 3 + 1500000).toISOString(),
        duration_minutes: 25,
        status: "pending",
        booking_source: "whatsapp",
        notes: "حجز عبر واتساب بعد 3 أيام",
      },

      // Clinic 3 Appointments
      {
        id: "apt-201",
        clinic_id: "clinic-3",
        patient_id: "pat-201",
        patient_name: "عمر كمال الدليمي",
        patient_phone: "+9647733335555",
        service_id: "srv-201",
        service_name: "تنظيف أسنان وإزالة التكلسات",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 2700000).toISOString(),
        duration_minutes: 45,
        status: "confirmed",
        booking_source: "dashboard",
        notes: "جلسة اليوم",
      },
    ],
    payments: [
      // Clinic 1 Payments
      {
        id: "pay-001",
        clinic_id: "clinic-1",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        appointment_id: "apt-001",
        amount: 25000,
        currency: "IQD",
        payment_method: "cash",
        payment_date: new Date().toISOString(),
        reference_number: "REC-9001",
        notes: "دفعة كشف باطنية كاملة",
      },
      // Clinic 2 Payments
      {
        id: "pay-101",
        clinic_id: "clinic-2",
        patient_id: "pat-101",
        patient_name: "مريم أحمد البياتي",
        appointment_id: "apt-101",
        amount: 40000,
        currency: "IQD",
        payment_method: "cash",
        payment_date: new Date().toISOString(),
        reference_number: "REC-9101",
        notes: "دفعة فحص سونار بطن وحوض",
      },
      // Clinic 3 Payments
      {
        id: "pay-201",
        clinic_id: "clinic-3",
        patient_id: "pat-201",
        patient_name: "عمر كمال الدليمي",
        appointment_id: "apt-201",
        amount: 50000,
        currency: "IQD",
        payment_method: "card",
        payment_date: new Date().toISOString(),
        reference_number: "REC-9201",
        notes: "تنظيف أسنان - دفعة ببطاقة ماستركارد",
      },
    ],
    visits: [
      // Clinic 1 Visits
      {
        id: "vis-001",
        clinic_id: "clinic-1",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        doctor_name: "د. أحمد الراوي",
        service_name: "كشف عام واستشارة باطنية",
        visit_date: new Date(Date.now() - 86400000 * 3).toISOString(),
        diagnosis: "التهاب خفيف في القصبات الهوائية مع ارتفاع طفيف في ضغط الدم",
        clinical_notes: "تم فحص الصدر والضغط. يُنصح بالراحة والإكثار من السوائل ومراجعة بعد 5 أيام.",
        prescription: "Amoxicillin 500mg (3 times/day) + Paracetamol 500mg",
        follow_up_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
      },
      // Clinic 2 Visits
      {
        id: "vis-101",
        clinic_id: "clinic-2",
        patient_id: "pat-101",
        patient_name: "مريم أحمد البياتي",
        doctor_name: "د. سارة العبيدي",
        service_name: "فحص سونار بطن وحوض شامل",
        visit_date: new Date(Date.now() - 86400000 * 10).toISOString(),
        diagnosis: "فحص روتيني سليم للبطن والحوض والحمل في وضع طبيعي ممتاز",
        clinical_notes: "نبضات قلب الجنين 142 نبضة/دقيقة، وحركة الجنين ممتازة وحجم المشيمة سليم.",
        prescription: "حمض الفوليك + كالسيوم ومكملات حديد غذائية",
      },
      // Clinic 3 Visits
      {
        id: "vis-201",
        clinic_id: "clinic-3",
        patient_id: "pat-201",
        patient_name: "عمر كمال الدليمي",
        doctor_name: "د. حيدر الأسدي",
        service_name: "تنظيف أسنان وإزالة التكلسات",
        visit_date: new Date(Date.now() - 86400000 * 6).toISOString(),
        diagnosis: "تراكم جير وتكلسات لثوية متوسطة في الفك السفلي",
        clinical_notes: "تم إجراء تقليح عميق وتلميع الأسنان وتطبيق الفلورايد.",
        prescription: "غسول فم كلورهيكسيدين 0.12% مرتين يومياً لمدة أسبوع",
        follow_up_date: new Date(Date.now() + 86400000 * 180).toISOString().slice(0, 10),
      },
    ],
    messages: [
      {
        id: "msg-001",
        clinic_id: "clinic-1",
        direction: "inbound",
        sender_phone: "+9647711112222",
        receiver_phone: "+9647700000001",
        content: "مرحبا دكتور، أريد أحجز موعد كشف باچر",
        status: "read",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "msg-002",
        clinic_id: "clinic-1",
        direction: "outbound",
        sender_phone: "+9647700000001",
        receiver_phone: "+9647711112222",
        content: "أهلاً وسهلاً بك في عيادة د. أحمد الراوي! المواعيد المتاحة غداً: 10:00 صباحاً أو 11:30 صباحاً. أيهما يناسبك؟",
        status: "delivered",
        created_at: new Date(Date.now() - 3600000 * 3 + 10000).toISOString(),
      },
    ],
    prescriptions: [
      {
        id: "rx-001",
        clinic_id: "clinic-1",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        patient_phone: "+9647711112222",
        doctor_name: "د. أحمد الراوي",
        diagnosis: "التهاب حاد في القصبات مع ارتفاع ضغط الدم",
        items: [
          {
            medication_name: "Amoxicillin / Clavulanate (Augmentin) 1g",
            dosage: "قرص واحد",
            frequency: "مرتين يومياً (كل 12 ساعة)",
            duration: "لمدة 7 أيام",
            instructions: "يؤخذ في بداية الوجبة لتفادي اضطراب المعدة",
          },
          {
            medication_name: "Paracetamol 500mg",
            dosage: "قرص أو قرصين",
            frequency: "عند اللزوم (بين الجرعات 6 ساعات)",
            duration: "لمدة 5 أيام",
            instructions: "لخفض الحرارة وتسكين الآلام الصدرية",
          },
          {
            medication_name: "Amlodipine 5mg",
            dosage: "قرص واحد",
            frequency: "مرة واحدة يومياً صباحاً",
            duration: "علاج مستمر شهر",
            instructions: "مع قياس ضغط الدم وتسجيل القراءات اليومية",
          },
        ],
        general_advice: "الراحة التامة في الفراش، الإكثار من السوائل الدافئة والشوربة، والامتناع عن المجهود الشاق والملح.",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "rx-101",
        clinic_id: "clinic-2",
        patient_id: "pat-101",
        patient_name: "مريم أحمد البياتي",
        patient_phone: "+9647722223333",
        doctor_name: "د. سارة العبيدي",
        diagnosis: "فحص سونار حمل روتيني في الثلث الثاني - سليم",
        items: [
          {
            medication_name: "Folic Acid 5mg",
            dosage: "قرص واحد",
            frequency: "مرة واحدة يومياً",
            duration: "طوال فترة الحمل",
            instructions: "يؤخذ بعد وجبة الإفطار",
          },
          {
            medication_name: "Ferrous Sulfate + Vitamin C",
            dosage: "كبسولة واحدة",
            frequency: "مرة واحدة يومياً",
            duration: "لمدة شهرين",
            instructions: "مع عصير برتقال ويفضل تجنب الشاي ساعتين بعده",
          },
        ],
        general_advice: "تغذية متوازنة، شرب 2-3 لتر ماء يومياً، ومراجعة دورية للسونار بعد 4 أسابيع.",
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ],
    queue: [
      // Clinic 1 Queue (Today)
      {
        id: "q-001",
        clinic_id: "clinic-1",
        queue_number: 1,
        appointment_id: "apt-001",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        patient_phone: "+9647711112222",
        service_name: "كشف عام واستشارة باطنية",
        doctor_name: "د. أحمد الراوي",
        status: "in_consultation",
        arrival_time: "09:45",
        date: new Date().toISOString().slice(0, 10),
        is_walk_in: false,
        called_at: "10:05",
      },
      {
        id: "q-002",
        clinic_id: "clinic-1",
        queue_number: 2,
        appointment_id: "apt-002",
        patient_id: "pat-002",
        patient_name: "مصطفى جاسم الجبوري",
        patient_phone: "+9647711113333",
        service_name: "متابعة ضغط الدم والسكري",
        doctor_name: "د. أحمد الراوي",
        status: "waiting",
        arrival_time: "10:15",
        date: new Date().toISOString().slice(0, 10),
        is_walk_in: false,
      },
      {
        id: "q-003",
        clinic_id: "clinic-1",
        queue_number: 3,
        patient_id: "pat-003",
        patient_name: "John Doe",
        patient_phone: "+9647733334444",
        service_name: "تخطيط قلب كهربائي (ECG)",
        doctor_name: "د. أحمد الراوي",
        status: "waiting",
        arrival_time: "10:30",
        date: new Date().toISOString().slice(0, 10),
        is_walk_in: true,
        priority: "urgent",
      },

      // Clinic 2 Queue
      {
        id: "q-101",
        clinic_id: "clinic-2",
        queue_number: 1,
        appointment_id: "apt-101",
        patient_id: "pat-101",
        patient_name: "مريم أحمد البياتي",
        patient_phone: "+9647722223333",
        service_name: "فحص سونار بطن وحوض شامل",
        doctor_name: "د. سارة العبيدي",
        status: "in_consultation",
        arrival_time: "10:00",
        date: new Date().toISOString().slice(0, 10),
        is_walk_in: false,
        called_at: "10:10",
      },
      {
        id: "q-102",
        clinic_id: "clinic-2",
        queue_number: 2,
        patient_id: "pat-102",
        patient_name: "نور الهدى التميمي",
        patient_phone: "+9647722224444",
        service_name: "سونار الغدة الدرقية والأنسجة",
        doctor_name: "د. سارة العبيدي",
        status: "waiting",
        arrival_time: "10:20",
        date: new Date().toISOString().slice(0, 10),
        is_walk_in: true,
      },

      // Clinic 3 Queue
      {
        id: "q-201",
        clinic_id: "clinic-3",
        queue_number: 1,
        appointment_id: "apt-201",
        patient_id: "pat-201",
        patient_name: "عمر كمال الدليمي",
        patient_phone: "+9647733335555",
        service_name: "تنظيف أسنان وإزالة التكلسات",
        doctor_name: "د. حيدر الأسدي",
        status: "in_consultation",
        arrival_time: "11:00",
        date: new Date().toISOString().slice(0, 10),
        is_walk_in: false,
        called_at: "11:15",
      },
    ],
    attachments: [
      {
        id: "att-001",
        clinic_id: "clinic-1",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        file_name: "ECG_Heart_Scan_Ali.pdf",
        file_type: "application/pdf",
        file_size_kb: 420,
        category: "report",
        file_url: "/placeholder-ecg.pdf",
        notes: "تخطيط قلب كهربائي أولي يظهر انتظام دقات القلب مع ارتفاع ضغط طفيف",
        uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "att-002",
        clinic_id: "clinic-1",
        patient_id: "pat-001",
        patient_name: "علي حسن الكرخي",
        file_name: "Chest_XRay_Digital.png",
        file_type: "image/png",
        file_size_kb: 1250,
        category: "xray",
        file_url: "/placeholder-xray.png",
        notes: "أشعة سينية للصدر تبين سلامة الرئتين من أي ارتشاحات",
        uploaded_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "att-101",
        clinic_id: "clinic-2",
        patient_id: "pat-101",
        patient_name: "مريم أحمد البياتي",
        file_name: "Sonar_4D_Baby_Scan.png",
        file_type: "image/png",
        file_size_kb: 2180,
        category: "sonar",
        file_url: "/placeholder-sonar.png",
        notes: "سونار رباعي الأبعاد للجنين في الأسبوع 22 - تشريح طبيعي وحجم سليم",
        uploaded_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ],
    sessions: {},
  };

  return global.__mediflow_db;
}

export const db = initDb();

/**
 * Extracts clinic ID from incoming request headers, query parameters, or cookies.
 * Defaults to "clinic-1" if unspecified.
 */
export function getRequestClinicId(request: Request): string {
  try {
    const url = new URL(request.url);
    const queryClinic = url.searchParams.get("clinic_id");
    if (queryClinic) return queryClinic;

    const headerClinic = request.headers.get("x-clinic-id");
    if (headerClinic) return headerClinic;

    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/mediflow_clinic_id=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  } catch {
    // URL parse fallback
  }

  return "clinic-1";
}
