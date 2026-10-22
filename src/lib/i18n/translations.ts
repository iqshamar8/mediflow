export type Language = "ar" | "en";

export const translations = {
  ar: {
    // General
    appName: "ميديفلو CRM",
    tagline: "منصة إدارة العيادات الطبية وحجوزات الواتساب",
    loading: "جاري التحميل...",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    search: "بحث...",
    actions: "الإجراءات",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    all: "الكل",
    close: "إغلاق",
    confirm: "تأكيد",
    
    // Navigation
    navDashboard: "لوحة التحكم",
    navPatients: "سجل المرضى",
    navAppointments: "المواعيد والجدول",
    navServices: "الخدمات والأسعار",
    navPayments: "المالية والمدفوعات",
    navVisits: "السجلات الطبية",
    navWhatsApp: "واتساب والمساعد الذكي",
    navSettings: "إعدادات العيادة",
    
    // Auth & Roles
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    roleOwner: "مالك العيادة",
    roleAdmin: "مدير النظام",
    roleDoctor: "طبيب معالج",
    roleReceptionist: "موظف استقبال",

    // Dashboard
    totalPatients: "إجمالي المرضى",
    todayAppointments: "مواعيد اليوم",
    confirmedAppointments: "المواعيد المؤكدة",
    totalRevenue: "إجمالي الإيرادات",
    outstandingBalance: "المبالغ المتبقية",
    recentAppointments: "أحدث المواعيد القادمة",
    quickActions: "إجراءات سريعة",
    newPatient: "مريض جديد",
    newAppointment: "حجز موعد جديد",
    recordPayment: "تسجيل دفعة",
    whatsappStatus: "حالة الواتساب",
    whatsappMockActive: "نمط المحاكاة للتطوير (Mock)",

    // Patients
    patientNumber: "رقم الملف",
    patientName: "اسم المريض",
    phoneNumber: "رقم الهاتف",
    dateOfBirth: "تاريخ الميلاد",
    gender: "الجنس",
    genderMale: "ذكر",
    genderFemale: "أنثى",
    preferredLanguage: "اللغة المفضلة",
    whatsappConsent: "موافقة رسائل الواتساب",
    addPatient: "إضافة مريض جديد",
    patientDetails: "تفاصيل المريض",
    noPatientsFound: "لم يتم العثور على مرضى",

    // Appointments
    service: "الخدمة الطبية",
    doctor: "الطبيب",
    dateTime: "التاريخ والوقت",
    duration: "المدة",
    notes: "ملاحظات",
    statusPending: "قيد الانتظار",
    statusConfirmed: "مؤكد",
    statusCompleted: "مكتمل",
    statusCancelled: "ملغي",
    statusNoShow: "لم يحضر",

    // Payments
    amount: "المبلغ",
    paymentMethod: "طريقة الدفع",
    paymentDate: "تاريخ الدفع",
    cash: "نقدي",
    card: "بطاقة مصرفية",
    bankTransfer: "تحويل بنكي",
    receiptNumber: "رقم الإيصال",

    // Services
    serviceNameAr: "اسم الخدمة (عربي)",
    serviceNameEn: "اسم الخدمة (English)",
    price: "السعر",
    durationMinutes: "المدة بالدقائق",
    addService: "إضافة خدمة جديدة",

    // WhatsApp & Bot
    botStatus: "المساعد الآلي الذكي",
    botStatusActive: "يعمل وجاهز للرد",
    botSimulateMessage: "محاكاة رسالة مريض",
    botTestGreeting: "مرحباً، أريد أحجز موعد",
    botSendTest: "إرسال اختبار"
  },
  en: {
    // General
    appName: "MediFlow CRM",
    tagline: "Medical Clinic CRM & WhatsApp Automation Platform",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    search: "Search...",
    actions: "Actions",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    all: "All",
    close: "Close",
    confirm: "Confirm",

    // Navigation
    navDashboard: "Dashboard",
    navPatients: "Patients",
    navAppointments: "Appointments",
    navServices: "Services & Pricing",
    navPayments: "Payments & Ledger",
    navVisits: "Medical Notes",
    navWhatsApp: "WhatsApp & Bot",
    navSettings: "Clinic Settings",

    // Auth & Roles
    login: "Sign In",
    logout: "Sign Out",
    email: "Email",
    password: "Password",
    roleOwner: "Clinic Owner",
    roleAdmin: "Administrator",
    roleDoctor: "Attending Doctor",
    roleReceptionist: "Receptionist",

    // Dashboard
    totalPatients: "Total Patients",
    todayAppointments: "Today's Appointments",
    confirmedAppointments: "Confirmed Bookings",
    totalRevenue: "Total Revenue",
    outstandingBalance: "Outstanding Balance",
    recentAppointments: "Upcoming Appointments",
    quickActions: "Quick Actions",
    newPatient: "New Patient",
    newAppointment: "Book Appointment",
    recordPayment: "Record Payment",
    whatsappStatus: "WhatsApp Status",
    whatsappMockActive: "Development Mock Active",

    // Patients
    patientNumber: "Patient ID",
    patientName: "Patient Name",
    phoneNumber: "Phone Number",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    preferredLanguage: "Preferred Language",
    whatsappConsent: "WhatsApp Notifications",
    addPatient: "Add New Patient",
    patientDetails: "Patient Profile",
    noPatientsFound: "No patients found",

    // Appointments
    service: "Service",
    doctor: "Doctor",
    dateTime: "Date & Time",
    duration: "Duration",
    notes: "Notes",
    statusPending: "Pending",
    statusConfirmed: "Confirmed",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    statusNoShow: "No Show",

    // Payments
    amount: "Amount",
    paymentMethod: "Payment Method",
    paymentDate: "Payment Date",
    cash: "Cash",
    card: "Card",
    bankTransfer: "Bank Transfer",
    receiptNumber: "Receipt #",

    // Services
    serviceNameAr: "Service Name (Arabic)",
    serviceNameEn: "Service Name (English)",
    price: "Price",
    durationMinutes: "Duration (min)",
    addService: "Add New Service",

    // WhatsApp & Bot
    botStatus: "AI WhatsApp Assistant",
    botStatusActive: "Active & Ready",
    botSimulateMessage: "Simulate Patient Message",
    botTestGreeting: "Hello, I want to book an appointment",
    botSendTest: "Send Test"
  }
};

export type TranslationKey = keyof typeof translations.ar;
