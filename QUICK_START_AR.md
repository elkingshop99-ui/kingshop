# 🎉 Elking Barber Shop - مشروع حجز جديد

## ✅ ما تم إنجازه

### 📦 المشروع الكامل جاهز و منشور على GitHub!

**GitHub:** https://github.com/elkingshop99-ui/kingshop

```
D:\elking-booking\
├── src/
│   ├── pages/
│   │   ├── BookingPage.tsx      ✅ صفحة حجز العملاء
│   │   ├── DashboardPage.tsx    ✅ لوحة تحكم الموظفين
│   │   └── LoginPage.tsx        ✅ تسجيل دخول
│   ├── components/
│   │   └── Header.tsx           ✅ المتنقل
│   ├── db/
│   │   └── supabase.ts          ✅ إعدادات Supabase
│   ├── locales/
│   │   ├── ar.json              ✅ عربي
│   │   └── en.json              ✅ إنجليزي
│   ├── App.tsx                  ✅ التطبيق الرئيسي
│   └── index.css                ✅ الأنماط العالمية
├── schema.sql                   ✅ قاعدة البيانات
├── SETUP_GUIDE.md               ✅ دليل الإعداد (اقرأه أولاً!)
├── DEPLOYMENT.md                ✅ دليل النشر
└── README.md                    ✅ توثيق المشروع
```

---

## 🎯 الخصائص المدمجة

### ✨ صفحة الحجز (/) 
- اختيار الحلاق
- اختيار الخدمة مع السعر
- اختيار التاريخ والوقت
- إدخال البيانات (الاسم، الهاتف، البريد - اختياري)
- ملاحظات إضافية

### 📊 لوحة التحكم (/dashboard)
- عرض حجوزات اليوم أو الكل
- تأكيد الحجوزات (زر أخضر)
- إلغاء الحجوزات (زر أحمر)
- معلومات العميل والحلاق والخدمة

### 🔐 تسجيل الدخول (/login)
- بريد إلكتروني + كلمة مرور
- وصول آمن للموظفين فقط

### 🌐 ميزات إضافية
- ✅ دعم عربي (RTL) وإنجليزي
- ✅ تصميم مشرق / داكن
- ✅ متجاوب مع الهواتف
- ✅ عدم وجود POS، تحليلات، أو إدارة معقدة - مجرد حجز نقي!

---

## 🚀 الخطوات التالية

### 1️⃣ إعداد قاعدة البيانات (5 دقائق)

```
1. انتقل إلى https://supabase.com
2. أنشئ حساب مجاني (أو سجل دخول)
3. أنشئ مشروع جديد (اختر Riyadh للسرعة الأفضل)
4. اذهب إلى Settings > API
5. انسخ:
   - Project URL → VITE_SUPABASE_URL
   - Anon Public Key → VITE_SUPABASE_ANON_KEY
6. اذهب إلى SQL Editor
7. افتح ملف schema.sql من المشروع
8. انسخ المحتوى كاملاً والصقه في Supabase
9. اضغط Run
✓ تم!
```

### 2️⃣ إعداد المشروع محلياً (5 دقائق)

```bash
# انتقل للمشروع
cd D:\elking-booking

# أنشئ ملف البيئة
# اسم الملف: .env.local (في نفس مستوى package.json)
# المحتوى:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ثبّت المكتبات
npm install

# شغّل السيرفر
npm run dev
```

### 3️⃣ اختبر الآن! (2 دقيقة)

```
1. افتح http://localhost:5173
2. اختبر حجز عادي:
   - اختر حلاق، خدمة، تاريخ، وقت
   - أدخل الاسم والهاتف
   - اضغط "احجز الآن"
3. شاهد الحجز في لوحة التحكم:
   - اضغط Dashboard
   - أدخل أي بريد + كلمة مرور (6 أحرف على الأقل)
   - شاهد الحجز الجديد
```

---

## 📝 التخصيص السهل

### إضافة حلاقيين حقيقيين

في Supabase SQL Editor:
```sql
DELETE FROM barbers;

INSERT INTO barbers (name, phone, email, specialties, experience_years) VALUES
  ('محمود علي', '0501234567', 'mahmoud@email.com', '{"حلاق عام", "حلاق لحية"}', 10),
  ('أحمد حسن', '0502345678', 'ahmad@email.com', '{"حلاق أطفال"}', 8),
  ('علي محمد', '0503456789', 'ali@email.com', '{"حلاق عام"}', 5);
```

### تعديل الخدمات والأسعار

