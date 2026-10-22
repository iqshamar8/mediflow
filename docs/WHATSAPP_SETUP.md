# MediFlow CRM — دليل إعداد WhatsApp Business Platform Cloud API

## 1. المتطلبات
- حساب مطور Meta Developer Account.
- تطبيق Meta مع تفعيل منتج WhatsApp.
- رقم هاتف مخصص للعيادة ومعرف هاتف (Phone Number ID).
- System User Access Token دائم.

## 2. المتغيرات البيئية المطلوبة
قم بتعيين المتغيرات في ملف `.env.local` أو منصة الاستضافة:
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=1092837465...
WHATSAPP_VERIFY_TOKEN=your_secure_verify_token_here
WHATSAPP_APP_SECRET=a8b9c0...
WHATSAPP_API_VERSION=v20.0
```

## 3. إعداد الويب هوك (Webhook Configuration)
1. في لوحة تحكم Meta Developers، انتقل إلى WhatsApp > Configuration.
2. ضع رابط الـ Callback URL:
   `https://your-domain.com/api/whatsapp/webhook`
3. أدخل رمز التحقق `Verify Token` مطابقاً لقيمة `WHATSAPP_VERIFY_TOKEN`.
4. اشترك في أحداث: `messages` و `message_status`.

## 4. وضع المحاكاة للتطوير (Mock Mode)
في بيئة التطوير، يتم تفعيل `WHATSAPP_PROVIDER=mock`. يتيح لك محاكي الواتساب المدمج في صفحة `/whatsapp` إرسال واستقبال رسائل المرضى وتأكيد الحجوزات الآلية فورياً دون الحاجة إلى بيانات اعتماد Meta.
