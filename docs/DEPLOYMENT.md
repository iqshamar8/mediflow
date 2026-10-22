# MediFlow CRM — دليل النشر للإنتاج (Deployment Guide)

## 1. البنية المستهدفة للإنتاج
- **واجهة وتطبيق Next.js:** يتم النشر على منصة تدعم Node.js / Serverless مثل Vercel أو AWS Amplify أو Railway أو VPS مخصص.
- **قاعدة البيانات والمصادقة:** Supabase (PostgreSQL 15+ مع Auth و RLS).
- **المهام المجدولة (Cron):** Vercel Cron Jobs أو GitHub Actions أو AWS EventBridge لاستدعاء `/api/cron/reminders`.
- **نطاق محمي بشهادة SSL (HTTPS):** إلزامي لاستقبال Webhooks من خوادم Meta.

## 2. خطوات النشر خطوة بخطوة

### الخطوة 1: إنشاء وتكوين مشروع Supabase
1. أنشئ مشروعاً جديداً في [Supabase](https://supabase.com).
2. افتح SQL Editor ونفذ ملف `supabase/migrations/001_initial_schema.sql`.
3. انسخ `Project URL` و `anon public key` و `service_role key`.

### الخطوة 2: تهيئة البيئة في Vercel أو المنصة المستضيفة
أضف المتغيرات التالية:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_ENABLED` (true عند الربط الفعلي)
- `WHATSAPP_PROVIDER` (meta)
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `CRON_SECRET`
- `APP_BASE_URL`

### الخطوة 3: بناء وتشغيل المشروع
```bash
npm run build
npm run start
```

### الخطوة 4: التحقق من صحة النظام
افتح الرابط وفحص الشاشات:
- لوحة التحكم `/`
- سجل المرضى `/patients`
- جدول المواعيد `/appointments`
- قنوات الواتساب والمحاكي `/whatsapp`