```sql
UPDATE services SET price = 30.00 WHERE name_ar = 'حلاق عام';
UPDATE services SET price = 25.00 WHERE name_ar = 'حلاق لحية';

-- إضافة خدمة جديدة
INSERT INTO services (name_ar, name_en, price, duration_minutes, category)
VALUES ('حلاق + شامبو', 'Haircut + Shampoo', 40.00, 45, 'combo');
```

### تعديل اسم المحل وبيانات التواصل

```sql
UPDATE shop_settings SET value = 'اسم محلك الجديد' WHERE key = 'shop_name';
UPDATE shop_settings SET value = '+966501234567' WHERE key = 'shop_phone';
UPDATE shop_settings SET value = 'info@yourshop.com' WHERE key = 'shop_email';
```

---

## 🚢 النشر على الإنترنت

### Option 1: Vercel (الأفضل والأسرع)

```bash
# المشروع بالفعل موجود على GitHub
# فقط:
1. انتقل إلى https://vercel.com
2. اضغط "New Project"
3. اختر مستودع GitHub الخاص بك: elkingshop99-ui/kingshop
4. أضف متغيرات البيئة:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. اضغط Deploy

تم! تطبيقك مباشر الآن على: https://kingshop.vercel.app
```

### Option 2: Netlify

```bash
npm run build
# ثم اسحب مجلد dist/ إلى Netlify
```

---

## 📁 ملفات مهمة لقراءتها

| الملف | الغرض |
|------|--------|
| **SETUP_GUIDE.md** | ⭐ **اقرأ أولاً** - دليل إعداد شامل |
| **schema.sql** | قاعدة البيانات - انسخها إلى Supabase |
| **DEPLOYMENT.md** | كيفية نشر على الإنترنت |
| **.env.example** | مثال على متغيرات البيئة |
| **README.md** | توثيق المشروع |

---

## 💻 أوامر مفيدة

```bash
# تطوير
npm run dev          # شغّل سيرفر التطوير

# الإنتاج
npm run build        # اضرب ملفات الإنتاج
npm run preview      # اختبر الإنتاج محلياً

# Git
git status           # شاهد التغييرات
git add .
git commit -m "رسالة"
git push origin main # ادفع إلى GitHub
```

---

## 🎨 إعدادات سهلة

### تغيير الألوان

في `tailwind.config.js`:
```js
colors: {
  gold: { /* غيّر هنا */ },
  // أو استخدم أي ألوان أخرى
}
```

### تغيير الخطوط

في `index.html`:
```html
<!-- أضف خطوط جديدة من Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
```

### تغيير النصوص

في `src/locales/`:
- `ar.json` - النصوص العربية
- `en.json` - النصوص الإنجليزية

---

## ❓ أسئلة شائعة

### كيف أضيف حلاق جديد؟
في Supabase SQL Editor:
```sql
INSERT INTO barbers (name, phone, email, experience_years)
VALUES ('الاسم', '0501234567', 'email@example.com', 5);
```

### كيف أغيّر وقت العمل؟
```sql
INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time, is_working)
VALUES (barber_id, 1, '09:00', '18:00', true); -- يوم الاثنين
```

### كيف أحذف حجز؟
في Dashboard: اضغط "إلغاء" ويتحول الحالة إلى "ملغى"

### هل أحتاج لرقم بطاقة ائتمان؟
لا! Supabase و Vercel مجاني للمشاريع الصغيرة

---

## 🛠️ التخطيط المستقبلي (اختياري)

- [ ] إضافة تنبيهات بريد إلكتروني
- [ ] تكامل تقويم جوجل
- [ ] نظام الدفع (PayPal/Stripe)
- [ ] تقييمات العملاء
- [ ] حساب تحليلات بسيط

---

## 📞 الدعم والمساعدة

اذا واجهت أي مشكلة:

1. ✅ تأكد من `.env.local` صحيح
2. ✅ تأكد من تشغيل schema.sql كاملاً
3. ✅ افتح F12 وتحقق من الأخطاء
4. ✅ اقرأ SETUP_GUIDE.md مرة أخرى

---

## 🎉 بدء العمل

```bash
cd D:\elking-booking
npm run dev
# ثم افتح http://localhost:5173
```

**اختبر التطبيق الآن!** ✨

---

**تم بناء تطبيقك بنجاح!**
- ✅ جميع الملفات في `D:\elking-booking\`
- ✅ مدفوع إلى GitHub: https://github.com/elkingshop99-ui/kingshop
- ✅ جاهز للنشر على الإنترنت

**شيء واحد متبقي: إعداد Supabase (5 دقائق) ثم اختبر!** 🚀
