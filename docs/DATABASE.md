# MediFlow CRM — دليل قاعدة البيانات (Database Schema)

## 1. مخطط قاعدة البيانات (PostgreSQL)
تستخدم المنصة PostgreSQL كمصدر أساسي وموثوق للبيانات مع UUIDs ومفاتيح أجنبية وقيود سلامة البيانات.

### الجداول الأساسية (Core Tables):
1. **`clinics`**: بيانات العيادة (الاسم، العنوان، الهاتف، المنطقة الزمنية، العملة).
2. **`profiles`**: الملفات الشخصية للمستخدمين مرتبطة بـ `auth.users`.
3. **`clinic_memberships`**: صلاحيات المستخدمين (`owner`, `admin`, `doctor`, `receptionist`).
4. **`clinic_settings`**: إعدادات التذكيرات وربط الواتساب ولغة الواجهة.
5. **`business_hours`**: أوقات الدوام الرسمي وساعات الاستراحة لكل يوم.
6. **`services`**: قائمة الخدمات الطبية، المدة بالدقائق، والأسعار.
7. **`patients`**: سجل المرضى مع رقم الملف، الهاتف، الجنس، وتأكيد موافقة الواتساب.
8. **`appointments`**: المواعيد مع وقت البدء والانتهاء، الطبيب المعالج، الحالة، ومصدر الحجز.
9. **`payments`**: المقبوضات المالية والإيصالات وطرق الدفع.
10. **`visits`**: السجلات السريرية والتشخيصات والوصفات الطبية المحمية.
11. **`whatsapp_conversations` & `whatsapp_messages`**: سجل المحادثات وحالة تسليم الرسائل.
12. **`notification_jobs`**: طابور التذكيرات المجدولة المقاوم للتكرار.
13. **`audit_logs`**: سجل تتبع العمليات الإدارية الحساسة.

## 2. تنفيذ الترحيل (Migrations)
يتم تطبيق الترحيل الموجود في `supabase/migrations/001_initial_schema.sql` عبر واجهة Supabase SQL Editor أو CLI:
```bash
supabase db push
# أو
psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
```
ثم حقن البيانات الأولية الآمنة:
```bash
psql $DATABASE_URL -f supabase/seed.sql
```
